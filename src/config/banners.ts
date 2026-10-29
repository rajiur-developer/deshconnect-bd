/**
* Banner media for pages. Files live in /public/images/banner.
* Routes that are not listed fall back to DEFAULT_BANNER.
*/ export const DEFAULT_BANNER = "/images/banner/Travel.webp";
export const PAGE_BANNERS: Record<string, string> = {
"/": "/images/banner/homePage.mp4",
"/places": "/images/banner/Travel.webp",
"/institutions": "/images/banner/Collage.webp",
"/hospitals": "/images/banner/Hospital.webp",
"/businesses": "/images/banner/Busenees.webp",
"/government-services": "/images/banner/Gram_place.webp",
"/news": "/images/banner/News.webp",
"/blood-donation": "/images/banner/Blood.webp",
"/community": "/images/banner/Collage.webp",
"/my-news": "/images/banner/News.webp", };
export function bannerFor(pathname: string): string {
return PAGE_BANNERS[pathname] ?? DEFAULT_BANNER; }
