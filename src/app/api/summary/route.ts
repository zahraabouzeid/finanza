import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";
import { SubscriptionModel } from "@/models/Subscription";
import { BudgetModel } from "@/models/Budget";
import { calculateMonthlySummary } from "@/lib/utils/calculations";
import { getCurrentMonth } from "@/lib/utils/calculations";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? getCurrentMonth();

    const [transactions, subscriptions, budget] = await Promise.all([
      TransactionModel.find({ month }).lean(),
      SubscriptionModel.find({ active: true }).lean(),
      BudgetModel.findOne({ month }).lean(),
    ]);

    const summary = calculateMonthlySummary(
      transactions as never,
      subscriptions as never
    );

    return NextResponse.json({ summary, budget: budget ?? null, subscriptions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to calculate summary" }, { status: 500 });
  }
}
