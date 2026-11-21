import { useState } from 'react';
import { Building2 } from 'lucide-react';

interface ArchitecturalImageProps {
  src: string;
  alt: string;
  title?: string;
  className?: string;
  dark?: boolean;
}

export function ArchitecturalImage({
  src,
  alt,
  title,
  className = '',
  dark = false,
}: ArchitecturalImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center p-6 text-center ${
          dark
            ? 'bg-gradient-to-br from-[#0F2038] via-[#132945] to-[#0B1829] text-slate-300'
            : 'bg-gradient-to-br from-[#ECEAE4] via-[#E4E1D8] to-[#D8D4C9] text-slate-600'
        } ${className}`}
        role="img"
        aria-label={alt}
      >
        <Building2 className="h-8 w-8 opacity-45 mb-2" aria-hidden="true" />
        {title && <span className="font-serif text-base font-medium opacity-80">{title}</span>}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
