"use client";
import Image from "next/image";
type Props = {
src: string;
alt: string;
className?: string;
fill?: boolean;
sizes?: string;
priority?: boolean; };
export function RecordImage({ src, alt, className, fill, sizes, priority }: Props) {
if (src.startsWith("data:")) {
return (
<img src={src} alt={alt} className={className} style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" } : undefined} />
);
}
return <Image src={src} alt={alt} className={className} fill={fill} sizes={sizes} priority={priority} />; }
