"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PinPage() {
  const [digits, setDigits] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(pin: string) {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        router.replace("/dashboard");
      } else {
        setError(true);
        setDigits([]);
      }
    } finally {
      setLoading(false);
    }
  }

  function press(d: string) {
    if (loading) return;
    setError(false);
    const next = [...digits, d];
    setDigits(next);
    if (next.length === 6) {
      submit(next.join(""));
    }
  }

  function del() {
    setError(false);
    setDigits((prev) => prev.slice(0, -1));
  }

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  return (
    <div
      className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-10"
      style={{ paddingBottom: "env(safe-area-inset-bottom)", paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold text-zinc-100">Finanza</h1>
        <p className="text-sm text-zinc-500">PIN eingeben</p>
      </div>

      {/* Dots */}
      <div className="flex gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-colors ${
              error
                ? "bg-rose-500"
                : i < digits.length
                ? "bg-zinc-100"
                : "bg-zinc-700"
            }`}
          />
        ))}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {keys.map((key, i) => {
          if (key === "") return <div key={i} />;
          if (key === "del") {
            return (
              <button
                key={i}
                onClick={del}
                disabled={digits.length === 0 || loading}
                className="h-16 rounded-2xl text-zinc-300 text-xl flex items-center justify-center disabled:opacity-30 active:bg-zinc-800 transition-colors"
              >
                ⌫
              </button>
            );
          }
          return (
            <button
              key={i}
              onClick={() => press(key)}
              disabled={loading}
              className="h-16 rounded-2xl bg-zinc-800 text-zinc-100 text-xl font-medium flex items-center justify-center hover:bg-zinc-700 active:bg-zinc-600 transition-colors disabled:opacity-50"
            >
              {key}
            </button>
          );
        })}
      </div>
    </div>
  );
}
