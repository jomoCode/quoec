const PRINCIPALS = [
  {
    name: 'Houses for Africa Nigeria Limited',
    role: 'Principal Development Partner',
  },
  {
    name: 'Mobus Property Nigeria Limited',
    role: 'Principal Development Partner',
  },
  {
    name: 'River Park Estate, Abuja',
    role: 'Landmark Residential Track Record',
  },
];

const TRACK_RECORD = [
  'The Monarch Residences',
  'Phoenix Villas',
  'Richfield Lifestyle Estate',
  'Capella Place',
  'Knight Court & Park Apartments',
  'Capital Place, Accra',
];

export function AboutDeveloper() {
  return (
    <section id="about" className="logo-watermark bg-[#F8F8F6] py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          {/* Left: Company overview & logo */}
          <div className="lg:col-span-7 space-y-6">
            <div className="mb-4">
              <img
                src="/assets/aistudio/quo-logo_7108c43a.png"
                alt="Quo Construction & Engineering Limited"
                className="h-14 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-[#B4852B] mb-2">
                About the Developer
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1829] mb-4">
                Quo Engineering &amp; Construction Limited
              </h2>
            </div>

            <p className="text-base text-slate-700 leading-relaxed">
              Quo Engineering and Construction Limited is a luxury development brand
              promoted by the principals of Houses for Africa Nigeria Limited and Mobus
              Property Nigeria Limited — the teams behind River Park Estate, one of
              Abuja&apos;s largest residential developments, and an award-recognised
              portfolio across Accra and Abuja.
            </p>

            <p className="text-base text-slate-600 leading-relaxed">
              From land acquisition and design to construction, delivery and aftercare,
              Quo&apos;s end-to-end capability is committed to one standard on every
              project: <strong className="text-[#0B1829] font-semibold">Quality assured!</strong>
            </p>

            {/* Mission & Vision */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-[#E5E4DF]">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#0B1829] mb-2">
                  Our Mission
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  To create a small number of exceptional residences, built to last and
                  cared for with the attention their owners deserve.
                </p>
              </div>
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#0B1829] mb-2">
                  Our Vision
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Homes where privacy, security and calm are part of the design — not an
                  afterthought.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Principals & Accra/Abuja Track Record */}
          <div className="lg:col-span-5 bg-white border border-[#E5E4DF] rounded-lg p-7 sm:p-8 space-y-8">
            <div>
              <h3 className="font-serif text-xl font-semibold text-[#0B1829] mb-4">
                The Team Behind Quo
              </h3>
              <ul className="divide-y divide-[#ECEAE4]">
                {PRINCIPALS.map((item) => (
                  <li key={item.name} className="py-3.5 first:pt-0 last:pb-0">
                    <p className="text-sm font-semibold text-[#0B1829]">{item.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.role}</p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-6 border-t border-[#E5E4DF]">
              <h4 className="text-xs font-semibold tracking-wide text-[#B4852B] mb-3">
                Delivered Portfolio Across Accra &amp; Abuja
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 text-sm text-slate-700">
                {TRACK_RECORD.map((project) => (
                  <div key={project} className="py-1 border-b border-[#F3F2EE]">
                    {project}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
