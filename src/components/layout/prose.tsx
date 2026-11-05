"use client";
import { Children, cloneElement, isValidElement, type ReactNode } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
function translateChildren(children: ReactNode, t: (value: string) => string): ReactNode {
  return Children.map(children, (child) => {
    if (typeof child === "string") {
      const normalized = child.replace(/\s+/g, " ").trim();
      if (!normalized) return child;
      return t(normalized);
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      return cloneElement(child, undefined, translateChildren(child.props.children, t));
    }
    return child;
  });
}
export function Prose({ children, translate = false }: { children: ReactNode; translate?: boolean }) {
  const { t } = useLanguage();
  return <div className="prose-body mx-auto max-w-3xl text-slate-700">{translate ? translateChildren(children, t) : children}</div>;
}
