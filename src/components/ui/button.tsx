"use client";

import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/i18n/language-provider";
import { buttonClasses, type Variant, type Size } from "./button-styles";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export function Button({ variant, size, className, type = "button", children, ...props }: ButtonProps) {
  const { t } = useLanguage();
  return (
    <button type={type} className={buttonClasses({ variant, size, className })} {...props}>
      {typeof children === "string" ? t(children) : children}
    </button>
  );
}

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export function LinkButton({ href, variant, size, className, children, ...props }: LinkButtonProps) {
  const { t } = useLanguage();
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
      {typeof children === "string" ? t(children) : children}
    </Link>
  );
}
