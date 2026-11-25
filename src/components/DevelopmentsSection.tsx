import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { STATUS_LABEL, type Development, type DevelopmentStatus } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';

interface DevelopmentsSectionProps {
  developments: Development[];
  loading: boolean;
}

type StatusFilter = 'All' | DevelopmentStatus;

function DevelopmentCard({ property }: { property: Development }) {
  // Only photos are shown on the card — videos don't suit this view.
  const images = (
    property.galleryImages && property.galleryImages.length > 0
      ? property.galleryImages
      : [property.featuredImage]
  ).filter(Boolean);
  const [imageIndex, setImageIndex] = useState(0);

  const isActiveLink = Boolean(property.externalUrl);
  const currentImage = images[imageIndex] ?? property.featuredImage;

  const cycleImage = (direction: 1 | -1) => {
    setImageIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    // tabIndex lets a tap on touch devices focus the card, revealing details via focus-within.
    <article
      tabIndex={0}
      className="group relative aspect-[4/3] rounded-lg overflow-hidden bg-[#0B1829] transition-shadow duration-200 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C]"
    >
      <ArchitecturalImage
        src={currentImage}
        alt={`${property.name} architectural exterior`}
        title={property.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
      />

      {images.length > 1 && (
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => cycleImage(-1)}
            aria-label={`Previous image of ${property.name}`}
            className="w-8 h-8 rounded-full bg-[#0B1829]/70 text-white hover:bg-[#0B1829] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => cycleImage(1)}
            aria-label={`Next image of ${property.name}`}
            className="w-8 h-8 rounded-full bg-[#0B1829]/70 text-white hover:bg-[#0B1829] flex items-center justify-center transition-colors cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom overlay: name + status always visible; details slide up on hover/focus */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        {/* Legibility gradient (collapsed) */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[220%] bg-gradient-to-t from-[#0B1829]/90 via-[#0B1829]/40 to-transparent pointer-events-none"
        />
        {/* Solid backdrop (expanded) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[#0B1829]/85 backdrop-blur-sm opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
        />

        <div className="relative px-5 pt-4 pb-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-white/75 mb-1">
            <span className="inline-flex items-center gap-1 text-white/90">
              <MapPin className="w-3.5 h-3.5 text-[#C89B3C]" aria-hidden="true" />
              {property.location}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={
                property.status === 'Completed'
                  ? 'text-emerald-300 font-semibold'
                  : property.status === 'Ongoing'
                    ? 'text-[#E2C27A] font-semibold'
                    : 'text-amber-300 font-semibold'
              }
            >
              {STATUS_LABEL[property.status]}
            </span>
            {property.isComingSoon && (
              <>
                <span aria-hidden="true">·</span>
                <span>Coming Soon</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-xl sm:text-2xl font-semibold text-white">
            {property.name}
          </h3>

          {/* Collapsible details — grid-rows trick animates to content height */}
          <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out group-hover:grid-rows-[1fr] group-focus-within:grid-rows-[1fr]">
            <div className="overflow-hidden">
              <div className="pt-2 opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0">
                <p className="text-sm text-white/80 leading-relaxed line-clamp-3 mb-2">
                  {property.description}
                </p>

                {property.residenceSummary && (
                  <p className="text-xs text-white/60 font-medium mb-3">
                    {property.residenceSummary}
                  </p>
                )}

                <div className="pt-3 border-t border-white/15">
                  {isActiveLink ? (
                    <a
                      href={property.externalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-between w-full text-sm font-semibold text-white hover:text-[#E2C27A] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] rounded"
                    >
                      <span>Explore Property Website</span>
                      <span className="inline-flex items-center gap-1 text-[#E2C27A]">
                        <span>Visit Site</span>
                        <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
                      </span>
                    </a>
                  ) : (
                    <div
                      aria-disabled="true"
                      className="flex items-center justify-between w-full text-sm font-medium text-white/50 cursor-default select-none"
                    >
                      <span>Coming Soon</span>
                      <span className="text-xs">Details releasing shortly</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function DevelopmentsSection({ developments, loading }: DevelopmentsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');

  const sorted = [...developments].sort((a, b) => a.displayOrder - b.displayOrder);
  const filtered =
    statusFilter === 'All' ? sorted : sorted.filter((item) => item.status === statusFilter);

  const filters: StatusFilter[] = ['All', 'Ongoing', 'Upcoming', 'Completed'];

  return (
    <section id="developments" className="logo-watermark bg-[#F8F8F6] pt-10 pb-16 lg:pt-12 lg:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
          <div>
            <p className="text-sm font-medium text-[#B4852B] mb-2">
              Our Developments
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1829]">
              Find Your Residence
            </h2>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Functional filter segmented control */}
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
                    {filter === 'All' ? filter : STATUS_LABEL[filter]}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="relative aspect-[4/3] bg-[#ECEAE4] rounded-lg overflow-hidden animate-pulse"
              >
                <div className="absolute bottom-5 left-5 space-y-2">
                  <div className="h-3 w-36 bg-[#DCDAD3] rounded" />
                  <div className="h-6 w-48 bg-[#DCDAD3] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-[#E5E4DF] rounded-lg p-12 text-center">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((property) => (
              <DevelopmentCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
