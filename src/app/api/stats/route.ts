import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";

export const maxDuration = 30;

export async function GET() {
  try {
    await connectDB();

    const transactions = await TransactionModel.find({ amount: { $lt: 0 } })
      .lean()
      .select("date amount category month source");

    // --- By month ---
    const byMonth: Record<string, number> = {};
    for (const t of transactions) {
      byMonth[t.month] = (byMonth[t.month] ?? 0) + Math.abs(t.amount);
    }
    const monthsSorted = Object.entries(byMonth)
      .map(([month, total]) => ({ month, total }))
      .sort((a, b) => b.total - a.total);

    // --- By day of week ---
    const DAY_NAMES = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
    const byDayOfWeek: Record<number, { total: number; count: number }> = {};
    for (const t of transactions) {
      const day = new Date(t.date).getDay();
      if (!byDayOfWeek[day]) byDayOfWeek[day] = { total: 0, count: 0 };
      byDayOfWeek[day].total += Math.abs(t.amount);
      byDayOfWeek[day].count += 1;
    }
    const daysSorted = Object.entries(byDayOfWeek)
      .map(([day, { total, count }]) => ({
        day: DAY_NAMES[parseInt(day)],
        total,
        avg: total / count,
      }))
      .sort((a, b) => b.total - a.total);

    // --- By category ---
    const byCategory: Record<string, number> = {};
    for (const t of transactions) {
      byCategory[t.category] = (byCategory[t.category] ?? 0) + Math.abs(t.amount);
    }
    const categoriesSorted = Object.entries(byCategory)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);

    // --- By day of month (1-31) ---
    const byDayOfMonth: Record<number, number> = {};
    for (const t of transactions) {
      const d = new Date(t.date).getDate();
      byDayOfMonth[d] = (byDayOfMonth[d] ?? 0) + Math.abs(t.amount);
    }
    const daysOfMonthSorted = Object.entries(byDayOfMonth)
      .map(([day, total]) => ({ day: parseInt(day), total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    return NextResponse.json({
      byMonth: monthsSorted,
      byDayOfWeek: daysSorted,
      byCategory: categoriesSorted,
      byDayOfMonth: daysOfMonthSorted,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to load stats" }, { status: 500 });
  }
}
