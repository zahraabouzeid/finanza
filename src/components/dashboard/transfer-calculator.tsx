"use client";

import { useState } from "react";
import { MonthlySummary } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";

interface Props {
  summary: MonthlySummary;
  transfer: { keepOnGiro: number; transferToTagesgeld: number };
  month: string;
}

export function TransferCalculator({ summary, transfer, month }: Props) {
  const [buffer, setBuffer] = useState(100);

  const kkDebt = Math.abs(summary.creditCardTotal);
  const keepOnGiro = kkDebt + buffer;
  const toTagesgeld = Math.max(0, summary.balance - keepOnGiro);

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-medium text-zinc-300">Monatsabschluss</h2>

      <div className="space-y-2 text-sm">
        <Row label="KK-Abrechnung (bis 12.)" value={formatCurrency(-kkDebt)} negative />
        <Row label="Puffer auf Giro" value={formatCurrency(buffer)} />
        <div className="flex items-center justify-between py-1">
          <span className="text-zinc-400">Puffer anpassen</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBuffer((b) => Math.max(0, b - 50))}
              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-xs"
            >
              -
            </button>
            <span className="w-16 text-center text-zinc-200">{formatCurrency(buffer)}</span>
            <button
              onClick={() => setBuffer((b) => b + 50)}
              className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors text-xs"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-zinc-800 rounded-lg overflow-hidden">
        <div className="bg-zinc-950 px-4 py-4">
          <p className="text-xs text-zinc-500 mb-1">Bleibt auf Giro</p>
          <p className="text-base font-medium text-zinc-100">{formatCurrency(keepOnGiro)}</p>
        </div>
        <div className="bg-zinc-950 px-4 py-4">
          <p className="text-xs text-zinc-500 mb-1">Transfer zu Tagesgeld</p>
          <p className={`text-base font-medium ${toTagesgeld > 0 ? "text-emerald-400" : "text-zinc-400"}`}>
            {formatCurrency(toTagesgeld)}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1 border-b border-zinc-800/50">
      <span className="text-zinc-400">{label}</span>
      <span className={negative ? "text-rose-400" : "text-zinc-200"}>{value}</span>
    </div>
  );
}
