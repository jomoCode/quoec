import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { playCling } from '../utils/playCling';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Play the glassy "cling" sound on click. Defaults to true. */
  sound?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-[#123B6B] bg-[linear-gradient(135deg,rgba(242,106,33,0.55)_0%,rgba(255,255,255,0.4)_50%,rgba(242,106,33,0.55)_100%)] hover:bg-[linear-gradient(135deg,rgba(242,106,33,0.75)_0%,rgba(255,255,255,0.5)_50%,rgba(242,106,33,0.75)_100%)] backdrop-blur-md border border-[#F26A21]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_16px_rgba(242,106,33,0.25)] rounded-sm transition-colors duration-150 whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123B6B] disabled:opacity-50 disabled:cursor-not-allowed';

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
