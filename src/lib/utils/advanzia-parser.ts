import { format, parse } from "date-fns";
import { Transaction } from "@/types";

/**
 * Parses an Advanzia credit card PDF export.
 *
 * Expected PDF text structure (per transaction row):
 *   DD.MM.YY   COUNTERPARTY   category   € -XX,XX
 *
 * Example:
 *   27.03.26   SCHUM EUROSHOP GMBH   shopping   € -1,30
 */
export function parseAdvanziaText(
  text: string
): Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  const transactions: Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] = [];

  // Match lines that start with a date DD.MM.YY or DD.MM.YYYY
  const datePattern = /^(\d{2}\.\d{2}\.\d{2,4})\s+(.+?)\s+([\w\s]+?)\s+€\s*([-+]?\d[\d.,]+)\s*$/;

  for (const line of lines) {
    const match = line.match(datePattern);
    if (!match) continue;

    const [, rawDate, counterparty, rawCategory, rawAmount] = match;

    const date = parseAdvanziaDate(rawDate);
    if (!date) continue;

    const amount = parseAmount(rawAmount);
    const category = normalizeCategory(rawCategory.trim());
    const month = format(date, "yyyy-MM");

    transactions.push({
      date,
      counterparty: counterparty.trim(),
      category,
      amount,
      source: "credit_card",
      month,
    });
  }

  return transactions;
}

/**
 * Sometimes pdf-parse collapses columns differently depending on the PDF layout.
 * This fallback tries a more lenient multi-column parse.
 */
export function parseAdvanziaTextFallback(
  text: string
): Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] {
  const transactions: Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] = [];

  // Split by date tokens — each transaction starts with DD.MM.YY
  const dateSplit = text.split(/(?=\b\d{2}\.\d{2}\.\d{2,4}\b)/);

  for (const chunk of dateSplit) {
    const trimmed = chunk.trim();
    if (!trimmed) continue;

    // Extract date at start
    const dateMatch = trimmed.match(/^(\d{2}\.\d{2}\.\d{2,4})/);
    if (!dateMatch) continue;

    const date = parseAdvanziaDate(dateMatch[1]);
    if (!date) continue;

    // Extract amount (last € XX,XX or -XX,XX in chunk)
    const amountMatch = trimmed.match(/€\s*([-+]?\d[\d.,]+)\s*$/);
    if (!amountMatch) continue;

    const amount = parseAmount(amountMatch[1]);

    // Extract category — the word(s) just before the amount
    const beforeAmount = trimmed.slice(0, trimmed.lastIndexOf("€")).trim();
    const parts = beforeAmount.split(/\s{2,}/); // split on multiple spaces

    const counterparty = parts[1]?.trim() ?? "Unbekannt";
    const rawCategory = parts[2]?.trim() ?? parts[parts.length - 1]?.trim() ?? "Sonstiges";

    const month = format(date, "yyyy-MM");

    transactions.push({
      date,
      counterparty,
      category: normalizeCategory(rawCategory),
      amount,
      source: "credit_card",
      month,
    });
  }

  return transactions;
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
  // "1.234,56" → 1234.56  or  "-1,30" → -1.30
  const normalized = raw
    .replace(/\./g, "")   // remove thousand separators
    .replace(",", ".");   // decimal comma → dot
  return parseFloat(normalized);
}

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

function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, "");
  return CATEGORY_MAP[key] ?? capitalize(raw) ?? "Sonstiges";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}
