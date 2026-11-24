import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { LEGAL_LINKS, LEGAL_PAGES, type LegalSlug } from "../content/legal";

/** A legal page (privacy, terms, disclaimer) in the site's shell. Reached at /legal/<slug>. */
export function LegalPage({ slug }: { slug: LegalSlug }) {
  const page = LEGAL_PAGES[slug];

  useEffect(() => {
    const previous = document.title;
    document.title = `${page.title} | Quo Engineering & Construction`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, [page.title]);

  return (
    <section className="bg-[#F8F8F6] py-16 md:py-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <a href="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#C89B3C] transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden="true" /> Back to home
        </a>
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-[#C89B3C]">Legal</p>
        <h1 className="mt-3 font-serif text-4xl md:text-5xl text-[#0B1829]">{page.title}</h1>
        <p className="mt-3 text-sm text-slate-500">Last updated {page.updated}</p>

        <div className="mt-10 space-y-8">
          {page.sections.map((section, i) => (
            <div key={section.heading ?? i}>
              {section.heading && <h2 className="font-serif text-2xl text-[#0B1829]">{section.heading}</h2>}
              <div className="mt-3 space-y-4 text-base leading-relaxed text-slate-700">
                {section.body.map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        <nav aria-label="Legal pages" className="mt-14 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-6 text-sm">
          {LEGAL_LINKS.filter((l) => l.slug !== slug).map((l) => (
            <a key={l.slug} href={`/legal/${l.slug}`} className="text-slate-600 hover:text-[#C89B3C] transition-colors">
              {l.label}
            </a>
          ))}
        </nav>
      </div>
    </section>
  );
}
