"use client";

import { useState } from "react";
import { Budget, MonthlySummary } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  month: string;
  summary: MonthlySummary;
  budget: Budget | null;
  onSaved: (budget: Budget) => void;
}

export function BudgetPanel({ month, summary, budget, onSaved }: Props) {
  const [editing, setEditing] = useState(false);
  const [incomeTarget, setIncomeTarget] = useState(
    String(budget?.incomeTarget ?? "").replace(".", ",")
  );
  const [expenseTarget, setExpenseTarget] = useState(
    String(budget?.expenseTarget ?? "").replace(".", ",")
  );
  const [saving, setSaving] = useState(false);

  const plannedIncome = budget?.incomeTarget ?? 0;
  const plannedExpenses = budget?.expenseTarget ?? 0;
  const actualIncome = summary.totalIncome;
  const actualExpenses = Math.abs(summary.totalExpenses);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          month,
          incomeTarget: parseFloat(incomeTarget.replace(",", ".")) || 0,
          expenseTarget: parseFloat(expenseTarget.replace(",", ".")) || 0,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        onSaved(saved);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Budget festlegen</h2>
          <button onClick={() => setEditing(false)} className="text-xs text-zinc-500 hover:text-zinc-300">
            Abbrechen
          </button>
        </div>
        <form onSubmit={save} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Geplante Einnahmen</label>
              <Input
                value={incomeTarget}
                onChange={(e) => setIncomeTarget(e.target.value)}
                placeholder="866,72"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-400">Geplante Ausgaben (max)</label>
              <Input
                value={expenseTarget}
                onChange={(e) => setExpenseTarget(e.target.value)}
                placeholder="400,00"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
          <Button type="submit" disabled={saving} className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700">
            {saving ? "Speichern..." : "Speichern"}
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-zinc-300">Budget</h2>
        <button
          onClick={() => {
            setIncomeTarget(String(budget?.incomeTarget ?? "").replace(".", ","));
            setExpenseTarget(String(budget?.expenseTarget ?? "").replace(".", ","));
            setEditing(true);
          }}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          {budget ? "Anpassen" : "Budget anlegen"}
        </button>
      </div>

      {budget ? (
        <div className="space-y-3">
          <BudgetRow
            label="Einnahmen"
            actual={actualIncome}
            planned={plannedIncome}
            positive
          />
          <BudgetRow
            label="Ausgaben"
            actual={actualExpenses}
            planned={plannedExpenses}
          />
          {plannedIncome > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800">
              <span className="text-xs text-zinc-500">Geplante Ersparnis</span>
              <span className="text-sm font-medium text-zinc-200">
                {formatCurrency(plannedIncome - plannedExpenses)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-zinc-600">Noch kein Budget fuer diesen Monat.</p>
      )}
    </div>
  );
}

function BudgetRow({
  label,
  actual,
  planned,
  positive,
}: {
  label: string;
  actual: number;
  planned: number;
  positive?: boolean;
}) {
  const pct = planned > 0 ? Math.min((actual / planned) * 100, 100) : 0;
  const over = planned > 0 && actual > planned;
  const color = positive
    ? actual >= planned ? "bg-emerald-500/60" : "bg-zinc-600"
    : over ? "bg-rose-500/70" : "bg-emerald-500/60";

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-zinc-300">{label}</span>
        <span className="text-xs text-zinc-400 tabular-nums">
          <span className={positive ? "text-emerald-400" : over ? "text-rose-400" : "text-zinc-200"}>
            {formatCurrency(actual)}
          </span>
          {planned > 0 && (
            <span className="text-zinc-600"> / {formatCurrency(planned)}</span>
          )}
        </span>
      </div>
      {planned > 0 && (
        <div className="h-1 rounded-full bg-zinc-800">
          <div className={`h-1 rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  );
}
