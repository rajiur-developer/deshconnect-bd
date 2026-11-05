"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useLanguage } from "@/components/i18n/language-provider";

export function FormPendingButton({
  children,
  pendingLabel,
  variant = "primary",
  className,
}: {
  children: React.ReactNode;
  pendingLabel: string;
  variant?: "primary" | "outline";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const { t } = useLanguage();

  return (
    <Button type="submit" variant={variant} className={className} disabled={pending} aria-busy={pending}>
      {pending && <Spinner />}
      {pending ? t(pendingLabel) : typeof children === "string" ? t(children) : children}
    </Button>
  );
}
