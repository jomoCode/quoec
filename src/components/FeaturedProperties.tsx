import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView, useReducedMotion } from 'motion/react';
import type { PanInfo } from 'motion/react';
import { ArrowUpRight, ChevronLeft, ChevronRight, Lock, MapPin } from 'lucide-react';
import type { Development } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';
import { PropertyVideo } from './PropertyVideo';

interface FeaturedPropertiesProps {
  developments: Development[];
}

/**
 * Animation phases:
 *  - idle:    section not yet in view, title hidden off-screen
 *  - intro:   title slides in from the left, subtitle from the right, both big + centered
 *  - settled: title block shrinks and moves to the top, carousel slides in
 */
type Phase = 'idle' | 'intro' | 'settled';

const EASE = [0.22, 1, 0.36, 1] as const;
const TITLE_DURATION = 0.9;
const SUBTITLE_DELAY = 0.55;
const INTRO_HOLD_MS = 2600; // time from intro start until the header settles
const AUTOPLAY_MS = 6500;
const SWIPE_THRESHOLD = 80;

const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 0.4 }),
  center: { x: '0%', opacity: 1 },
  exit: (direction: number) => ({ x: direction > 0 ? '-30%' : '30%', opacity: 0 }),
};

function FeaturedSlide({ property }: { property: Development }) {
  const isActiveLink = !property.isComingSoon && Boolean(property.externalUrl);

  return (
    <div className="absolute inset-0">
      {property.featuredVideo ? (
        <PropertyVideo
          src={property.featuredVideo}
          poster={property.featuredImage}
          label={`${property.name} in ${property.location}`}
          className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        />
      ) : (
        <ArchitecturalImage
          src={property.featuredImage}
          alt={`${property.name} in ${property.location}`}
          title={property.name}
          dark
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#07101C]/95 via-[#0B1829]/35 to-transparent"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#07101C]/60 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Top label */}
      <div className="absolute top-5 left-5 right-5 sm:top-8 sm:left-8 sm:right-8 flex items-center justify-between text-xs font-medium tracking-wide text-slate-200">
        <span className="inline-flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#E2B45A]" aria-hidden="true" />
          {property.location}
        </span>
        <span className={isActiveLink ? 'text-[#E2B45A]' : 'text-slate-300'}>
          {isActiveLink ? property.status : 'Coming Soon'}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-12">
        <div className="max-w-xl space-y-3">
          <p className="text-xs sm:text-sm font-medium text-[#E2B45A]">
            {property.residenceSummary || property.status}
          </p>
          <h3 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
            {property.name}
          </h3>
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed">
            {property.description}
          </p>

          <div className="pt-4">
            {isActiveLink ? (
              <a
                href={property.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#E2B45A] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2B45A] rounded"
              >
                <span>Visit Property Website</span>
                <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
              </a>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-sm text-slate-400">
                <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Coming Soon · Unreleased</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeaturedProperties({ developments }: FeaturedPropertiesProps) {
  const featured = developments
    .filter((d) => d.featured)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  if (featured.length === 0) {
    return null;
  }

  // Mounted only once data exists, so the in-view observers attach to real DOM nodes.
  return <FeaturedShowcase featured={featured} />;
}

function FeaturedShowcase({ featured }: { featured: Development[] }) {
  const prefersReducedMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { amount: 0.45, once: true });
  const carouselInView = useInView(stageRef, { amount: 0.3 });

  const [phase, setPhase] = useState<Phase>(prefersReducedMotion ? 'settled' : 'idle');
  const [introTransform, setIntroTransform] = useState({ y: 0, scale: 1 });
  const [[index, direction], setSlide] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);

  const count = featured.length;

  // Kick off the intro once the section scrolls into view.
  useEffect(() => {
    if (prefersReducedMotion) {
      setPhase('settled');
      return;
    }
    if (inView) {
      setPhase((current) => (current === 'idle' ? 'intro' : current));
    }
  }, [inView, prefersReducedMotion]);

  // Hold the big centered title, then settle it to the top.
  useEffect(() => {
    if (phase !== 'intro') return;
    const timer = window.setTimeout(() => setPhase('settled'), INTRO_HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // Measure how far down / how much bigger the header must be to sit centered in the stage.
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const header = headerRef.current;
    if (!stage || !header) return;

    const measure = () => {
      const stageH = stage.offsetHeight;
      const stageW = stage.offsetWidth;
      const headerH = header.offsetHeight;
      const headerW = header.offsetWidth;
      const desired = stageW < 640 ? 1.3 : stageW < 1024 ? 1.5 : 1.75;
      const scale = Math.min(desired, (stageW * 0.95) / headerW);
      setIntroTransform({ y: stageH / 2 - headerH / 2, scale });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    observer.observe(header);
    return () => observer.disconnect();
  }, [count]);

  const paginate = useCallback(
    (step: number) => {
      if (count < 2) return;
      setSlide(([current]) => [(current + step + count) % count, step]);
    },
    [count],
  );

  const goTo = (target: number) => {
    setSlide(([current]) => [target, target > current ? 1 : -1]);
  };

  // Autoplay — pauses on hover/focus, when off-screen, or for reduced-motion users.
  useEffect(() => {
    if (phase !== 'settled' || paused || !carouselInView || prefersReducedMotion || count < 2) {
      return;
    }
    const timer = window.setInterval(() => paginate(1), AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [phase, paused, carouselInView, prefersReducedMotion, count, paginate, index]);

  // Tapping/clicking the picture advances to the next development
  // (but not when the tap lands on the "Visit Property Website" link).
  const handleTap = (event: PointerEvent | MouseEvent | TouchEvent) => {
    const target = event.target as Element | null;
    if (target?.closest('a, button')) return;
    paginate(1);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -500) paginate(1);
    else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > 500) paginate(-1);
  };

  const settled = phase === 'settled';
  const shown = phase !== 'idle';
  const active = featured[index] ?? featured[0];
  // The very first slide waits for the header to finish settling before it slides in.
  const firstSlideDelay = direction === 0 && !prefersReducedMotion ? 0.6 : 0;

  return (
    <section
      id="featured"
      ref={sectionRef}
      className="relative isolate bg-[#0B1829] text-white py-16 lg:py-20 border-t border-white/10 overflow-hidden"
    >
      {/* Ambient backdrop: the active development's video (or image), blurred and darkened. */}
      <div className="absolute inset-0 -z-20" aria-hidden="true">
        <AnimatePresence initial={false}>
          <motion.div
            key={active.id}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 1, ease: 'easeInOut' }}
          >
            {active.featuredVideo ? (
              <PropertyVideo
                src={active.featuredVideo}
                poster={active.featuredImage}
                decorative
                className="absolute inset-0 size-full scale-125 object-cover blur-2xl"
              />
            ) : active.featuredImage ? (
              <img
                src={active.featuredImage}
                alt=""
                className="absolute inset-0 size-full scale-125 object-cover blur-2xl"
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
      <div
        className="absolute inset-0 -z-10 bg-linear-to-r from-[#07101C]/80 via-[#0B1829]/55 to-[#07101C]/80"
        aria-hidden="true"
      />
      <div ref={stageRef} className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — sits at the top in its final (small) size; during the intro it is
            translated to the vertical center of the stage and scaled up. */}
        <motion.div
          ref={headerRef}
          className="relative z-20 mx-auto max-w-3xl text-center mb-10 lg:mb-12 origin-center"
          initial={false}
          animate={settled ? { y: 0, scale: 1 } : introTransform}
          transition={{ duration: prefersReducedMotion ? 0 : 1, ease: EASE }}
        >
          <motion.p
            className="text-sm font-medium text-[#E2B45A] mb-2"
            initial={false}
            animate={{ opacity: settled ? 1 : 0 }}
            transition={{ duration: 0.6, delay: settled ? 0.4 : 0 }}
          >
            Featured Portfolio
          </motion.p>

          <motion.h2
            className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-white"
            initial={prefersReducedMotion ? false : { x: '-70vw', opacity: 0 }}
            animate={shown ? { x: 0, opacity: 1 } : { x: '-70vw', opacity: 0 }}
            transition={{ duration: TITLE_DURATION, ease: EASE }}
          >
            Selected Signature Developments
          </motion.h2>

          <motion.p
            className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto"
            initial={prefersReducedMotion ? false : { x: '70vw', opacity: 0 }}
            animate={shown ? { x: 0, opacity: 1 } : { x: '70vw', opacity: 0 }}
            transition={{
              duration: TITLE_DURATION,
              ease: EASE,
              delay: phase === 'intro' ? SUBTITLE_DELAY : 0,
            }}
          >
            Each residence is conceived with low-density privacy, enduring materials, and
            dedicated aftercare by Quo Engineering &amp; Construction Limited.
          </motion.p>
        </motion.div>

        {/* Carousel — keeps its space during the intro so the header can be centered over it. */}
        <motion.div
          className="relative max-w-4xl mx-auto"
          initial={false}
          animate={{ opacity: settled ? 1 : 0 }}
          transition={{ duration: 0.4, delay: settled && !prefersReducedMotion ? 0.5 : 0 }}
          aria-hidden={!settled}
        >
          <div
            className="relative aspect-[4/5] sm:aspect-video overflow-hidden rounded-lg border border-white/15 bg-[#07101C]/40 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured developments"
          >
            {settled && (
              <AnimatePresence initial={!prefersReducedMotion} custom={direction || 1} mode="popLayout">
                <motion.div
                  key={active.id}
                  className={`absolute inset-0 ${count > 1 ? 'cursor-pointer' : ''}`}
                  custom={direction || 1}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: {
                      duration: prefersReducedMotion ? 0 : 0.85,
                      ease: EASE,
                      delay: firstSlideDelay,
                    },
                    opacity: { duration: prefersReducedMotion ? 0 : 0.5, delay: firstSlideDelay },
                  }}
                  drag={count > 1 ? 'x' : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.25}
                  onDragStart={() => setPaused(true)}
                  onDragEnd={(event, info) => {
                    setPaused(false);
                    handleDragEnd(event, info);
                  }}
                  onTap={handleTap}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${count}: ${active.name}`}
                >
                  <FeaturedSlide property={active} />
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {count > 1 && (
            <div className="mt-6 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="font-serif text-sm text-slate-300 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                  <span className="text-slate-500"> / {String(count).padStart(2, '0')}</span>
                </span>
                <div className="flex items-center gap-2">
                  {featured.map((property, i) => (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`Show ${property.name}`}
                      aria-current={i === index}
                      className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                        i === index ? 'w-8 bg-[#E2B45A]' : 'w-3 bg-white/25 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => paginate(-1)}
                  aria-label="Previous development"
                  className="w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white hover:text-[#0B1829] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2B45A]"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => paginate(1)}
                  aria-label="Next development"
                  className="w-11 h-11 rounded-full border border-white/20 text-white hover:bg-white hover:text-[#0B1829] flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2B45A]"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
