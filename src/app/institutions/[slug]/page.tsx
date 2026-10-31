import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getHospitalBySlug, getInstitutionBySlug } from "@/services/institutions";
import { InstitutionDetail } from "@/components/institutions/institution-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const institution = await getInstitutionBySlug(slug);
  if (institution) return { title: institution.name, description: institution.description, alternates: { canonical: `/institutions/${institution.slug}` } };
  const hospital = await getHospitalBySlug(slug);
  if (hospital) return { title: hospital.name, description: hospital.description, alternates: { canonical: `/hospitals/${hospital.slug}` } };
  return { title: "Institution not found" };
}

export default async function InstitutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const institution = await getInstitutionBySlug(slug);
  if (institution) return <div className="container-x py-8"><InstitutionDetail institution={institution} /><div className="mt-8"><Link href="/institutions" className="text-sm font-medium text-brand-700">← Back to institutions</Link></div></div>;
  const hospital = await getHospitalBySlug(slug);
  if (hospital) redirect(`/hospitals/${hospital.slug}`);
  return <EmptyRecordPage title="Schools and institutions" description="Explore education and community institutions across Bangladesh." media="/images/banner/Gram_place.webp" backHref="/institutions" backLabel="Browse institutions" />;
}
