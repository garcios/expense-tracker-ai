export function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-24 rounded bg-slate-200" />
      <div className="mt-4 h-7 w-32 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-20 rounded bg-slate-100" />
    </div>
  );
}

export function ExpenseRowSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-slate-200" />
          <div>
            <div className="h-3.5 w-40 rounded bg-slate-200" />
            <div className="mt-2 h-3 w-24 rounded bg-slate-100" />
          </div>
        </div>
        <div className="h-4 w-16 rounded bg-slate-200" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-6 h-56 rounded bg-slate-100" />
    </div>
  );
}
