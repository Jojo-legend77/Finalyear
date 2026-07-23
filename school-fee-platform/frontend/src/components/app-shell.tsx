"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Landmark, LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { clearAuth, getRole } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRole(getRole());
  }, []);

  const handleLogout = () => {
    clearAuth();
    setAuthToken(null);
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Parent portal" },
    { href: "/staff", label: "Staff finance" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Landmark className="size-4.5" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-foreground">SikinaPay School</p>
              <p className="text-[11px] text-muted-foreground">Fee payment portal</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  pathname.startsWith(item.href)
                    ? "bg-primary/8 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {role && (
              <span className="hidden rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground sm:inline-flex">
                {role.replace("_", " ")}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="size-3.5" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-8">
        <p className="border-t border-border pt-6 text-xs text-muted-foreground">
          Payments are processed securely through SIKINAPAY. Receipts are generated automatically for every
          successful transaction.
        </p>
      </footer>
    </div>
  );
}
