import type { Development, DevelopmentStatus } from "../types/property";
import seed from "../../data/portfolio.json";
import { apiFetch, hasApi } from "./api";

/** `GET /api/v1/public/developments` item (citadel-api `PublicDevelopment`). */
interface PublicDevelopment {
  slug: string;
  name: string;
  location: string;
  description: string;
  status: "upcoming" | "ongoing" | "completed";
  featured: boolean;
  display_order: number;
  is_coming_soon: boolean;
  external_url: string;
  featured_image: string;
  gallery_images: string[];
  featured_video: string | null;
  residence_summary: string | null;
  updated_at: string;
}

const STATUS: Record<PublicDevelopment["status"], DevelopmentStatus> = {
  upcoming: "Upcoming",
  ongoing: "Ongoing",
  completed: "Completed",
};

function fromApi(d: PublicDevelopment): Development {
  return {
    id: d.slug,
    name: d.name,
    location: d.location,
    description: d.description,
    status: STATUS[d.status] ?? "Upcoming",
    featured: d.featured,
    displayOrder: d.display_order,
    isComingSoon: d.is_coming_soon,
    externalUrl: d.external_url,
    featuredImage: d.featured_image,
    galleryImages: d.gallery_images,
    featuredVideo: d.featured_video ?? undefined,
    residenceSummary: d.residence_summary ?? undefined,
    updatedAt: d.updated_at,
  };
}

/** Built-in content (data/portfolio.json), also the source for the production seed. */
export const seedDevelopments = seed.developments as Development[];

/**
 * VITE_CONTENT_FALLBACK: "seed" (default) shows the built-in developments if the API is
 * unset or unreachable; "none" shows nothing instead.
 */
const useSeedOnFailure =
  (import.meta.env.VITE_CONTENT_FALLBACK ?? "seed").trim().toLowerCase() !== "none";

export async function loadDevelopments(signal?: AbortSignal): Promise<Development[]> {
  if (!hasApi) return useSeedOnFailure ? seedDevelopments : [];
  try {
    const rows = await apiFetch<PublicDevelopment[]>("/public/developments", { signal });
    return rows.map(fromApi).sort((a, b) => a.displayOrder - b.displayOrder);
  } catch (err) {
    if (signal?.aborted) throw err;
    if (import.meta.env.DEV) console.warn("[developments] API failed", err);
    return useSeedOnFailure ? seedDevelopments : [];
  }
}
