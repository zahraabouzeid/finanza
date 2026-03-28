"use client";

import { useEffect, useState } from "react";
import { Subscription } from "@/types";
import { formatCurrency } from "@/lib/utils/calculations";
import { SubscriptionForm } from "@/components/subscriptions/subscription-form";
import { BillingCalendar } from "@/components/subscriptions/billing-calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/subscriptions");
      if (res.ok) setSubscriptions(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleActive(id: string, active: boolean) {
    await fetch(`/api/subscriptions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    setSubscriptions((prev) =>
      prev.map((s) => (s._id === id ? { ...s, active } : s))
    );
  }

  async function deleteSubscription(id: string) {
    await fetch(`/api/subscriptions/${id}`, { method: "DELETE" });
    setSubscriptions((prev) => prev.filter((s) => s._id !== id));
  }

  const active = subscriptions.filter((s) => s.active);
  const inactive = subscriptions.filter((s) => !s.active);
  const total = active.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Abonnements</h1>
          {active.length > 0 && (
            <p className="text-sm text-rose-400 mt-0.5">{formatCurrency(total)} / Monat</p>
          )}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <button className="text-sm px-3 py-1.5 rounded bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors">
                Hinzufügen
              </button>
            }
          />
          <DialogContent className="bg-zinc-900 border-zinc-800">
            <DialogHeader>
              <DialogTitle>Neues Abonnement</DialogTitle>
            </DialogHeader>
            <SubscriptionForm
              onSaved={() => { setOpen(false); load(); }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <p className="text-sm text-zinc-500">Noch keine Abonnements. Fügen Sie Ihre Fixkosten hinzu.</p>
      ) : (
        <div className="space-y-6">
          {active.length > 0 && (
            <div className="divide-y divide-zinc-800">
              {active.map((s) => (
                <SubscriptionRow
                  key={s._id}
                  subscription={s}
                  onToggle={toggleActive}
                  onDelete={deleteSubscription}
                />
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 mb-2 uppercase tracking-wide">Pausiert</p>
              <div className="divide-y divide-zinc-800 opacity-50">
                {inactive.map((s) => (
                  <SubscriptionRow
                    key={s._id}
                    subscription={s}
                    onToggle={toggleActive}
                    onDelete={deleteSubscription}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator className="bg-zinc-800" />
          <BillingCalendar subscriptions={subscriptions} />
        </div>
      )}
    </div>
  );
}

function SubscriptionRow({
  subscription: s,
  onToggle,
  onDelete,
}: {
  subscription: Subscription;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 py-3 group">
      <button
        onClick={() => s._id && onToggle(s._id, !s.active)}
        className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 transition-colors ${
          s.active ? "bg-emerald-500 border-emerald-500" : "border-zinc-600"
        }`}
        aria-label={s.active ? "Pausieren" : "Aktivieren"}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200">{s.name}</p>
        <p className="text-xs text-zinc-500">
          {s.category} · {s.paymentMethod === "credit_card" ? "Kreditkarte" : s.paymentMethod === "lastschrift" ? "Lastschrift" : "Debit"}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-sm font-medium tabular-nums text-rose-400">
          {formatCurrency(s.amount)}
        </span>
        <button
          onClick={() => s._id && onDelete(s._id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-zinc-300 transition-opacity text-xs px-1"
          aria-label="Löschen"
        >
          x
        </button>
      </div>
    </div>
  );
}
