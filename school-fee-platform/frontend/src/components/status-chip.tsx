import { cn } from "@/lib/utils";

const styles: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  partial: "bg-amber-50 text-amber-700 ring-amber-600/20",
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  initiated: "bg-sky-50 text-sky-700 ring-sky-600/20",
  outstanding: "bg-rose-50 text-rose-700 ring-rose-600/20",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const labels: Record<string, string> = {
  paid: "Paid",
  success: "Successful",
  partial: "Partially paid",
  pending: "Pending",
  initiated: "Initiated",
  outstanding: "Outstanding",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function StatusChip({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status] ?? "bg-slate-100 text-slate-600 ring-slate-500/20",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {labels[status] ?? status}
    </span>
  );
}
