"use client";

import { useEffect, useState, useCallback } from "react";
import { Budget, MonthlySummary, Subscription } from "@/types";
import { formatCurrency, getMonthLabel } from "@/lib/utils/calculations";
import { Separator } from "@/components/ui/separator";
import { BudgetPanel } from "@/components/dashboard/budget-panel";
import { CategoryBreakdown } from "@/components/dashboard/category-breakdown";
import { MonthPicker } from "@/components/dashboard/month-picker";
import Link from "next/link";

interface SummaryResponse {
  summary: MonthlySummary;
  budget: Budget | null;
  subscriptions: Subscription[];
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

          <BudgetPanel
            month={month}
            summary={summary}
            budget={data?.budget ?? null}
            onSaved={(saved) => setData((d) => d ? { ...d, budget: saved } : d)}
          />

          <Separator className="bg-zinc-800" />

          <CategoryBreakdown byCategory={summary.byCategory} />

          {data?.subscriptions && data.subscriptions.filter((s) => s.active).length > 0 && (
            <>
              <Separator className="bg-zinc-800" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-zinc-300">Abonnements</p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {data.subscriptions.filter((s) => s.active).length} aktiv
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-rose-400">
                    {formatCurrency(
                      data.subscriptions
                        .filter((s) => s.active)
                        .reduce((sum, s) => sum + s.amount, 0)
                    )}
                  </p>
                  <Link href="/subscriptions" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
                    Kalender ansehen
                  </Link>
                </div>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="text-sm text-zinc-500">
          Keine Daten fuer diesen Monat. Transaktionen importieren oder eintragen.
        </p>
      )}
    </div>
  );
}
