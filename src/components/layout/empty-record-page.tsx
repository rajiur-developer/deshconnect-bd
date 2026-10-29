import Link from "next/link";
import { PageBanner } from "@/components/layout/page-banner";
import { EmptyState } from "@/components/ui/empty-state";

export function EmptyRecordPage({
  title,
  description,
  media,
  backHref,
  backLabel = "Browse all",
}: {
  title: string;
  description: string;
  media: string;
  backHref: string;
  backLabel?: string;
}) {
  return (
    <>
      <PageBanner title={title} description={description} media={media} />
      <div className="container-x py-10">
        <EmptyState
          title="This page is ready for content"
          description="It will appear here when an administrator publishes it. Other site features remain available in the meantime."
          action={
            <Link href={backHref} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
              {backLabel}
            </Link>
          }
        />
      </div>
    </>
  );
}
