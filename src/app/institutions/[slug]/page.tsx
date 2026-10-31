import type { Metadata } from "next";
import Link from "next/link";
import { EmptyRecordPage } from "@/components/layout/empty-record-page";
import { getHospitalBySlug, getInstitutionBySlug } from "@/services/institutions";
import { InstitutionDetail } from "@/components/institutions/institution-detail";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const institution = await getInstitutionBySlug(slug);
  const hospital = institution ? null : await getHospitalBySlug(slug);
  const record = institution ?? hospital;

  if (!record) return { title: "Institution not found" };

  return {
    title: record.name,
    description: record.description,
    alternates: {
      canonical: institution
        ? `/institutions/${institution.slug}`
        : `/hospitals/${hospital!.slug}`,
    },
  };
}

export default async function InstitutionDetailPage({ params }: Props) {
  const { slug } = await params;
  const institution = await getInstitutionBySlug(slug);
  // Some hospital cards still point to /institutions/[slug]. Resolve those
  // links against the hospitals table as a backwards-compatible fallback.
  const hospital = institution ? null : await getHospitalBySlug(slug);

  if (!institution && !hospital) {
    return (
      <EmptyRecordPage
        title="Schools and institutions"
        description="Explore education and community institutions across Bangladesh."
        media="/images/banner/Gram_place.webp"
        backHref="/institutions"
        backLabel="Browse institutions"
      />
    );
  }

  const record = institution ?? hospital!;

  return (
    <div className="container-x py-8">
      <InstitutionDetail institution={record} />
      <div className="mt-8">
        <Link
          href={hospital ? "/hospitals" : "/institutions"}
          className="text-sm font-medium text-brand-700"
        >
          ← Back to {hospital ? "hospitals" : "institutions"}
        </Link>
      </div>
    </div>
  );
}
