import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  FileText,
  Landmark,
  LockKeyhole,
  ReceiptText,
  Users,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "One account, every child",
    description:
      "Link all of your children under a single parent account and see each child's fees side by side.",
  },
  {
    icon: ReceiptText,
    title: "Clear fee breakdown",
    description:
      "Tuition, transport, and exam fees are itemized per term, so you always know exactly what you are paying for.",
  },
  {
    icon: LockKeyhole,
    title: "Secure SIKINAPAY checkout",
    description:
      "Payments run through the SIKINAPAY gateway with server-verified amounts and webhook-confirmed settlement.",
  },
  {
    icon: FileText,
    title: "Instant PDF receipts",
    description:
      "Every successful payment generates a downloadable receipt automatically, ready for your records.",
  },
];

const steps = [
  { number: "01", title: "Sign in", description: "Access your parent account securely." },
  { number: "02", title: "Select fees", description: "Pick the outstanding items for each child." },
  { number: "03", title: "Pay with SIKINAPAY", description: "Complete checkout through the gateway." },
  { number: "04", title: "Get your receipt", description: "Download the PDF receipt instantly." },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-slate-100">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Landmark className="size-4.5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-slate-900">SikinaPay School</p>
              <p className="text-[11px] text-slate-500">Fee payment portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "ghost" }), "text-slate-700")}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className={cn(buttonVariants({ variant: "default" }), "bg-slate-900 hover:bg-slate-800")}
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center">
        <p className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-600">
          <BadgeCheck className="size-3.5 text-emerald-600" />
          Trusted school fee collection, powered by SIKINAPAY
        </p>
        <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.1] tracking-tight text-slate-900">
          Pay school fees with total clarity and confidence.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-slate-600">
          See exactly what each child owes, pay securely in a few clicks, and keep a verified receipt for
          every transaction — no queues, no guesswork.
        </p>
        <div className="mt-10 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-11 bg-slate-900 px-6 text-base hover:bg-slate-800",
            )}
          >
            Go to my dashboard
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/register"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-6 text-base")}
          >
            Create parent account
          </Link>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/60">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="bg-transparent p-6">
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                <feature.icon className="size-4.5 text-slate-700" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
            A payment flow you never second-guess
          </h2>
          <p className="mt-3 text-slate-600">Four steps from login to verified receipt.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.number} className="rounded-xl border border-slate-200 p-6">
              <p className="text-xs font-semibold tracking-widest text-slate-400">{step.number}</p>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="rounded-2xl bg-slate-900 px-8 py-14 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            School staff? Manage everything in one place.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-300">
            Track payment status across all students, record manual payments at the cash desk, and export
            reconciliation reports in CSV.
          </p>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "mt-8 h-11 bg-white px-6 text-base text-slate-900 hover:bg-slate-100",
            )}
          >
            Staff sign in
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8 text-xs text-slate-500">
          <p>SikinaPay School — secure fee payments</p>
          <p>Payments processed by SIKINAPAY</p>
        </div>
      </footer>
    </div>
  );
}
