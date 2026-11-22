import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Car,
  MapPin,
  ShieldCheck,
  Trees,
  type LucideIcon,
} from 'lucide-react';
import type { Development, DevelopmentStatus } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';

interface DevelopmentsSectionProps {
  developments: Development[];
  loading: boolean;
}

type StatusFilter = 'All' | DevelopmentStatus;

/** Highlights shown beside the featured development. Edit to suit the portfolio. */
const HIGHLIGHTS: { icon: LucideIcon; label: string }[] = [
  { icon: ShieldCheck, label: '24/7 Security' },
  { icon: Trees, label: 'Landscaped Environment' },
  { icon: Car, label: 'Ample Parking' },
];

/**
 * Two-column layout. On desktop it fills whatever height the section has left
 * after the heading, so heading + list + featured card fit in one screen.
 */
const GRID_CLASSES =
  'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,24rem)_1fr] xl:grid-cols-[minmax(0,26rem)_1fr] lg:flex-1 lg:min-h-0';

const STATUS_STYLES: Record<DevelopmentStatus, { pill: string; dot: string }> = {
  Completed: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-600' },
  Ongoing: { pill: 'bg-[#E8EDF4] text-[#0B1829]', dot: 'bg-[#0B1829]' },
  Upcoming: { pill: 'bg-[#FBF1DC] text-[#8A6318]', dot: 'bg-[#B4852B]' },
};

function StatusPill({ status }: { status: DevelopmentStatus }) {
  const style = STATUS_STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${style.pill}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
      {status}
    </span>
  );
}

function getImages(property: Development) {
  return (
    property.galleryImages && property.galleryImages.length > 0
      ? property.galleryImages
      : [property.featuredImage]
  ).filter(Boolean);
}

function DevelopmentListItem({
  property,
  index,
  isActive,
  onSelect,
}: {
  property: Development;
  index: number;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={isActive}
      className={`relative w-full text-left flex gap-4 p-4 border-l-4 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#C89B3C] ${
        isActive
          ? 'bg-[#F5EEDF] border-[#B4852B]'
          : 'bg-white border-transparent hover:bg-[#FAF7F0]'
      }`}
    >
      <div className="w-28 sm:w-32 shrink-0 aspect-[4/3.5] rounded-md overflow-hidden bg-[#ECEAE4]">
        <ArchitecturalImage
          src={property.featuredImage || getImages(property)[0]}
          alt=""
          title={property.name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-xs font-semibold text-[#B4852B] tabular-nums">
            {String(index + 1).padStart(2, '0')}
          </span>
          <StatusPill status={property.status} />
        </div>
        <h3 className="font-serif text-lg font-semibold text-[#0B1829] leading-tight mt-0.5">
          {property.name}
        </h3>
        <p className="flex items-center gap-1.5 text-xs text-slate-600 mt-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#B4852B] shrink-0" aria-hidden="true" />
          <span className="truncate">{property.location}</span>
        </p>
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mt-1.5">
          {property.description}
        </p>
      </div>
    </button>
  );
}

function FeaturedDevelopment({ property }: { property: Development }) {
  const images = getImages(property);
  const [imageIndex, setImageIndex] = useState(0);
  const currentImage = images[imageIndex] ?? property.featuredImage;
  const isActiveLink = !property.isComingSoon && Boolean(property.externalUrl);

  const cycleImage = (direction: 1 | -1) => {
    setImageIndex((prev) => (prev + direction + images.length) % images.length);
  };

  return (
    <article className="group relative isolate h-full aspect-4/5 sm:aspect-16/10 lg:aspect-auto rounded-xl overflow-hidden bg-[#1A140F] shadow-sm">
      {/* Full-bleed image */}
      <div className="absolute inset-0">
        <ArchitecturalImage
          src={currentImage}
          alt={`${property.name} architectural exterior`}
          title={property.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => cycleImage(-1)}
              aria-label={`Previous image of ${property.name}`}
              className="absolute left-4 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-white/90 text-white bg-black/15 hover:bg-black/35 backdrop-blur-[2px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => cycleImage(1)}
              aria-label={`Next image of ${property.name}`}
              className="absolute right-4 top-[38%] -translate-y-1/2 z-20 w-11 h-11 rounded-full border-2 border-white/90 text-white bg-black/15 hover:bg-black/35 backdrop-blur-[2px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-black/20 backdrop-blur-[2px]">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setImageIndex(i)}
                  aria-label={`Show image ${i + 1} of ${images.length}`}
                  aria-current={i === imageIndex}
                  className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                    i === imageIndex ? 'bg-[#D4A44A]' : 'bg-white/70 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Overlay: name + actions always visible; details slide up on hover/focus.
          Touch screens (no hover) always show the details. */}
      <div className="absolute inset-x-0 bottom-0 z-10 max-h-full bg-linear-to-t from-[#0B1829]/95 via-[#0B1829]/75 to-transparent px-5 sm:px-7 pt-24 pb-5 sm:pb-6 text-white">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.14em] uppercase text-[#E3B866]">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {property.location}
        </p>
        <h3 className="font-serif text-3xl sm:text-4xl font-semibold leading-tight mt-1.5 drop-shadow-sm">
          {property.name}
        </h3>

        {/* Collapsible details (grid-rows trick animates height smoothly) */}
        <div className="grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity] duration-500 ease-out group-hover:grid-rows-[1fr] group-hover:opacity-100 group-focus-within:grid-rows-[1fr] group-focus-within:opacity-100 pointer-coarse:grid-rows-[1fr] pointer-coarse:opacity-100">
          <div className="min-h-0 overflow-hidden">
            <p className="text-sm sm:text-[15px] text-white/85 leading-relaxed mt-3 line-clamp-4 max-w-2xl">
              {property.description}
            </p>
            {property.residenceSummary && (
              <p className="text-xs text-white/65 font-medium mt-2">{property.residenceSummary}</p>
            )}
            <ul className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
              {HIGHLIGHTS.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-2 text-sm text-white/90 whitespace-nowrap">
                  <Icon className="w-5 h-5 text-[#E3B866] shrink-0" strokeWidth={1.5} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Actions — always visible */}
        <div className="mt-4">
          {isActiveLink ? (
            <a
              href={property.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#C89B3C] hover:bg-[#D4A44A] text-[#0B1829] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0B1829] focus-visible:ring-[#C89B3C]"
            >
              Explore Property
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          ) : (
            <span
              aria-disabled="true"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-white/15 backdrop-blur-sm text-white/80 text-sm font-semibold cursor-default select-none"
            >
              Coming Soon — details releasing shortly
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export function DevelopmentsSection({ developments, loading }: DevelopmentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const sorted = [...developments].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered =
    statusFilter === 'All' ? sorted : sorted.filter((item) => item.status === statusFilter);
  const selected = filtered.find((item) => item.id === selectedId) ?? filtered[0];

  const filters: StatusFilter[] = ['All', 'Ongoing', 'Upcoming', 'Completed'];

  return (
    <section
      id="developments"
      // Desktop: exactly one screen below the 4rem sticky navbar (with sane min/max)
      className="logo-watermark scroll-mt-16 bg-[#F8F6F1] pt-10 pb-16 lg:pt-6 lg:pb-6 lg:h-[calc(100svh-4rem)] lg:min-h-144 lg:max-h-240 lg:flex lg:flex-col"
    >
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 lg:gap-4 mb-6 lg:mb-5 shrink-0">
          <div>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-[0.18em] uppercase text-[#B4852B] mb-2">
              Our Developments
              <span className="w-8 h-px bg-[#B4852B]" aria-hidden="true" />
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl xl:text-[2.75rem] leading-tight font-semibold tracking-tight text-[#0B1829]">
              Discover our residences
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div
              role="tablist"
              aria-label="Filter developments by status"
              className="inline-flex items-center gap-1 p-1 bg-[#ECEAE4] rounded-lg"
            >
              {filters.map((filter) => {
                const isActive = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3.5 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-[#0B1829] shadow-sm'
                        : 'text-slate-600 hover:text-[#0B1829]'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1829] hover:text-[#B4852B] transition-colors whitespace-nowrap shrink-0"
            >
              <span>Request Private Briefing</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        {loading ? (
          <div className={`${GRID_CLASSES} animate-pulse`}>
            <div className="bg-white border border-[#E5E4DF] rounded-xl divide-y divide-[#ECEAE4] lg:overflow-hidden">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex gap-4 p-4">
                  <div className="w-32 aspect-[4/3.5] bg-[#ECEAE4] rounded-md" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-8 bg-[#ECEAE4] rounded" />
                    <div className="h-5 w-32 bg-[#ECEAE4] rounded" />
                    <div className="h-3 w-full bg-[#ECEAE4] rounded" />
                  </div>
                </div>
              ))}
            </div>
            <div className="aspect-[4/5] sm:aspect-[16/10] lg:aspect-auto rounded-xl bg-[#ECEAE4]" />
          </div>
        ) : !selected ? (
          <div className="bg-white border border-[#E5E4DF] rounded-xl p-12 text-center">
            <h3 className="font-serif text-xl font-semibold text-[#0B1829] mb-2">
              No developments in this category yet
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Select another status filter to view Quo Engineering &amp; Construction developments.
            </p>
            <button
              type="button"
              onClick={() => setStatusFilter('All')}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#0B1829] rounded-md hover:bg-[#132945] transition-colors cursor-pointer"
            >
              Show All Developments
            </button>
          </div>
        ) : (
          <div className={GRID_CLASSES}>
            {/* Featured view first on mobile, right column on desktop */}
            <div className="lg:order-2 lg:min-h-0">
              <FeaturedDevelopment key={selected.id} property={selected} />
            </div>

            {/* List scrolls internally on desktop so it never outgrows the featured card */}
            <div className="lg:order-1 lg:min-h-0 lg:overflow-y-auto overscroll-contain bg-white border border-[#E5E4DF] rounded-xl overflow-hidden divide-y divide-[#ECEAE4]">
              {filtered.map((property, index) => (
                <DevelopmentListItem
                  key={property.id}
                  property={property}
                  index={index}
                  isActive={property.id === selected.id}
                  onSelect={() => setSelectedId(property.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
