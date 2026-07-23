import Link from "next/link";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MockCheckoutProps = {
  searchParams: Promise<{
    tx_ref?: string;
  }>;
};

export default async function MockCheckoutPage({ searchParams }: MockCheckoutProps) {
  const params = await searchParams;
  const txRef = params.tx_ref;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center gap-2 text-white">
          <div className="flex size-9 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
            <LockKeyhole className="size-4" />
          </div>
          <p className="text-lg font-semibold tracking-tight">SIKINAPAY Checkout</p>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl">
          <div className="border-b border-slate-100 bg-slate-50 px-6 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Sandbox environment
            </p>
            <p className="mt-0.5 text-sm text-slate-700">
              This page simulates the external SIKINAPAY gateway during local development.
            </p>
          </div>

          <div className="space-y-4 px-6 py-6">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs text-slate-500">Transaction reference</p>
              <p className="mt-0.5 font-mono text-sm font-medium text-slate-900">{txRef ?? "N/A"}</p>
            </div>

            <p className="text-sm leading-relaxed text-slate-600">
              In production, parents complete their payment here using mobile money, bank transfer, or
              card. Settlement is then confirmed back to the school through a signed webhook.
            </p>

            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "h-11 w-full bg-slate-900 hover:bg-slate-800",
              )}
            >
              <ArrowLeft className="size-4" />
              Return to dashboard
            </Link>
          </div>

          <div className="flex items-center justify-center gap-1.5 border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-500">
            <ShieldCheck className="size-3.5 text-emerald-600" />
            Secured by SIKINAPAY · Amounts verified server-side
          </div>
        </div>
      </div>
    </div>
  );
}
