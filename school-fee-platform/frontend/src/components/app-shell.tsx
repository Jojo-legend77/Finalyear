"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAuth, getRole } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();
  const role = typeof window !== "undefined" ? getRole() : null;

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-md bg-slate-900 p-2 text-white">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-sm text-slate-500">School Fee Platform</p>
              <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-sm text-slate-700 hover:text-slate-900">
              Parent
            </Link>
            <Link href="/staff" className="text-sm text-slate-700 hover:text-slate-900">
              Staff
            </Link>
            {role && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800">
                <ShieldCheck className="size-3.5" />
                {role}
              </span>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-1 size-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <p className="mb-6 text-sm text-slate-600">{subtitle}</p>
        {children}
      </main>
    </div>
  );
}
