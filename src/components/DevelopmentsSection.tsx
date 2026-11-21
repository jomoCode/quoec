import { useState } from 'react';
import { ArrowRight, ArrowUpRight, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import type { Development, DevelopmentStatus } from '../types/property';
import { ArchitecturalImage } from './ArchitecturalImage';
import { PropertyVideo } from './PropertyVideo';
import windowFrame from '../assets/images/window-frame.png';

interface DevelopmentsSectionProps {
  developments: Development[];
  loading: boolean;
}

type StatusFilter = 'All' | DevelopmentStatus;

function DevelopmentCard({ property }: { property: Development }) {
  const photos = (
    property.galleryImages && property.galleryImages.length > 0
      ? property.galleryImages
      : [property.featuredImage]
  ).filter(Boolean);
  // The walkthrough video (if any) leads the gallery, followed by the photos.
  const images: { kind: 'video' | 'image'; src: string }[] = [
    ...(property.featuredVideo ? [{ kind: 'video' as const, src: property.featuredVideo }] : []),
    ...photos.map((src) => ({ kind: 'image' as const, src })),
  ];
  const [imageIndex, setImageIndex] = useState(0);

  const isActiveLink = !property.isComingSoon && Boolean(property.externalUrl);
  const currentMedia = images[imageIndex] ?? { kind: 'image' as const, src: property.featuredImage };

  const cycleImage = (direction: 1 | -1) => {
    setImageIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <article className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden flex flex-col justify-between transition-shadow duration-200 hover:shadow-md">
      <div>
        {/* Image Frame — property view seen through a window */}
        <div className="relative aspect-[2/1] bg-[#1A140F] overflow-hidden">
          {/* View behind the glass (inset matches the window PNG's transparent area) */}
          <div className="absolute top-[5%] bottom-[7.5%] left-[10%] right-[10%] z-0">
            {currentMedia.kind === 'video' ? (
              <PropertyVideo
                src={currentMedia.src}
                poster={property.featuredImage}
                label={`${property.name} walkthrough video`}
                className="w-full h-full object-cover"
              />
            ) : (
              <ArchitecturalImage
                src={currentMedia.src}
                alt={`${property.name} architectural exterior`}
                title={property.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Window frame overlay */}
          <img
            src={windowFrame}
            alt=""
            aria-hidden="true"
            draggable={false}
            className="absolute inset-0 w-full h-full z-10 pointer-events-none select-none"
          />

          {images.length > 1 && (
            <div className="absolute bottom-[11%] right-[13%] z-20 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => cycleImage(-1)}
                aria-label={`Previous image of ${property.name}`}
                className="w-8 h-8 rounded-full bg-[#0B1829]/75 text-white hover:bg-[#0B1829] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => cycleImage(1)}
                aria-label={`Next image of ${property.name}`}
                className="w-8 h-8 rounded-full bg-[#0B1829]/75 text-white hover:bg-[#0B1829] flex items-center justify-center transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="px-5 pt-4 pb-4">
          {/* Unboxed metadata with typographic separator (Zero-Pill Discipline) */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 mb-1.5">
            <span className="inline-flex items-center gap-1 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-[#B4852B]" aria-hidden="true" />
              {property.location}
            </span>
            <span aria-hidden="true">·</span>
            <span
              className={
                property.status === 'Completed'
                  ? 'text-emerald-700 font-semibold'
                  : property.status === 'Ongoing'
                    ? 'text-[#0B1829] font-semibold'
                    : 'text-amber-700 font-semibold'
              }
            >
              {property.status}
            </span>
            {property.isComingSoon && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-slate-500">Coming Soon</span>
              </>
            )}
          </div>

          <h3 className="font-serif text-xl font-semibold text-[#0B1829] mb-1.5">
            {property.name}
          </h3>

          <p className="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-2">
            {property.description}
          </p>

          {property.residenceSummary && (
            <p className="text-xs text-slate-500 font-medium">
              {property.residenceSummary}
            </p>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 border-t border-[#ECEAE4] bg-[#FCFCFA]">
        {isActiveLink ? (
          <a
            href={property.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-between w-full text-sm font-semibold text-[#0B1829] hover:text-[#B4852B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C89B3C] rounded"
          >
            <span>Explore Property Website</span>
            <span className="inline-flex items-center gap-1 text-[#B4852B]">
              <span>Visit Site</span>
              <ArrowUpRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </a>
        ) : (
          <div
            aria-disabled="true"
            className="flex items-center justify-between w-full text-sm font-medium text-slate-400 cursor-default select-none"
          >
            <span>Coming Soon</span>
            <span className="text-xs text-slate-400">Details releasing shortly</span>
          </div>
        )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white border border-[#E5E4DF] rounded-lg overflow-hidden animate-pulse"
              >
                <div className="aspect-[2/1] bg-[#ECEAE4]" />
                <div className="p-6 space-y-3">
                  <div className="h-3 w-36 bg-[#ECEAE4] rounded" />
                  <div className="h-6 w-48 bg-[#ECEAE4] rounded" />
                  <div className="h-4 w-full bg-[#ECEAE4] rounded" />
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
