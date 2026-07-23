import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <Card className="w-full max-w-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-900">SIKINAPAY Mock Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>
            This page simulates the external SIKINAPAY checkout during local development.
          </p>
          <p>
            Transaction reference: <span className="font-semibold">{txRef ?? "N/A"}</span>
          </p>
          <p>In production, users are redirected to the real gateway checkout URL.</p>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "default" }), "bg-blue-700 hover:bg-blue-800")}
          >
            Return to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
