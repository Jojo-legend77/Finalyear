"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  BanknoteArrowDown,
  CircleAlert,
  CircleCheck,
  CircleDollarSign,
  Clock4,
  Download,
  GraduationCap,
  PenLine,
} from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { StatusChip } from "@/components/status-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { clearAuth, getAccessToken, getRole } from "@/lib/auth";
import { apiClient, setAuthToken } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import type { PaymentTransaction } from "@/lib/types";

type StaffOverview = {
  students_count: number;
  transactions_count: number;
  successful_payments: number;
  pending_payments: number;
  failed_payments: number;
};

const metricConfig = [
  { key: "students_count", label: "Students", icon: GraduationCap, tint: "bg-sky-50 text-sky-600" },
  {
    key: "transactions_count",
    label: "Transactions",
    icon: CircleDollarSign,
    tint: "bg-slate-100 text-slate-600",
  },
  {
    key: "successful_payments",
    label: "Successful",
    icon: CircleCheck,
    tint: "bg-emerald-50 text-emerald-600",
  },
  { key: "pending_payments", label: "Pending", icon: Clock4, tint: "bg-amber-50 text-amber-600" },
] as const;

export default function StaffPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<StaffOverview | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [manualForm, setManualForm] = useState({ student_id: "", fee_ids: "", note: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const token = getAccessToken();
      if (!token || getRole() !== "staff_admin") {
        clearAuth();
        router.push("/login");
        return;
      }
      setAuthToken(token);
      const [overviewResponse, transactionResponse] = await Promise.all([
        apiClient.get<StaffOverview>("/reports/staff/overview/"),
        apiClient.get<PaymentTransaction[]>("/payments/staff/transactions/"),
      ]);
      setOverview(overviewResponse.data);
      setTransactions(transactionResponse.data);
    } catch {
      setError("Unable to load staff data. Please refresh the page.");
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitManualPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const feeIds = manualForm.fee_ids
        .split(",")
        .map((item) => Number.parseInt(item.trim(), 10))
        .filter((item) => Number.isFinite(item));

      await apiClient.post("/payments/staff/manual/", {
        student_id: Number.parseInt(manualForm.student_id, 10),
        student_fee_ids: feeIds,
        note: manualForm.note,
      });
      setMessage("Manual payment recorded successfully.");
      setManualForm({ student_id: "", fee_ids: "", note: "" });
      await loadData();
    } catch {
      setError("Manual payment could not be recorded. Check the student and fee IDs.");
    }
  };

  const exportCsv = () => {
    apiClient
      .get("/payments/staff/export/", { responseType: "blob" })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data], { type: "text/csv" }));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "payment_transactions.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch((requestError) => {
        if (axios.isAxiosError(requestError)) {
          setError("Unable to export the transaction report.");
        }
      });
  };

  return (
    <AppShell
      title="Staff finance dashboard"
      subtitle="Monitor payment status across all students, record manual payments, and export reports."
    >
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricConfig.map((metric) => (
          <Card key={metric.key} className="border-border/80 shadow-none">
            <CardContent className="flex items-center gap-4 py-5">
              <div className={`flex size-11 items-center justify-center rounded-lg ${metric.tint}`}>
                <metric.icon className="size-5" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {metric.label}
                </p>
                <p className="text-xl font-semibold tabular-nums text-foreground">
                  {overview?.[metric.key] ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
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

      <Card className="mb-8 border-border/80 shadow-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <PenLine className="size-4 text-muted-foreground" />
            Record a manual payment
          </CardTitle>
          <Button variant="outline" size="sm" onClick={exportCsv}>
            <Download className="size-3.5" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Use this for cash-desk or bank-deposit payments. Settlement updates balances and generates a
            receipt just like a gateway payment.
          </p>
          <form onSubmit={submitManualPayment} className="grid gap-4 md:grid-cols-[1fr_1.5fr_1.5fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                className="h-10"
                placeholder="e.g. 2"
                value={manualForm.student_id}
                onChange={(e) => setManualForm((prev) => ({ ...prev, student_id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_ids">Fee IDs (comma separated)</Label>
              <Input
                id="fee_ids"
                className="h-10"
                placeholder="e.g. 4, 5"
                value={manualForm.fee_ids}
                onChange={(e) => setManualForm((prev) => ({ ...prev, fee_ids: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                className="h-10"
                placeholder="e.g. Cash desk receipt #123"
                value={manualForm.note}
                onChange={(e) => setManualForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="h-10 bg-slate-900 hover:bg-slate-800">
                <BanknoteArrowDown className="size-4" />
                Record payment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/80 py-0 shadow-none">
        <div className="border-b border-border/80 px-6 py-4">
          <p className="font-semibold text-foreground">All transactions</p>
          <p className="text-sm text-muted-foreground">
            Every gateway and manual payment across the school, most recent first.
          </p>
        </div>
        <CardContent className="px-6 pb-6 pt-2">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Reference</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell className="font-mono text-xs">{txn.tx_ref}</TableCell>
                  <TableCell>{txn.parent_name}</TableCell>
                  <TableCell>{txn.student_name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{txn.provider}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(txn.paid_at ?? txn.created_at)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={txn.status} />
                  </TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    ETB {formatMoney(txn.amount)}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    No transactions recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
