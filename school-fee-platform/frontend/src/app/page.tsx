import Link from "next/link";
import { ArrowRight, Shield, Wallet } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <main className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[1.2fr_1fr]">
        <section className="space-y-6">
          <p className="inline-flex items-center rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
            Trusted school fee collection
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            School fee payments with clear receipts and confident tracking.
          </h1>
          <p className="max-w-xl text-slate-300">
            Parents can pay by student and fee category, while finance staff can
            monitor settlement status, record manual payments, and export reports.
          </p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "default" }), "bg-blue-600 hover:bg-blue-700")}
            >
              Go to login
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/register"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-slate-600 bg-transparent text-white",
              )}
            >
              Create parent account
            </Link>
          </div>
        </section>

        <div className="space-y-4">
          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wallet className="size-4 text-blue-400" />
                Parent workflow
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              View each child&apos;s outstanding tuition, transport, and exam fees, then pay selected line items using SIKINAPAY.
            </CardContent>
          </Card>
          <Card className="border-slate-800 bg-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="size-4 text-emerald-400" />
                Staff controls
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-slate-300">
              Monitor school-wide payment status, mark manual transactions, and export CSV reports for reconciliation.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
