import Papa from "papaparse";
import { format, parse } from "date-fns";
import { Transaction, RawTransaction } from "@/types";

/**
 * Parses a bank/KK CSV export (e.g. Wise, N26 format)
 * Expected columns: Date, Counterparty, Description, Category, Amount
 */
export function parseTransactionCSV(
  csvContent: string,
  source: "credit_card" | "bank"
): Omit<Transaction, "_id" | "createdAt" | "updatedAt">[] {
  const result = Papa.parse<RawTransaction>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim().toLowerCase(),
  });

  return result.data
    .filter((row) => row.date && row.amount)
    .map((row) => {
      const amount = parseFloat(
        row.amount.replace(/[^0-9.,-]/g, "").replace(",", ".")
      );
      const date = parseDate(row.date);
      const month = format(date, "yyyy-MM");

      return {
        date,
        counterparty: row.counterparty?.trim() ?? "",
        description: row.description?.trim(),
        category: normalizeCategory(row.category?.trim() ?? ""),
        amount,
        source,
        month,
      };
    });
}

function parseDate(dateStr: string): Date {
  const formats = [
    "dd.MM.yy",
    "dd.MM.yyyy",
    "yyyy-MM-dd",
    "MM/dd/yyyy",
    "dd/MM/yyyy",
  ];

  for (const fmt of formats) {
    try {
      const d = parse(dateStr.trim(), fmt, new Date());
      if (!isNaN(d.getTime())) return d;
    } catch {
      // try next format
    }
  }

  return new Date(dateStr);
}

const CATEGORY_MAP: Record<string, string> = {
  dining: "Restaurants",
  restaurant: "Restaurants",
  grocery: "Lebensmittel",
  groceries: "Lebensmittel",
  shopping: "Shopping",
  entertainment: "Entertainment",
  transport: "Transport",
  gas: "Transport",
  payment: "Sonstiges",
  directdebit: "Lastschrift",
  subscription: "Abonnements",
};

function normalizeCategory(raw: string): string {
  const key = raw.toLowerCase().replace(/\s+/g, "");
  return CATEGORY_MAP[key] ?? raw || "Sonstiges";
}
