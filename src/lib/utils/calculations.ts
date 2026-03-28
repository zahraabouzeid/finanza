import { Transaction, MonthlySummary, Subscription } from "@/types";

export function calculateMonthlySummary(
  transactions: Transaction[],
  subscriptions: Subscription[]
): MonthlySummary {
  const month = transactions[0]?.month ?? "";
  const byCategory: Record<string, number> = {};

  let totalIncome = 0;
  let totalExpenses = 0;
  let creditCardTotal = 0;
  let bankTotal = 0;

  for (const t of transactions) {
    if (t.amount > 0) {
      totalIncome += t.amount;
    } else {
      totalExpenses += t.amount;
    }

    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;

    if (t.source === "credit_card") creditCardTotal += t.amount;
    else bankTotal += t.amount;
  }

  // Add active subscriptions
  for (const s of subscriptions) {
    if (!s.active) continue;
    totalExpenses += s.amount;
    byCategory[s.category] = (byCategory[s.category] ?? 0) + s.amount;
    if (s.paymentMethod === "credit_card") creditCardTotal += s.amount;
    else bankTotal += s.amount;
  }

  return {
    month,
    totalIncome,
    totalExpenses,
    balance: totalIncome + totalExpenses,
    byCategory,
    creditCardTotal,
    bankTotal,
  };
}

/**
 * Calculates how much to keep on Giro and how much to transfer to Tagesgeld.
 * Logic:
 * - Keep on Giro: |creditCardTotal| + buffer (default 100€) + upcoming fixed costs
 * - Transfer to Tagesgeld: balance - giroKeep
 */
export function calculateTransfer(
  summary: MonthlySummary,
  buffer: number = 100
): { keepOnGiro: number; transferToTagesgeld: number } {
  const creditCardDebt = Math.abs(summary.creditCardTotal);
  const keepOnGiro = creditCardDebt + buffer;
  const transferToTagesgeld = Math.max(0, summary.balance - keepOnGiro);

  return {
    keepOnGiro: Math.round(keepOnGiro * 100) / 100,
    transferToTagesgeld: Math.round(transferToTagesgeld * 100) / 100,
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7); // "YYYY-MM"
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}
