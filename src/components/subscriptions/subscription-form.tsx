"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface Props {
  onSaved: () => void;
}

const CATEGORIES = [
  "Abonnements",
  "Transport",
  "Fitness",
  "Versicherung",
  "Miete",
  "Strom / Gas",
  "Internet",
  "Sonstiges",
];

export function SubscriptionForm({ onSaved }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("debit");
  const [category, setCategory] = useState("Abonnements");
  const [billingDay, setBillingDay] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const parsed = parseFloat(amount.replace(",", "."));
    if (!name.trim() || isNaN(parsed)) {
      setError("Name und Betrag sind Pflichtfelder.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          amount: parsed > 0 ? -parsed : parsed,
          paymentMethod,
          category,
          billingDay: billingDay ? parseInt(billingDay) : undefined,
          active: true,
        }),
      });

      if (res.ok) {
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
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="z.B. Netflix"
          className="bg-zinc-800 border-zinc-700"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="amount">Betrag (EUR)</Label>
          <Input
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="4,99"
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="billingDay">Abbuchung (Tag)</Label>
          <Input
            id="billingDay"
            value={billingDay}
            onChange={(e) => setBillingDay(e.target.value)}
            placeholder="1-31"
            className="bg-zinc-800 border-zinc-700"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="paymentMethod">Zahlungsart</Label>
        <select
          id="paymentMethod"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className={selectClass}
        >
          <option value="debit">Debit</option>
          <option value="lastschrift">Lastschrift</option>
          <option value="credit_card">Kreditkarte</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="category">Kategorie</Label>
        <select
          id="category"
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
        className="w-full bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
      >
        {saving ? "Speichern..." : "Speichern"}
      </Button>
    </form>
  );
}
