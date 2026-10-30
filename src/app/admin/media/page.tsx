import { insforgeSelectMany } from "@/lib/insforge"; import { mapDbRow } from "@/lib/db/insforge"; import { Badge, Card } from "@/components/ui/badge"; import { PageHeader } from "@/components/layout/page-header";
export const metadata = { title: "Media" };
export default async function AdminMediaPage() {
const [placeRows, institutionRows, hospitalRows, businessRows, newsRows, postRows] = await Promise.all([insforgeSelectMany("places", { limit: "500" }), insforgeSelectMany("institutions", { limit: "500" }), insforgeSelectMany("hospitals", { limit: "500" }), insforgeSelectMany("businesses", { limit: "500" }), insforgeSelectMany("news", { limit: "500" }), insforgeSelectMany("posts", { limit: "500" })]);
const places = mapDbRow(placeRows.data || []); const institutions = mapDbRow(institutionRows.data || []); const hospitals = mapDbRow(hospitalRows.data || []); const businesses = mapDbRow(businessRows.data || []); const news = mapDbRow(newsRows.data || []); const posts = mapDbRow(postRows.data || []);
const images = new Set<string>();
for (const place of places) {
images.add(place.image);
place.gallery?.forEach((src) => images.add(src));
}
for (const institution of institutions) images.add(institution.image);
for (const hospital of hospitals) images.add(hospital.image);
for (const business of businesses) images.add(business.image);
for (const article of news) images.add(article.image);
return (
<>
<PageHeader title="Media" description="Images and other media content used across the platform." />
<div className="grid gap-4 sm:grid-cols-3">
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">{images.size}</p>
<p className="text-sm text-slate-600">Referenced images</p>
</Card>
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">{places.reduce((sum, place) => sum + (place.gallery?.length ?? 0), 0)}</p>
<p className="text-sm text-slate-600">Gallery images</p>
</Card>
<Card className="p-5">
<p className="text-2xl font-bold text-slate-900">{posts.filter((post) => post.image).length}</p>
<p className="text-sm text-slate-600">Post attachments</p>
</Card>
</div>
<Card className="mt-6 p-5">
<h2 className="font-semibold text-slate-900">Image library</h2>
<ul className="mt-3 flex flex-wrap gap-2">
{[...images].map((src) => (
<li key={src} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">{src}</li>
))}
</ul>
<Badge tone="amber" className="mt-4">Media management is limited in local mode</Badge>
</Card>
</>
); }
