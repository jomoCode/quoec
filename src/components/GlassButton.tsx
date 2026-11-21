import type { ButtonHTMLAttributes, MouseEvent } from 'react';
import { playCling } from '../utils/playCling';

interface GlassButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Play the glassy "cling" sound on click. Defaults to true. */
  sound?: boolean;
}

const baseClasses =
  'inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-[#123B6B] relative overflow-hidden isolate rounded-md ' +
  // Glass body: faint frosted fill, blur, thin orange edge, top highlight + soft depth
  'bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0.08)_100%)] backdrop-blur-md backdrop-saturate-150 border border-[#F26A21]/60 ' +
  'shadow-[inset_0_1px_0_rgba(255,255,255,0.7),inset_0_-1px_0_rgba(18,59,107,0.06),0_2px_8px_rgba(18,59,107,0.08)] ' +
  // Light sheen that sweeps across on hover
  "before:content-[''] before:absolute before:inset-0 before:-z-10 before:pointer-events-none before:-translate-x-full before:bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.75)_50%,transparent_75%)] before:transition-transform before:duration-700 before:ease-out hover:before:translate-x-full " +
  // Hover: lift, grow, warmer edge, orange-tinted glow
  'transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.04] hover:border-[#F26A21] hover:bg-[linear-gradient(135deg,rgba(255,255,255,0.5)_0%,rgba(242,106,33,0.08)_100%)] ' +
  'hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.85),0_8px_24px_rgba(242,106,33,0.2)] active:translate-y-0 active:scale-100 ' +
  'motion-reduce:transform-none motion-reduce:before:hidden motion-reduce:transition-colors whitespace-nowrap cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#123B6B] disabled:opacity-50 disabled:cursor-not-allowed';

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
