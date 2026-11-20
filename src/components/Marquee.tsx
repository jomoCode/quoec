interface MarqueeProps {
  text: string;
  /** Repeats per group. Keep high enough that one group is wider than any screen, so the loop never shows a gap. */
  repeats?: number;
  className?: string;
}

function MarqueeGroup({ text, repeats, hidden = false }: { text: string; repeats: number; hidden?: boolean }) {
  return (
    <span aria-hidden={hidden || undefined} className="flex shrink-0 items-center">
      {Array.from({ length: repeats }, (_, i) => (
        <span key={i} aria-hidden={(!hidden && i > 0) || undefined} className="flex items-center">
          <span className="px-6">{text}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#123B6B]" aria-hidden="true" />
        </span>
      ))}
    </span>
  );
}

/**
 * Continuously scrolling text strip. The track holds two identical groups and
 * shifts by one group (see --animate-marquee in index.css) for a seamless
 * loop. Screen readers read the text once; hovering pauses it. With reduced
 * motion enabled, the text is shown as a static centered line.
 */
export function Marquee({ text, repeats = 8, className = '' }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="flex w-max whitespace-nowrap animate-marquee hover:[animation-play-state:paused] motion-reduce:hidden">
        <MarqueeGroup text={text} repeats={repeats} />
        <MarqueeGroup text={text} repeats={repeats} hidden />
      </div>
      <p className="hidden motion-reduce:block max-w-3xl mx-auto px-4 text-center">{text}</p>
    </div>
  );
}
