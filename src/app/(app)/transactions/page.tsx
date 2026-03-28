"use client";

import { useEffect, useState, useCallback } from "react";
import { Transaction } from "@/types";
import { formatCurrency, getMonthLabel } from "@/lib/utils/calculations";
import { MonthPicker } from "@/components/dashboard/month-picker";
import { PdfImport } from "@/components/transactions/pdf-import";
import { ManualEntry } from "@/components/transactions/manual-entry";
import { format } from "date-fns";

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function TransactionsPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<"all" | "credit_card" | "bank">("all");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ month });
      if (source !== "all") params.set("source", source);
      const res = await fetch(`/api/transactions?${params}`);
      if (res.ok) setTransactions(await res.json());
    } finally {
      setLoading(false);
    }
  }, [month, source]);

  useEffect(() => { load(); }, [load]);

  async function deleteTransaction(id: string) {
    await fetch(`/api/transactions/${id}`, { method: "DELETE" });
    setTransactions((prev) => prev.filter((t) => t._id !== id));
  }

  const totalExpenses = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0);
  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{getMonthLabel(month)}</h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {/* Import + manual entry */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <PdfImport onImported={load} />
          </div>
          <ManualEntry onSaved={load} />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 text-sm">
        {(["all", "credit_card", "bank"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSource(s)}
            className={`px-3 py-1 rounded transition-colors ${
              source === s
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {s === "all" ? "Alle" : s === "credit_card" ? "Kreditkarte" : "Bank"}
          </button>
        ))}
      </div>

      {/* Totals */}
      {!loading && transactions.length > 0 && (
        <div className="flex gap-4 text-sm text-zinc-400">
          <span>
            <span className="text-emerald-400">{formatCurrency(totalIncome)}</span> Einnahmen
          </span>
          <span>
            <span className="text-rose-400">{formatCurrency(totalExpenses)}</span> Ausgaben
          </span>
        </div>
      )}

      {/* Transaction list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 rounded bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-zinc-500">
          Keine Transaktionen. PDF importieren oder manuell eintragen.
        </p>
      ) : (
        <div className="divide-y divide-zinc-800">
          {transactions.map((t) => (
            <div key={t._id} className="flex items-center gap-3 py-3 group">
              <div className="w-16 shrink-0 text-xs text-zinc-500">
                {format(new Date(t.date), "dd.MM.")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-200 truncate">{t.counterparty}</p>
                <p className="text-xs text-zinc-500">
                  {t.category}
                  <span className="ml-1.5 text-zinc-700">
                    {t.source === "credit_card" ? "KK" : "Bank"}
                  </span>
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-sm font-medium tabular-nums ${t.amount >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatCurrency(t.amount)}
                </span>
                <button
                  onClick={() => t._id && deleteTransaction(t._id)}
                  className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-opacity text-xs px-1"
                  aria-label="Loschen"
                >
                  x
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
