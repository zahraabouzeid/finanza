"use client";

import { Subscription } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";

interface Props {
  subscriptions: Subscription[];
}

export function BillingCalendar({ subscriptions }: Props) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = today.getDate();

  const active = subscriptions.filter((s) => s.active && s.billingDay);

  // Group by billing day
  const byDay: Record<number, Subscription[]> = {};
  for (const s of active) {
    const day = s.billingDay!;
    if (!byDay[day]) byDay[day] = [];
    byDay[day].push(s);
  }

  const upcoming = active
    .filter((s) => s.billingDay! > todayDate)
    .sort((a, b) => a.billingDay! - b.billingDay!);

  const upcomingTotal = upcoming.reduce((sum, s) => sum + s.amount, 0);

  // Build calendar grid (start on Monday)
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const dayNames = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-medium text-zinc-300">Abbuchungskalender</h2>

      {/* Calendar grid */}
      <div>
        <div className="grid grid-cols-7 mb-1">
          {dayNames.map((d) => (
            <div key={d} className="text-center text-xs text-zinc-600 py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-zinc-800 rounded-lg overflow-hidden">
          {cells.map((day, i) => {
            const subs = day ? (byDay[day] ?? []) : [];
            const isToday = day === todayDate;
            const isPast = day !== null && day < todayDate;

            return (
              <div
                key={i}
                className={`bg-zinc-950 min-h-[44px] p-1 ${!day ? "opacity-0 pointer-events-none" : ""}`}
              >
                {day && (
                  <>
                    <span className={`text-xs block mb-0.5 ${
                      isToday ? "text-zinc-100 font-semibold" : isPast ? "text-zinc-600" : "text-zinc-400"
                    }`}>
                      {day}
                    </span>
                    {subs.map((s) => (
                      <div
                        key={s._id}
                        className={`text-[10px] leading-tight truncate px-0.5 rounded ${
                          isPast ? "text-zinc-600" : "text-rose-400"
                        }`}
                        title={`${s.name}: ${formatCurrency(s.amount)}`}
                      >
                        {s.name.split(" ")[0]}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs text-zinc-500">Noch diesen Monat</p>
            <span className="text-xs text-rose-400">{formatCurrency(upcomingTotal)}</span>
          </div>
          <div className="divide-y divide-zinc-800">
            {upcoming.map((s) => (
              <div key={s._id} className="flex items-center justify-between py-2">
                <div>
                  <p className="text-sm text-zinc-200">{s.name}</p>
                  <p className="text-xs text-zinc-500">am {s.billingDay}.</p>
                </div>
                <span className="text-sm tabular-nums text-rose-400">{formatCurrency(s.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
