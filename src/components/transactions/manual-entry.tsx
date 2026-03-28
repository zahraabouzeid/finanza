"use client";

import { useEffect, useState } from "react";
import { Subscription } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils/calculations";

const CATEGORIES = [
  "Gehalt",
  "Restaurants",
  "Lebensmittel",
  "Shopping",
  "Transport",
  "Abonnements",
  "Lastschrift",
  "Sonstiges",
];

interface Props {
  onSaved: () => void;
}

export function ManualEntry({ onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [counterparty, setCounterparty] = useState("");
  const [category, setCategory] = useState("Sonstiges");
  const [amount, setAmount] = useState("");
  const [sign, setSign] = useState<"+" | "-">("-");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      fetch("/api/subscriptions")
        .then((r) => r.json())
        .then((data) => setSubscriptions(data.filter((s: Subscription) => s.active)));
    }
  }, [open]);

  function fillFromSubscription(s: Subscription) {
    setCounterparty(s.name);
    setCategory(s.category);
    setAmount(String(Math.abs(s.amount)).replace(".", ","));
    setSign("-"); // subscriptions are always expenses
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const abs = parseFloat(amount.replace(",", "."));
    if (!counterparty.trim() || isNaN(abs) || abs <= 0) {
      setError("Gegenseite und Betrag sind Pflichtfelder.");
      return;
    }

    const parsed = sign === "-" ? -abs : abs;
    const dateObj = new Date(date);
    const month = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, "0")}`;

    setSaving(true);
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: dateObj.toISOString(),
          counterparty: counterparty.trim(),
          category,
          amount: parsed,
          source: "bank",
          month,
        }),
      });

      if (res.ok) {
        setCounterparty("");
        setAmount("");
        setCategory("Sonstiges");
        setSign("-");
        setOpen(false);
        onSaved();
      } else {
        const data = await res.json();
        setError(data.error ?? "Fehler beim Speichern");
      }
    } finally {
      setSaving(false);
    }
  }

  const selectClass =
    "w-full h-8 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <button
            className="w-7 h-7 flex items-center justify-center rounded border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-colors text-lg leading-none"
            title="Manuell eintragen"
          >
            +
          </button>
        }
      />
      <DialogContent className="bg-zinc-900 border-zinc-800">
        <DialogHeader>
          <DialogTitle>Bank-Eintrag</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {subscriptions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500">Aus Abonnements:</p>
              <div className="flex flex-wrap gap-1.5">
                {subscriptions.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => fillFromSubscription(s)}
                    className="text-xs px-2 py-1 rounded bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    {s.name} ({formatCurrency(s.amount)})
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="me-date">Datum</Label>
                <Input
                  id="me-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="me-amount">Betrag</Label>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setSign((s) => (s === "-" ? "+" : "-"))}
                    className={`w-8 shrink-0 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors ${
                      sign === "-"
                        ? "border-rose-800 text-rose-400 bg-rose-950/40"
                        : "border-emerald-800 text-emerald-400 bg-emerald-950/40"
                    }`}
                  >
                    {sign}
                  </button>
                  <Input
                    id="me-amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="50,00"
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="me-counterparty">Gegenseite</Label>
              <Input
                id="me-counterparty"
                value={counterparty}
                onChange={(e) => setCounterparty(e.target.value)}
                placeholder="z.B. Arbeitgeber GmbH"
                className="bg-zinc-800 border-zinc-700"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="me-category">Kategorie</Label>
              <select
                id="me-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={selectClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {error && <p className="text-xs text-rose-400">{error}</p>}

            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border border-zinc-700"
            >
              {saving ? "Speichern..." : "Speichern"}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
