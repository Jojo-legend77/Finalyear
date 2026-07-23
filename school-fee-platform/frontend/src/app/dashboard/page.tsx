"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  FileDown,
  GraduationCap,
  ReceiptText,
  Wallet,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clearAuth, getAccessToken, getRole } from "@/lib/auth";
import { apiClient, getMediaUrl, setAuthToken } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type { ChildDashboard, ParentDashboardResponse } from "@/lib/types";

type InitiateResult = {
  transaction: {
    tx_ref: string;
    checkout_url: string;
  };
};

export default function ParentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<ParentDashboardResponse | null>(null);
  const [selectedFees, setSelectedFees] = useState<Record<number, number[]>>({});
  const [processingStudentId, setProcessingStudentId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      const token = getAccessToken();
      if (!token || getRole() !== "parent") {
        clearAuth();
        router.push("/login");
        return;
      }
      setAuthToken(token);
      const response = await apiClient.get<ParentDashboardResponse>("/reports/parent/dashboard/");
      setData(response.data);
    } catch {
      setError("Unable to load your dashboard. Please refresh the page.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFee = (studentId: number, feeId: number) => {
    setSelectedFees((prev) => {
      const current = prev[studentId] ?? [];
      const next = current.includes(feeId)
        ? current.filter((id) => id !== feeId)
        : [...current, feeId];
      return { ...prev, [studentId]: next };
    });
  };

  const totals = useMemo(() => {
    if (!data) return { outstanding: 0, paid: 0 };
    return data.children.reduce(
      (acc, child) => ({
        outstanding: acc.outstanding + Number.parseFloat(child.summary.total_outstanding),
        paid: acc.paid + Number.parseFloat(child.summary.total_paid),
      }),
      { outstanding: 0, paid: 0 },
    );
  }, [data]);

  const selectedTotal = (child: ChildDashboard) => {
    const feeIds = selectedFees[child.student.id] ?? [];
    return child.fees
      .filter((fee) => feeIds.includes(fee.id))
      .reduce((sum, fee) => sum + Number.parseFloat(fee.outstanding_amount), 0);
  };

  const initiatePayment = async (child: ChildDashboard) => {
    const feeIds = selectedFees[child.student.id] ?? [];
    if (feeIds.length === 0) {
      setError("Select at least one outstanding fee before paying.");
      return;
    }
    setProcessingStudentId(child.student.id);
    setError("");
    setMessage("");
    try {
      const response = await apiClient.post<InitiateResult>("/payments/initiate/", {
        student_id: child.student.id,
        student_fee_ids: feeIds,
      });
      setMessage(
        `Payment ${response.data.transaction.tx_ref} created for ${child.student.full_name}. Complete it on the SIKINAPAY checkout page.`,
      );
      setSelectedFees((prev) => ({ ...prev, [child.student.id]: [] }));
      window.open(response.data.transaction.checkout_url, "_blank", "noopener,noreferrer");
      await loadDashboard();
    } catch {
      setError("Payment could not be initiated. Verify the selected fees and try again.");
    } finally {
      setProcessingStudentId(null);
    }
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  return (
    <AppShell
      title={data ? `Welcome, ${data.parent.name}` : "Parent dashboard"}
      subtitle="Review each child's balance, select outstanding fees, and pay securely with SIKINAPAY."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card className="border-border/80 shadow-none">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
              <Wallet className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total outstanding
              </p>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                ETB {formatMoney(totals.outstanding)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CircleCheck className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Total paid
              </p>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                ETB {formatMoney(totals.paid)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-none">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex size-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
              <GraduationCap className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Linked children
              </p>
              <p className="text-xl font-semibold tabular-nums text-foreground">
                {data?.children.length ?? 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      )}
      {message && (
        <div className="mb-6 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          {message}
        </div>
      )}

      <div className="space-y-8">
        {data?.children.map((child) => {
          const feeIds = selectedFees[child.student.id] ?? [];
          const reviewTotal = selectedTotal(child);
          return (
            <Card key={child.student.id} className="overflow-hidden border-border/80 py-0 shadow-none">
              <div className="flex flex-col gap-3 border-b border-border/80 bg-muted/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {initials(child.student.full_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{child.student.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {child.student.class_name} {child.student.section} · {child.relationship} ·{" "}
                      {child.student.admission_number}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground">Outstanding balance</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">
                    ETB {formatMoney(child.summary.total_outstanding)}
                  </p>
                </div>
              </div>

              <CardContent className="px-6 pb-6 pt-2">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-10" />
                      <TableHead>Fee category</TableHead>
                      <TableHead>Term</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Amount due</TableHead>
                      <TableHead className="text-right">Outstanding</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {child.fees.map((fee) => {
                      const selectable = Number.parseFloat(fee.outstanding_amount) > 0;
                      const isSelected = feeIds.includes(fee.id);
                      return (
                        <TableRow
                          key={fee.id}
                          className={isSelected ? "bg-primary/4" : undefined}
                          onClick={() => selectable && toggleFee(child.student.id, fee.id)}
                          style={{ cursor: selectable ? "pointer" : "default" }}
                        >
                          <TableCell>
                            <input
                              type="checkbox"
                              className="size-4 accent-slate-900"
                              checked={isSelected}
                              disabled={!selectable}
                              onChange={() => toggleFee(child.student.id, fee.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{fee.category.name}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {fee.term} · {fee.academic_year}
                          </TableCell>
                          <TableCell>
                            <StatusChip status={fee.status} />
                          </TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">
                            {formatMoney(fee.amount_due)}
                          </TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatMoney(fee.outstanding_amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                <div className="mt-5 flex flex-col gap-3 rounded-lg border border-border/80 bg-muted/40 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    {feeIds.length > 0 ? (
                      <p className="text-foreground">
                        <span className="font-semibold">{feeIds.length}</span> fee
                        {feeIds.length > 1 ? "s" : ""} selected · You will pay{" "}
                        <span className="font-semibold tabular-nums">ETB {formatMoney(reviewTotal)}</span>
                      </p>
                    ) : (
                      <p className="text-muted-foreground">
                        Select the outstanding fees you want to pay for {child.student.full_name}.
                      </p>
                    )}
                  </div>
                  <Button
                    onClick={() => initiatePayment(child)}
                    disabled={processingStudentId === child.student.id || feeIds.length === 0}
                    className="bg-slate-900 hover:bg-slate-800"
                  >
                    {processingStudentId === child.student.id ? (
                      "Initializing payment..."
                    ) : (
                      <>
                        Pay with SIKINAPAY
                        <ArrowUpRight className="size-4" />
                      </>
                    )}
                  </Button>
                </div>

                {child.transactions.length > 0 && (
                  <div className="mt-6">
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ReceiptText className="size-4 text-muted-foreground" />
                      Payment history
                    </p>
                    <div className="overflow-hidden rounded-lg border border-border/80">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <TableHead>Reference</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Receipt</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {child.transactions.map((txn) => (
                            <TableRow key={txn.id}>
                              <TableCell className="font-mono text-xs">{txn.tx_ref}</TableCell>
                              <TableCell className="text-muted-foreground">
                                {formatDate(txn.paid_at ?? txn.created_at)}
                              </TableCell>
                              <TableCell>
                                <StatusChip status={txn.status} />
                              </TableCell>
                              <TableCell className="text-right font-medium tabular-nums">
                                ETB {formatMoney(txn.amount)}
                              </TableCell>
                              <TableCell className="text-right">
                                {txn.receipt_file ? (
                                  <a
                                    href={getMediaUrl(txn.receipt_file)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                  >
                                    <FileDown className="size-3.5" />
                                    PDF
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground">—</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}
