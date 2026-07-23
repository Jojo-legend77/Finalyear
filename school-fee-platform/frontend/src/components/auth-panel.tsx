import Link from "next/link";
import { Landmark, ShieldCheck } from "lucide-react";

export function AuthPanel() {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-40 size-96 rounded-full bg-blue-500/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-emerald-500/10 blur-3xl"
      />

      <Link href="/" className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
          <Landmark className="size-4.5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold tracking-tight">SikinaPay School</p>
          <p className="text-[11px] text-slate-400">Fee payment portal</p>
        </div>
      </Link>

      <div className="relative">
        <h2 className="max-w-sm text-3xl font-semibold leading-snug tracking-tight">
          Every fee itemized. Every payment verified. Every receipt saved.
        </h2>
        <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
          Parents pay tuition, transport, and exam fees for all of their children from one secure account.
        </p>
      </div>

      <div className="relative flex items-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="size-4 text-emerald-400" />
        Payments secured by the SIKINAPAY gateway with webhook-verified settlement.
      </div>
    </div>
  );
}
