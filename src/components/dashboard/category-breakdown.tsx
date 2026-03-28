"use client";

import { formatCurrency } from "@/lib/utils/calculations";

interface Props {
  byCategory: Record<string, number>;
}

export function CategoryBreakdown({ byCategory }: Props) {
  const expenses = Object.entries(byCategory)
    .filter(([, v]) => v < 0)
    .sort((a, b) => a[1] - b[1]);

  const income = Object.entries(byCategory)
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1]);

  const total = expenses.reduce((sum, [, v]) => sum + Math.abs(v), 0);

  if (expenses.length === 0 && income.length === 0) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-zinc-300">Nach Kategorie</h2>

      {expenses.length > 0 && (
        <div className="space-y-2">
          {expenses.map(([cat, amount]) => {
            const pct = total > 0 ? (Math.abs(amount) / total) * 100 : 0;
            return (
              <div key={cat}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-zinc-300">{cat}</span>
                  <span className="text-sm text-rose-400">{formatCurrency(amount)}</span>
                </div>
                <div className="h-1 rounded-full bg-zinc-800">
                  <div
                    className="h-1 rounded-full bg-rose-500/60"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {income.length > 0 && (
        <div className="space-y-1 pt-2">
          {income.map(([cat, amount]) => (
            <div key={cat} className="flex items-center justify-between">
              <span className="text-sm text-zinc-400">{cat}</span>
              <span className="text-sm text-emerald-400">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
