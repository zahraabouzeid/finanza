import { format, parse } from "date-fns";
import { Transaction } from "@/types";

const CATEGORY_MAP: Record<string, string> = {
  shopping: "Shopping",
  dining: "Restaurants",
  restaurant: "Restaurants",
  grocery: "Lebensmittel",
  groceries: "Lebensmittel",
  gas: "Transport",
  transport: "Transport",
  entertainment: "Entertainment",
  subscription: "Abonnements",
  payment: "Sonstiges",
  directdebit: "Lastschrift",
};

// All known categories as a regex alternation, longest first
const CATEGORY_PATTERN = Object.keys(CATEGORY_MAP)
  .sort((a, b) => b.length - a.length)
  .join("|");

/**
 * Main parser. Handles two layouts that pdf-parse may produce:
 *
 * Layout A (single line):
 *   "27.03.26 SCHUM EUROSHOP GMBH shopping € -1,30"
 *
 * Layout B (multi-line / column-split):
 *   "27.03.26\nSCHUM EUROSHOP GMBH\nshopping\n€ -1,30"
 *
 * Strategy: find every (date … category … € amount) group
 * regardless of newlines between them.
 */
export function parseAdvanziaText(
  text: string
): Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] {
  // Normalise: collapse runs of whitespace/newlines to a single space
  const flat = text.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");

  const pattern = new RegExp(
    `(\\d{2}\\.\\d{2}\\.\\d{2,4})\\s+` + // date
    `(.+?)\\s+` +                          // counterparty (non-greedy)
    `(${CATEGORY_PATTERN})\\s+` +          // category keyword
    `€\\s*([\\-+]?\\d[\\d.,]+)`,           // € amount
    "gi"
  );

  const transactions: Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] = [];

  for (const match of flat.matchAll(pattern)) {
    const [, rawDate, counterparty, rawCategory, rawAmount] = match;

    const date = parseAdvanziaDate(rawDate);
    if (!date) continue;

    transactions.push({
      date,
      counterparty: counterparty.trim(),
      category: CATEGORY_MAP[rawCategory.toLowerCase()] ?? rawCategory,
      amount: parseAmount(rawAmount),
      source: "credit_card",
      month: format(date, "yyyy-MM"),
    });
  }

  return transactions;
}

// Keep for backwards compatibility — main function already handles both layouts
export function parseAdvanziaTextFallback(
  text: string
): Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] {
  return parseAdvanziaText(text);
}

function parseAdvanziaDate(raw: string): Date | null {
  const fmt = raw.length === 8 ? "dd.MM.yy" : "dd.MM.yyyy";
  try {
    const d = parse(raw, fmt, new Date());
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function parseAmount(raw: string): number {
  return parseFloat(raw.replace(/\./g, "").replace(",", "."));
}
