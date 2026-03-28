"use client";

import { useEffect, useState } from "react";
import { formatCurrency, getMonthLabel } from "@/lib/utils/calculations";
import { Separator } from "@/components/ui/separator";

interface StatsData {
  byMonth: { month: string; total: number }[];
  byDayOfWeek: { day: string; total: number; avg: number }[];
  byCategory: { category: string; total: number }[];
  byDayOfMonth: { day: number; total: number }[];
  totalTransactions: number;
}

function Bar({ value, max, color = "bg-rose-500/50" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="h-1.5 rounded-full bg-zinc-800 mt-1">
      <div className={`h-1.5 rounded-full ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function StatsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-14 rounded bg-zinc-800/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data || data.totalTransactions === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-semibold mb-4">Stats</h1>
        <p className="text-sm text-zinc-500">Noch keine Daten. Transaktionen importieren um Statistiken zu sehen.</p>
      </div>
    );
  }

  const maxMonth = data.byMonth[0]?.total ?? 1;
  const maxDay = Math.max(...data.byDayOfWeek.map((d) => d.total));
  const maxCat = data.byCategory[0]?.total ?? 1;
  const maxDayOfMonth = data.byDayOfMonth[0]?.total ?? 1;

  // Order days Mon–Sun for display
  const DAY_ORDER = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const daysByOrder = DAY_ORDER.map((name) => {
    const d = data.byDayOfWeek.find((x) => x.day === name);
    return { day: name, total: d?.total ?? 0, avg: d?.avg ?? 0 };
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
      <h1 className="text-xl font-semibold">Stats</h1>

      {/* Top months */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Ausgaben nach Monat</h2>
        <div className="space-y-3">
          {data.byMonth.slice(0, 6).map(({ month, total }) => (
            <div key={month}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{getMonthLabel(month)}</span>
                <span className="text-sm tabular-nums text-rose-400">{formatCurrency(-total)}</span>
              </div>
              <Bar value={total} max={maxMonth} />
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* By category */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Ausgaben nach Kategorie</h2>
        <div className="space-y-3">
          {data.byCategory.map(({ category, total }) => (
            <div key={category}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-300">{category}</span>
                <span className="text-sm tabular-nums text-rose-400">{formatCurrency(-total)}</span>
              </div>
              <Bar value={total} max={maxCat} />
            </div>
          ))}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* By day of week */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Ausgaben nach Wochentag</h2>
        <div className="grid grid-cols-7 gap-1">
          {daysByOrder.map(({ day, total }) => {
            const pct = maxDay > 0 ? (total / maxDay) * 100 : 0;
            const isTop = total === maxDay && total > 0;
            return (
              <div key={day} className="flex flex-col items-center gap-1">
                <div className="w-full flex flex-col justify-end h-16 bg-zinc-900 rounded overflow-hidden">
                  <div
                    className={`w-full rounded transition-all ${isTop ? "bg-rose-500/70" : "bg-zinc-700/60"}`}
                    style={{ height: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-zinc-500">{day}</span>
              </div>
            );
          })}
        </div>
      </section>

      <Separator className="bg-zinc-800" />

      {/* Top days of month */}
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-zinc-300">Ausgaben-starkste Tage im Monat</h2>
        <div className="space-y-3">
          {data.byDayOfMonth.map(({ day, total }) => (
            <div key={day}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-400">{day}. des Monats</span>
                <span className="text-sm tabular-nums text-rose-400">{formatCurrency(-total)}</span>
              </div>
              <Bar value={total} max={maxDayOfMonth} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
