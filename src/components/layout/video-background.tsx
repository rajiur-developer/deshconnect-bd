export function VideoBackground({ src, className = "" }: { src: string; className?: string }) {
  return (
    <video
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" media="(min-width: 768px)" />
    </video>
  );
}
