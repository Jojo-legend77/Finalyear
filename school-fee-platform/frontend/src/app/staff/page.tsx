"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Download, FileSpreadsheet } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { clearAuth, getAccessToken, getRole } from "@/lib/auth";
import { apiClient, setAuthToken } from "@/lib/api";
import type { PaymentTransaction } from "@/lib/types";

type StaffOverview = {
  students_count: number;
  transactions_count: number;
  successful_payments: number;
  pending_payments: number;
  failed_payments: number;
};

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
      setError("Unable to load staff data.");
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
      setError("Manual payment could not be recorded.");
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
          setError("Unable to export transaction report.");
        }
      });
  };

  return (
    <AppShell
      title="Staff Finance Dashboard"
      subtitle="Track school-wide payment status, record manual payments, and export reconciliation files."
    >
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <MetricCard label="Students" value={overview?.students_count ?? 0} />
        <MetricCard label="Transactions" value={overview?.transactions_count ?? 0} />
        <MetricCard label="Successful" value={overview?.successful_payments ?? 0} />
        <MetricCard label="Pending" value={overview?.pending_payments ?? 0} />
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-slate-900">Manual payment marking</CardTitle>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-1 size-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitManualPayment} className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input
                id="student_id"
                value={manualForm.student_id}
                onChange={(e) => setManualForm((prev) => ({ ...prev, student_id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee_ids">Student Fee IDs (comma separated)</Label>
              <Input
                id="fee_ids"
                value={manualForm.fee_ids}
                onChange={(e) => setManualForm((prev) => ({ ...prev, fee_ids: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note</Label>
              <Input
                id="note"
                value={manualForm.note}
                onChange={(e) => setManualForm((prev) => ({ ...prev, note: e.target.value }))}
              />
            </div>
            <Button type="submit" className="bg-emerald-700 hover:bg-emerald-800 md:col-span-3">
              Mark manual payment
            </Button>
          </form>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <FileSpreadsheet className="size-5 text-blue-700" />
            Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ref</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{txn.tx_ref}</TableCell>
                  <TableCell>{txn.parent_name}</TableCell>
                  <TableCell>{txn.student_name}</TableCell>
                  <TableCell>{txn.status}</TableCell>
                  <TableCell className="text-right">ETB {txn.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm text-slate-500">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
      </CardContent>
    </Card>
  );
}
