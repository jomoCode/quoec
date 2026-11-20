import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { playCling } from '../utils/playCling';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Play the glassy "cling" sound on click. Defaults to true. */
  sound?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#FBE3A8] [text-shadow:0_1px_2px_rgba(11,24,41,0.6)] bg-[linear-gradient(135deg,rgba(212,164,76,0.35)_0%,rgba(255,255,255,0.35)_50%,rgba(212,164,76,0.35)_100%)] hover:bg-[linear-gradient(135deg,rgba(226,180,90,0.5)_0%,rgba(255,255,255,0.5)_50%,rgba(226,180,90,0.5)_100%)] backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(212,164,76,0.15)] rounded-sm transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed';

export function GlassButton({
  sound = true,
  onClick,
  className = '',
  type = 'button',
  children,
  ...rest
}: GlassButtonProps) {
  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (sound) playCling();
    onClick?.(e);
  };

  return (
    <button type={type} onClick={handleClick} className={`${baseClasses} ${className}`} {...rest}>
      {children}
    </button>
  );
}
