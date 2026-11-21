import { Marquee } from './Marquee';

const DESCRIPTION = 'Luxury and Private Residential Residences and Estates';

const HEADLINE_CLASSES =
  '[grid-area:1/1] font-serif leading-[1.1] font-bold tracking-tight opacity-0';

/**
 * Compact intro band. Two headlines share the same grid cell and take turns
 * sliding in on a loop (see --animate-hero-* in index.css). Both stay in the
 * DOM so the h1 is always available to search engines and screen readers.
 * The description scrolls continuously along the bottom boundary.
 * With reduced motion enabled, the h1 and description are shown statically.
 */
export function Hero() {
  return (
    <section id="top" className="logo-watermark bg-[#F8F8F6] text-[#0B1829]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        <div className="grid place-items-center text-center overflow-hidden">
          <p
            className={`${HEADLINE_CLASSES} text-[clamp(1.375rem,3vw,2.25rem)] animate-hero-first motion-reduce:hidden`}
          >
            Quo Engineering and Construction Limited
            <span className="block mt-1 text-[#A87A2A] italic">Abuja and Accra</span>
          </p>

          <h1
            className={`${HEADLINE_CLASSES} text-[clamp(1.75rem,4vw,3rem)] animate-hero-second motion-reduce:animate-none motion-reduce:opacity-100`}
          >
            Exceptional Living in{' '}
            <span className="text-[#A87A2A] italic">Prime Locations</span>
          </h1>
        </div>
      </div>

      {/* Description ticker along the bottom boundary */}
      <Marquee
        text={DESCRIPTION}
        className="border-y border-[#ECEAE4] py-3 text-sm sm:text-base text-[#0B1829]/75"
      />
    </section>
  );
}
