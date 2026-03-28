"use client";

import { getMonthLabel } from "@/lib/utils/calculations";

interface Props {
  value: string; // "YYYY-MM"
  onChange: (month: string) => void;
}

export function MonthPicker({ value, onChange }: Props) {
  const [year, month] = value.split("-").map(Number);

  function prev() {
    const d = new Date(year, month - 2, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  function next() {
    const d = new Date(year, month, 1);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }

  const isCurrentMonth = value === new Date().toISOString().slice(0, 7);

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={prev}
        className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm"
      >
        ‹
      </button>
      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="w-7 h-7 flex items-center justify-center rounded text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors text-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        ›
      </button>
    </div>
  );
}
