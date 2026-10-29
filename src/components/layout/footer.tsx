import Link from "next/link";
import { FOOTER_LINKS, SITE } from "@/config/site";
import MainLogo from "../../../public/logo/Main-Logo.webp";
export function Footer() {
return (
<footer className="mt-16 border-t border-slate-200 bg-white">
<div className="container-x grid gap-8 py-12 md:grid-cols-4"><div className="md:col-span-4"><Link href="/blood-donation" className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-white to-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"><span className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-rose-600 text-white"><span aria-hidden="true">♥</span></span><span><span className="block font-bold text-rose-900">Blood donation support</span><span className="mt-0.5 block text-sm text-rose-700">Find voluntary donors or share a blood request.</span></span></span><span className="inline-flex w-fit rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white">Find blood support →</span></Link></div>
<div>
<Link href="/" className="flex items-center gap-2 font-bold text-brand-700">
<img src={MainLogo.src} alt="" className="h-9 w-9 object-contain" />
{SITE.name}
</Link>
<p className="mt-3 text-sm text-slate-600">{SITE.description}</p>
<p className="mt-4 text-xs text-slate-400">Built for the people of Bangladesh.</p>
</div>
{FOOTER_LINKS.map((group) => (
<div key={group.title}>
<h3 className="text-sm font-semibold text-slate-900">{group.title}</h3>
<ul className="mt-3 space-y-2">
{group.links.map((link) => (
<li key={link.href}>
<Link href={link.href} className="text-sm text-slate-600 hover:text-brand-700">
{link.label}
</Link>
</li>
))}
</ul>
</div>
))}
</div>
<div className="border-t border-slate-200">
<div className="container-x flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
<p>© {new Date().getFullYear()} {SITE.name}. All rights reserved.</p>
<div className="flex gap-4">
<Link href="/privacy-policy" className="hover:text-brand-700">Privacy Policy</Link>
<Link href="/terms" className="hover:text-brand-700">Terms of Use</Link>
<Link href="/about" className="hover:text-brand-700">About</Link>
</div>
</div>
</div>
</footer>
); }
