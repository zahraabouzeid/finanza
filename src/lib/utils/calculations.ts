import { Transaction, MonthlySummary, Subscription } from "@/types";

/**
 * Income = only positive bank transactions (salary, etc.)
 * Expenses = all KK transactions (negative) + negative bank transactions
 */
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
    const isIncome = t.source === "bank" && t.amount > 0;
    if (isIncome) {
      totalIncome += t.amount;
    } else if (t.amount < 0) {
      totalExpenses += t.amount;
    }

    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;

    if (t.source === "credit_card") creditCardTotal += t.amount;
    else bankTotal += t.amount;
  }

  // Active subscriptions that are not already in transactions (Lastschrift/Debit from bank)
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

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(parseInt(year), parseInt(m) - 1, 1);
  return date.toLocaleDateString("de-DE", { month: "long", year: "numeric" });
}
