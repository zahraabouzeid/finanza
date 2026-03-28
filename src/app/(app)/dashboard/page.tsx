"use client";

import { useEffect, useState, useCallback } from "react";
import { MonthlySummary } from "@/types";
import { formatCurrency, getMonthLabel } from "@/lib/utils/calculations";
import { Separator } from "@/components/ui/separator";
import { TransferCalculator } from "@/components/dashboard/transfer-calculator";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { MonthPicker } from "@/components/dashboard/month-picker";

interface SummaryResponse {
  summary: MonthlySummary;
  transfer: { keepOnGiro: number; transferToTagesgeld: number };
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

export default function DashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summary?month=${month}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const summary = data?.summary;
  const transfer = data?.transfer;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">
          {loading ? "\u00a0" : getMonthLabel(month)}
        </h1>
        <MonthPicker value={month} onChange={setMonth} />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded bg-zinc-800/50 animate-pulse" />
          ))}
        </div>
      ) : summary ? (
        <>
          {/* Income / Expenses / Balance */}
          <div className="grid grid-cols-3 gap-px bg-zinc-800 rounded-lg overflow-hidden">
            <div className="bg-zinc-950 px-4 py-4">
              <p className="text-xs text-zinc-500 mb-1">Einnahmen</p>
              <p className="text-base font-medium text-emerald-400">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="bg-zinc-950 px-4 py-4">
              <p className="text-xs text-zinc-500 mb-1">Ausgaben</p>
              <p className="text-base font-medium text-rose-400">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="bg-zinc-950 px-4 py-4">
              <p className="text-xs text-zinc-500 mb-1">Saldo</p>
              <p className={`text-base font-medium ${summary.balance >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>

          <Separator className="bg-zinc-800" />

          {/* Transfer calculator */}
          {transfer && (
            <TransferCalculator
              summary={summary}
              transfer={transfer}
              month={month}
            />
          )}

          <Separator className="bg-zinc-800" />

          {/* Category breakdown */}
          <CategoryBreakdown byCategory={summary.byCategory} />
        </>
      ) : (
        <p className="text-sm text-zinc-500">
          Keine Daten fur diesen Monat. Transaktionen importieren, um zu beginnen.
        </p>
      )}
    </div>
  );
}
