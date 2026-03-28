import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";
import { SubscriptionModel } from "@/models/Subscription";
import { calculateMonthlySummary, calculateTransfer } from "@/lib/utils/calculations";
import { getCurrentMonth } from "@/lib/utils/calculations";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? getCurrentMonth();
    const buffer = parseFloat(searchParams.get("buffer") ?? "100");

    const [transactions, subscriptions] = await Promise.all([
      TransactionModel.find({ month }).lean(),
      SubscriptionModel.find({ active: true }).lean(),
    ]);

    const summary = calculateMonthlySummary(
      transactions as never,
      subscriptions as never
    );
    const transfer = calculateTransfer(summary, buffer);

    return NextResponse.json({ summary, transfer });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to calculate summary" }, { status: 500 });
  }
}
