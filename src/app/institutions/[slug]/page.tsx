import type { Metadata } from "next"; import Link from "next/link"; import { notFound } from "next/navigation"; import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getInstitutionBySlug } from "@/services/institutions"; import { InstitutionDetail } from "@/components/institutions/institution-detail";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
const { slug } = await params;
const institution = await getInstitutionBySlug(slug);
if (!institution) return { title: "Institution not found" };
return { title: institution.name, description: institution.description, alternates: { canonical: `/institutions/${institution.slug}` } }; }
export default async function InstitutionDetailPage({ params }: Props) {
const { slug } = await params;
const institution = await getInstitutionBySlug(slug);
if (!institution) return <EmptyRecordPage title="Schools and institutions" description="Explore education and community institutions across Bangladesh." media="/images/banner/Gram_place.webp" backHref="/institutions" backLabel="Browse institutions" />;
return (
<div className="container-x py-8">
<InstitutionDetail institution={institution} />
<div className="mt-8">
<Link href="/institutions" className="text-sm font-medium text-brand-700">← Back to institutions</Link>
</div>
</div>
); }
