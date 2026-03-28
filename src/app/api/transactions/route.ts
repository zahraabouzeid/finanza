import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");
    const source = searchParams.get("source");

    const filter: Record<string, string> = {};
    if (month) filter.month = month;
    if (source) filter.source = source;

    const transactions = await TransactionModel.find(filter)
      .sort({ date: -1 })
      .lean();

    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Support single or batch insert
    const data = Array.isArray(body) ? body : [body];
    const inserted = await TransactionModel.insertMany(data, { ordered: false });

    return NextResponse.json(inserted, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create transactions" }, { status: 500 });
  }
}
