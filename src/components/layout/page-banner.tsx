"use client";
import type { ReactNode } from "react";
export type BannerMedia = { src: string; type?: "video" | "image" };
export function PageBanner({
title,
description,
media,
action,
children,
className, }: {
title: string;
description?: string;
media: string | BannerMedia;
action?: ReactNode;
children?: ReactNode;
className?: string; }) {
const src = typeof media === "string" ? media : media.src;
const type =
typeof media === "string"
? src.toLowerCase().endsWith(".mp4")
? "video"
: "image"
: media.type ?? (src.toLowerCase().endsWith(".mp4") ? "video" : "image");
return (
<section className={`relative isolate overflow-hidden bg-slate-900 ${className ?? ""}`}>
{type === "video" ? (
<video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata">
<source src={src} type="video/mp4" />
</video>
) : (
<img src={src} alt="" className="absolute inset-0 h-full w-full object-cover" />
)}
<div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/70" />
<div className="container-x relative flex min-h-[32vh] flex-col items-center justify-center py-8 text-center sm:min-h-[60vh] sm:py-16">
<div className="max-w-3xl">
<h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
{description && <p className="mt-3 text-white/85">{description}</p>}
{action && <div className="mt-4">{action}</div>}
</div>
{children && <div className="mt-5">{children}</div>}
</div>
</section>
); }
