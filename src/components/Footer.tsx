import { MapPin, Settings } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export function Footer({ onOpenAdmin }: FooterProps) {
  return (
    <footer className="bg-[#07111E] text-slate-300 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-white/10">
          <div className="space-y-3 max-w-sm">
            <img
              src="/assets/aistudio/quo-logo-on-dark_23a409a6.png"
              alt="Quo Construction & Engineering Limited"
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <p className="text-sm text-slate-400 leading-relaxed">
              Quality assured — creating exceptional residences where privacy, security,
              and calm are part of the design.
            </p>
          </div>

          <nav
            aria-label="Footer navigation"
            className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-300"
          >
            <a href="#developments" className="hover:text-[#E2B45A] transition-colors">
              Our Developments
            </a>
            <a href="#featured" className="hover:text-[#E2B45A] transition-colors">
              Featured Properties
            </a>
            <a href="#why-choose-us" className="hover:text-[#E2B45A] transition-colors">
              Why Choose Us
            </a>
            <a href="#about" className="hover:text-[#E2B45A] transition-colors">
              About Quo
            </a>
            <a href="#contact" className="hover:text-[#E2B45A] transition-colors">
              Contact
            </a>
          </nav>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} Quo Engineering &amp; Construction Limited. All
            rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-6">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E2B45A]" aria-hidden="true" />
              <span>Abuja, Nigeria · Accra, Ghana</span>
            </span>

            <button
              type="button"
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E2B45A] rounded px-1.5 py-1"
            >
              <Settings className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Portfolio Admin</span>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
