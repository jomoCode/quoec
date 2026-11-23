"""Seed the built-in quoec content (data/portfolio.json + its media) into citadel-api's database.

What it does, per development in data/portfolio.json:
  1. Uploads each local image (public/..., src/assets/...) to the public Supabase bucket "marketing"
     at developments/<slug>/<file>. Re-runs overwrite the same path, so nothing is duplicated.
  2. Upserts a row in public.developments for the `quoec` site, keyed on (site_id, slug),
     with image fields pointing at the bucket's public URLs.

Images only: videos in portfolio.json are not seeded, and featured_video is left empty.

Existing rows: skipped unless --update-existing (keeps estate_id; never deletes anything).
--only <slug> ... limits the run to those developments.

Usage (reads quoec/.env.development unless --env is given):
  pip install "psycopg[binary]"
  python scripts/seed-production.py                     # dry run: prints the plan, writes nothing
  python scripts/seed-production.py --apply             # upload media + insert missing rows
  python scripts/seed-production.py --apply --update-existing

Needs SUPABASE_URL, SUPABASE_SECRET_KEY and DATABASE_URL for the SAME Supabase project.
"""

from __future__ import annotations

import argparse
import json
import mimetypes
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

import psycopg

ROOT = Path(__file__).resolve().parent.parent
BUCKET = "marketing"
BUCKET_MAX_BYTES = 10 * 1024 * 1024
IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
STATUS = {"Upcoming": "upcoming", "Ongoing": "ongoing", "Completed": "completed"}


def read_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    for line in path.read_text(encoding="utf-8").splitlines():
        m = re.match(r"^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$", line)
        if m and not line.lstrip().startswith("#"):
            env[m.group(1)] = m.group(2).strip('"').strip("'")
    return env


def project_ref(value: str) -> str | None:
    m = re.search(r"https://([a-z0-9]{20})\.supabase\.co", value) or re.search(r"postgres\.([a-z0-9]{20})[:@]", value)
    return m.group(1) if m else None


def local_file(url_path: str) -> Path | None:
    """'/media/x.jpg' -> public/media/x.jpg; '/src/assets/x.jpg' -> src/assets/x.jpg."""
    if not url_path.startswith("/"):
        return None
    rel = url_path.lstrip("/")
    for candidate in (ROOT / "public" / rel, ROOT / rel):
        if candidate.is_file():
            return candidate
    return None


class Storage:
    def __init__(self, base_url: str, secret: str):
        self.base = base_url.rstrip("/") + "/storage/v1"
        self.headers = {"apikey": secret, "Authorization": f"Bearer {secret}"}

    def check(self) -> None:
        req = urllib.request.Request(f"{self.base}/bucket/{BUCKET}", headers=self.headers)
        with urllib.request.urlopen(req, timeout=30) as res:
            info = json.load(res)
        if not info.get("public"):
            raise SystemExit(f'Bucket "{BUCKET}" is not public')

    def upload(self, path: str, data: bytes, content_type: str) -> None:
        req = urllib.request.Request(
            f"{self.base}/object/{BUCKET}/{path}",
            data=data,
            method="POST",
            headers={**self.headers, "Content-Type": content_type, "x-upsert": "true", "cache-control": "86400"},
        )
        try:
            urllib.request.urlopen(req, timeout=120).close()
        except urllib.error.HTTPError as e:
            raise SystemExit(f"Upload failed for {path}: {e.code} {e.read().decode(errors='replace')}") from e

    def public_url(self, path: str) -> str:
        return f"{self.base}/object/public/{BUCKET}/{path}"


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--env", default=str(ROOT / ".env.development"))
    ap.add_argument("--apply", action="store_true", help="actually upload and write (default: dry run)")
    ap.add_argument("--update-existing", action="store_true", help="overwrite rows whose slug already exists")
    ap.add_argument("--website-id", default="quoec")
    ap.add_argument("--only", nargs="+", metavar="SLUG", help="seed only these development slugs")
    args = ap.parse_args()

    env = read_env(Path(args.env))
    missing = [k for k in ("SUPABASE_URL", "SUPABASE_SECRET_KEY", "DATABASE_URL") if not env.get(k)]
    if missing:
        raise SystemExit(f"Missing in {args.env}: {', '.join(missing)}")
    db_url = env["DATABASE_URL"].replace("postgresql+psycopg://", "postgresql://")
    refs = {project_ref(env["SUPABASE_URL"]), project_ref(db_url)}
    if len(refs) != 1 or None in refs:
        raise SystemExit(f"SUPABASE_URL and DATABASE_URL point at different projects: {refs}")
    ref = refs.pop()

    storage = Storage(env["SUPABASE_URL"], env["SUPABASE_SECRET_KEY"])
    try:
        storage.check()
    except urllib.error.HTTPError as e:
        msg = f"SUPABASE_SECRET_KEY rejected by project {ref} ({e.code}) - is it this project's key?"
        if args.apply:
            raise SystemExit(msg) from e
        print(f"WARNING: {msg}\n")

    devs = json.loads((ROOT / "data" / "portfolio.json").read_text(encoding="utf-8"))["developments"]
    if args.only:
        unknown = set(args.only) - {d["id"] for d in devs}
        if unknown:
            raise SystemExit(f"Not in portfolio.json: {', '.join(sorted(unknown))}")
        devs = [d for d in devs if d["id"] in args.only]
    mode = "APPLY" if args.apply else "DRY RUN"
    print(f"[{mode}] project {ref}, site '{args.website_id}', {len(devs)} developments\n")

    with psycopg.connect(db_url, connect_timeout=20) as conn:
        site = conn.execute("select id from sites where website_id = %s and is_active", (args.website_id,)).fetchone()
        if not site:
            raise SystemExit(f"No active site '{args.website_id}' in the database")
        site_id = site[0]
        existing = {r[0] for r in conn.execute("select slug from developments where site_id = %s", (site_id,))}

        for d in devs:
            slug = d["id"]
            action = "update" if slug in existing else "insert"
            if slug in existing and not args.update_existing:
                print(f"- {slug}: exists, skipped (use --update-existing to overwrite)")
                continue

            uploaded: dict[str, str] = {}

            def media_url(src: str) -> str:
                if not src:
                    return ""
                if src.startswith(("http://", "https://")):
                    return src
                if src in uploaded:
                    return uploaded[src]
                f = local_file(src)
                if f is None:
                    raise SystemExit(f"{slug}: media file not found for {src}")
                ctype = mimetypes.guess_type(f.name)[0] or "application/octet-stream"
                if ctype not in IMAGE_TYPES or f.stat().st_size > BUCKET_MAX_BYTES:
                    raise SystemExit(f"{slug}: {f.name} ({ctype}, {f.stat().st_size} bytes) not allowed in bucket")
                path = f"developments/{slug}/{f.name}"
                print(f"    upload {f.relative_to(ROOT)} -> {BUCKET}/{path} ({f.stat().st_size // 1024} KB)")
                if args.apply:
                    storage.upload(path, f.read_bytes(), ctype)
                uploaded[src] = storage.public_url(path)
                return uploaded[src]

            print(f"- {slug}: {action}")
            featured = media_url(d.get("featuredImage", ""))
            gallery = [media_url(g) for g in d.get("galleryImages", [])]
            if not featured:
                print("    (no image in portfolio.json)")

            row = {
                "site_id": site_id,
                "slug": slug,
                "name": d["name"],
                "location": d.get("location", ""),
                "description": d.get("description", ""),
                "status": STATUS[d["status"]],
                "featured": bool(d.get("featured")),
                "display_order": int(d.get("displayOrder", 0)),
                "is_coming_soon": bool(d.get("isComingSoon")),
                "external_url": d.get("externalUrl", ""),
                "featured_image": featured,
                "gallery_images": gallery,
                "featured_video": None,  # images only
                "residence_summary": d.get("residenceSummary") or None,
                "is_published": True,
            }
            if args.apply:
                cols = list(row)
                updates = ", ".join(f"{c} = excluded.{c}" for c in cols if c not in ("site_id", "slug"))
                conn.execute(
                    f"insert into developments ({', '.join(cols)}) values ({', '.join(['%s'] * len(cols))}) "
                    f"on conflict (site_id, slug) do update set {updates}, updated_at = now()",
                    list(row.values()),
                )
        if args.apply:
            conn.commit()
            print("\nCommitted.")
        else:
            conn.rollback()
            print("\nDry run - nothing was uploaded or written. Re-run with --apply.")


if __name__ == "__main__":
    sys.exit(main())
