import { ArchitecturalImage } from './ArchitecturalImage';

const VALUES = [
  {
    index: '01',
    title: 'Quality',
    description: 'Quality assured — in the design, the materials and the finish.',
  },
  {
    index: '02',
    title: 'Privacy',
    description: 'A boutique, residents-only development ethos — starting with only eight homes at The Citadel.',
  },
  {
    index: '03',
    title: 'Security',
    description: 'A protected address, a secured lobby and a dedicated security post on site.',
  },
  {
    index: '04',
    title: 'Care',
    description: 'Attentive service from the first viewing to long after you move in.',
  },
];

export function WhyChooseUs() {
  return (
    <section id="why-choose-us" className="logo-watermark bg-white py-20 lg:py-24 border-y border-[#E5E4DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-stretch">
          {/* Left column: Full-height architectural terrace image */}
          <div className="lg:col-span-6 rounded-lg overflow-hidden bg-[#ECEAE4] min-h-[380px]">
            <ArchitecturalImage
              src="/src/assets/images/lifestyle_terrace_view_1795186677198.jpg"
              alt="Luxury penthouse living terrace overlooking the skyline at sunset"
              title="Quo Lifestyle Architecture"
              className="w-full h-full lg:h-full object-cover"
            />
          </div>

          {/* Right column: Editorial narrative & Quo values */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            <p className="text-sm font-medium text-[#B4852B] mb-2">
              Why Choose Our Properties
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1829] mb-4">
              More Than Homes. A Better Lifestyle.
            </h2>
            <p className="text-base text-slate-600 leading-relaxed mb-8">
              From land acquisition and architectural design to construction, delivery, and
              long-term aftercare, every Quo development is engineered around enduring
              value, quiet comfort, and peace of mind.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
              {VALUES.map((item) => (
                <div key={item.title} className="pt-4 border-t border-[#E5E4DF]">
                  <div className="flex items-baseline gap-2.5 mb-1.5">
                    <span className="font-mono text-xs tabular-nums text-[#B4852B] font-medium">
                      {item.index}.
                    </span>
                    <h3 className="font-serif text-lg font-semibold text-[#0B1829]">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
