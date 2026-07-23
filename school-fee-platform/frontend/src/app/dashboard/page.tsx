"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleDollarSign, ExternalLink } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clearAuth, getAccessToken, getRole } from "@/lib/auth";
import { apiClient, getMediaUrl, setAuthToken } from "@/lib/api";
import type { ChildDashboard, ParentDashboardResponse } from "@/lib/types";

type InitiateResult = {
  transaction: {
    tx_ref: string;
    checkout_url: string;
  };
};

const statusVariant: Record<string, "default" | "secondary"> = {
  paid: "secondary",
  partial: "default",
  outstanding: "default",
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
      setError("Unable to load dashboard.");
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

  const childTotals = useMemo(() => {
    if (!data) return 0;
    return data.children.reduce(
      (sum, child) => sum + Number.parseFloat(child.summary.total_outstanding),
      0,
    );
  }, [data]);

  const initiatePayment = async (student: ChildDashboard) => {
    const feeIds = selectedFees[student.student.id] ?? [];
    if (feeIds.length === 0) {
      setError("Select at least one outstanding fee before initiating payment.");
      return;
    }
    setProcessingStudentId(student.student.id);
    setError("");
    setMessage("");
    try {
      const response = await apiClient.post<InitiateResult>("/payments/initiate/", {
        student_id: student.student.id,
        student_fee_ids: feeIds,
      });
      setMessage(
        `Payment ${response.data.transaction.tx_ref} created. Use the checkout link to complete payment in SIKINAPAY.`,
      );
      window.open(response.data.transaction.checkout_url, "_blank", "noopener,noreferrer");
      await loadDashboard();
    } catch {
      setError("Payment initiation failed. Verify selected fees and try again.");
    } finally {
      setProcessingStudentId(null);
    }
  };

  return (
    <AppShell
      title="Parent Dashboard"
      subtitle="View child-level balances and initiate fee payments with full clarity."
    >
      <Card className="mb-6 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <CircleDollarSign className="size-5 text-blue-700" />
            Outstanding balance overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-slate-900">
            ETB {childTotals.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-slate-500">Across all linked children</p>
        </CardContent>
      </Card>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
      {message && <p className="mb-4 text-sm text-emerald-700">{message}</p>}

      <div className="space-y-6">
        {data?.children.map((child) => (
          <Card key={child.student.id} className="border-slate-200">
            <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-lg text-slate-900">{child.student.full_name}</CardTitle>
                <p className="text-sm text-slate-500">
                  {child.relationship} • {child.student.class_name} {child.student.section}
                </p>
              </div>
              <Badge className="w-fit bg-slate-800 text-white">
                Outstanding ETB{" "}
                {Number.parseFloat(child.summary.total_outstanding).toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </Badge>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Select</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Outstanding</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {child.fees.map((fee) => {
                    const selectable = Number.parseFloat(fee.outstanding_amount) > 0;
                    const isSelected = (selectedFees[child.student.id] ?? []).includes(fee.id);
                    return (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            disabled={!selectable}
                            onChange={() => toggleFee(child.student.id, fee.id)}
                          />
                        </TableCell>
                        <TableCell>{fee.category.name}</TableCell>
                        <TableCell>
                          {fee.term} {fee.academic_year}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariant[fee.status] ?? "default"}>{fee.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          ETB{" "}
                          {Number.parseFloat(fee.outstanding_amount).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                          })}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button
                  onClick={() => initiatePayment(child)}
                  className="bg-blue-700 hover:bg-blue-800"
                  disabled={processingStudentId === child.student.id}
                >
                  {processingStudentId === child.student.id ? "Initializing..." : "Pay selected fees"}
                </Button>
              </div>

              {child.transactions.length > 0 && (
                <div className="mt-6 rounded-md border border-slate-200">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reference</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {child.transactions.map((txn) => (
                        <TableRow key={txn.id}>
                          <TableCell>{txn.tx_ref}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1 text-sm text-slate-700">
                              <CheckCircle2 className="size-4 text-emerald-600" />
                              {txn.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            ETB{" "}
                            {Number.parseFloat(txn.amount).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            {txn.receipt_file ? (
                              <a
                                href={getMediaUrl(txn.receipt_file)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-blue-700 hover:underline"
                              >
                                Download <ExternalLink className="size-4" />
                              </a>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
