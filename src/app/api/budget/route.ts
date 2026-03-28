import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { BudgetModel } from "@/models/Budget";
import { getCurrentMonth } from "@/lib/utils/calculations";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month") ?? getCurrentMonth();
    const budget = await BudgetModel.findOne({ month }).lean();
    return NextResponse.json(budget ?? null);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch budget" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const budget = await BudgetModel.findOneAndUpdate(
      { month: body.month },
      body,
      { upsert: true, new: true }
    );
    return NextResponse.json(budget);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to save budget" }, { status: 500 });
  }
}
