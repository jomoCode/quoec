import { useReducedMotion } from 'motion/react';

interface PropertyVideoProps {
  src: string;
  poster?: string;
  label: string;
  className?: string;
}

/**
 * Muted, looping property video. Without a poster, the `#t=0.1` fragment makes the
 * browser paint the first frame so the slot is never blank before playback.
 * Reduced-motion users get the still frame without autoplay.
 */
export function PropertyVideo({ src, poster, label, className = '' }: PropertyVideoProps) {
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
      aria-label={label}
      className={className}
    />
  );
}
