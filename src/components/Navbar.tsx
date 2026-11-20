import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { GlassButton } from './GlassButton';
import { playCling } from '../utils/playCling';
import { withTracking } from '../analytics';

interface NavbarProps {
  onNavigateContact: () => void;
}

export function Navbar({ onNavigateContact }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: 'Developments', href: '#developments' },
    { label: 'Featured', href: '#featured' },
    { label: 'Why Quo', href: '#why-choose-us' },
    { label: 'About Us', href: '#about' },
  ];

  const handleLinkClick = () => {
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/30 backdrop-blur-xl backdrop-saturate-150 border-b border-[#123B6B]/10 shadow-[0_4px_30px_rgba(0,0,0,0.12)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark / Logo */}
        <a
          href="#top"
          className="flex items-center whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] rounded"
          aria-label="Quo Engineering & Construction Home"
        >
          <img
            src="/assets/aistudio/quo-logo_7108c43a.png"
            alt="Quo Construction & Engineering Limited"
            className="h-9 sm:h-10 w-auto object-contain"
            referrerPolicy="no-referrer"
          />
        </a>

        {/* Zone 2: Concise single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-bold text-[#123B6B]"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap shrink-0 py-1 hover:text-[#F26A21] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F26A21] rounded"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <GlassButton
            onClick={withTracking(
              { name: 'cta_click', tag: 'nav_enquire_now', once: 'session' },
              onNavigateContact,
            )}
            className="hidden sm:inline-flex shrink-0"
          >
            <span>Enquire Now</span>
          </GlassButton>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-md text-[#123B6B] hover:text-[#F26A21] hover:bg-[#123B6B]/5 transition-colors cursor-pointer"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white/40 backdrop-blur-xl border-t border-[#123B6B]/10 px-4 py-4 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleLinkClick}
                className="py-2.5 px-3 text-sm font-bold text-[#123B6B] hover:text-[#F26A21] hover:bg-[#123B6B]/5 rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            onClick={withTracking(
              { name: 'cta_click', tag: 'nav_mobile_enquire_now', once: 'session' },
              () => {
                playCling();
                setMobileOpen(false);
                onNavigateContact();
              },
            )}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-[#123B6B] bg-[#F26A21] hover:bg-[#E05A12] rounded-md transition-colors cursor-pointer"
          >
            <span>Enquire Now</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </header>
  );
}
