import { useReducedMotion } from 'motion/react';

interface PropertyVideoProps {
  src: string;
  poster?: string;
  label?: string;
  className?: string;
  /** Hide from assistive tech (e.g. a blurred ambient backdrop). */
  decorative?: boolean;
}

/**
 * Muted, looping property video. Without a poster, the `#t=0.1` fragment makes the
 * browser paint the first frame so the slot is never blank before playback.
 * Reduced-motion users get the still frame without autoplay.
 */
export function PropertyVideo({
  src,
  poster,
  label,
  className = '',
  decorative = false,
}: PropertyVideoProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <video
      key={src}
      src={poster ? src : `${src}#t=0.1`}
      poster={poster || undefined}
      autoPlay={!prefersReducedMotion}
      muted
      loop
      playsInline
      preload={prefersReducedMotion ? 'metadata' : 'auto'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
      className={className}
    />
  );
}
