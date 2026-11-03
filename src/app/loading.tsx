export default function Loading() {
  return (
    <div
      role="status"
      aria-label="Loading page"
      className="container-x min-h-[65vh] py-8 sm:py-10"
    >
      <span className="sr-only">Loading page…</span>
      <div className="mx-auto max-w-7xl animate-pulse space-y-7">
        <div className="space-y-3">
          <div className="h-3 w-28 rounded-full bg-slate-200" />
          <div className="h-8 w-2/3 max-w-md rounded-xl bg-slate-200" />
          <div className="h-4 w-full max-w-xl rounded-full bg-slate-100" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
            >
              <div className="h-11 w-11 rounded-xl bg-slate-100" />
              <div className="mt-5 h-6 w-1/3 rounded-lg bg-slate-200" />
              <div className="mt-3 h-4 w-2/3 rounded-full bg-slate-100" />
              <div className="mt-2 h-3 w-1/2 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
          <div className="h-5 w-40 rounded-lg bg-slate-200" />
          <div className="mt-5 space-y-3">
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
            <div className="h-12 rounded-xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
