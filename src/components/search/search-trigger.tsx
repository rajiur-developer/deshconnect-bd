"use client";

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/components/i18n/language-provider";
import { Icon } from "@/components/ui/icons";
import { SearchAutocomplete } from "@/components/search/search-autocomplete";

export function SearchTrigger() {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.querySelector("input")?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("Open search")}
        title={t("Search")}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
      >
        <Icon name="search" className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/45 px-4 pt-[12vh] backdrop-blur-sm sm:pt-[16vh]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="dc-search-dialog-title"
            className="w-full max-w-2xl overflow-visible rounded-2xl border border-white/70 bg-white p-4 shadow-[0_28px_90px_-24px_rgba(2,20,12,.55)] sm:p-6"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 id="dc-search-dialog-title" className="text-lg font-bold text-slate-900">
                  {t("Search DeshConnect")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {t("Find places, institutions, businesses and services.")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={t("Close search")}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </div>

            <form action="/search" className="relative">
              <SearchAutocomplete
                placeholder="Search places and services…"
                ariaLabel="Search DeshConnect"
                className="h-12 w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                wrapperClassName="relative"
              />
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Icon name="search" className="h-5 w-5" />
              </span>
              <p className="mt-3 text-xs text-slate-400">
                {t("Type at least 2 characters to see suggestions. Press Enter to view all results.")}
              </p>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
