import type { ReactNode, SVGProps } from "react";
export type IconName =
| "search"
| "menu"
| "close"
| "map-pin"
| "star"
| "users"
| "droplet"
| "landmark"
| "book"
| "heart"
| "store"
| "mountain"
| "chevron-down"
| "arrow-right"
| "alert"
| "check"
| "external"
| "globe"
| "shield"
| "home"
| "message"
| "bell"
| "save"
| "calendar"
| "phone"
| "mail"
| "building"
| "filter"
| "plus"
| "trash"
| "edit"
| "flag"
| "image"
| "audio"
| "mic"
| "stop";
const ICONS: Record<IconName, ReactNode> = {
search: (
<>
<circle cx="11" cy="11" r="7" />
<path d="m21 21-4.3-4.3" />
</>
),
menu: <path d="M3 6h18M3 12h18M3 18h18" />,
close: <path d="M18 6 6 18M6 6l12 12" />,
"map-pin": (
<>
<path d="M20 10c0 4.5-8 12-8 12s-8-7.5-8-12a8 8 0 0 1 16 0Z" />
<circle cx="12" cy="10" r="3" />
</>
),
star: <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" />,
users: (
<>
<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
<circle cx="9" cy="7" r="4" />
<path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
</>
),
droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />,
landmark: (
<>
<path d="M3 21h18M5 21V10M9 21V10M15 21V10M19 21V10M3 10 12 4l9 6" />
</>
),
book: (
<>
<path d="M4 4h6a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4V4Z" />
<path d="M20 4h-6a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h6V4Z" />
</>
),
heart: <path d="M12 20s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" />,
store: (
<>
<path d="M4 10v10h16V10" />
<path d="M3 6l1.5-3h15L21 6a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0Z" />
<path d="M9 20v-5h6v5" />
</>
),
mountain: <path d="m3 20 6-11 4 7 3-4 5 8H3Z" />,
"chevron-down": <path d="m6 9 6 6 6-6" />,
"arrow-right": <path d="M5 12h14M13 6l6 6-6 6" />,
alert: (
<>
<path d="M12 9v4M12 17h.01" />
<path d="M10.3 3.6 2.6 17a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 3.6a2 2 0 0 0-3.4 0Z" />
</>
),
check: <path d="m20 6-11 11-5-5" />,
external: <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />,
globe: (
<>
<circle cx="12" cy="12" r="9" />
<path d="M3 12h18M12 3a15 15 0 0 1 0 18 15 15 0 0 1 0-18Z" />
</>
),
shield: <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />,
home: <path d="m3 11 9-8 9 8M5 10v10h14V10" />,
message: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />,
bell: <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
save: <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2ZM17 21v-8H7v8M7 3v5h8" />,
calendar: <path d="M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />,
phone: <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.8 2Z" />,
mail: <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM22 6l-10 7L2 6" />,
building: <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18ZM4 22h16M9 6h2M9 10h2M9 14h2M13 6h2M13 10h2M13 14h2M10 22v-3h4v3" />,
filter: <path d="M3 5h18l-7 8v6l-4-2v-4L3 5Z" />,
plus: <path d="M12 5v14M5 12h14" />,
trash: <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />,
edit: <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />,
flag: <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V4s-1 1-4 1-5-2-8-2-4 1-4 1v11ZM4 22v-7" />,
image: (
<>
<rect x="3" y="3" width="18" height="18" rx="2" />
<circle cx="8.5" cy="8.5" r="1.5" />
<path d="m21 15-5-5L5 21" />
</>
),
audio: <path d="M3 10v4M7 6v12M11 9v6M15 4v16M19 8v8M23 10v4" />,
mic: (
<>
<rect x="9" y="2" width="6" height="12" rx="3" />
<path d="M5 10a7 7 0 0 0 14 0M12 17v5M8 22h8" />
</>
),
stop: <rect x="5" y="5" width="14" height="14" rx="2" />,
};
export function Icon({ name, className, ...props }: { name: IconName; className?: string } & SVGProps<SVGSVGElement>) {
return (
<svg
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth={1.8}
strokeLinecap="round"
strokeLinejoin="round"
className={className}
aria-hidden="true"
{...props}
>
{ICONS[name]}
</svg>
); }
