"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Props = {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
};

export function RecordImage({ src, alt, className, fill, sizes, priority }: Props) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  const imageStyle = fill
    ? { position: "absolute" as const, inset: 0, width: "100%", height: "100%", objectFit: "cover" as const }
    : undefined;

  // External publisher/CDN URLs should be loaded directly by the browser.
  // This avoids Next.js image-optimizer host restrictions and optimizer 403s.
  const isExternalUrl = /^https?:\/\//i.test(src);

  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`${className ?? ""} grid place-items-center bg-slate-100`}
        style={imageStyle}
      >
        <img
          src="/images/hospitals/diagnostic-centre.svg"
          alt=""
          aria-hidden="true"
          className="h-20 w-20 object-contain opacity-70"
        />
      </div>
    );
  }

  if (src.startsWith("data:") || isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFailed(true)}
        style={imageStyle}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}
