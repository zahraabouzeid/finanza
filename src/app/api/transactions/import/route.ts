import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";
import { parseTransactionCSV } from "@/lib/utils/csv-parser";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const source = (formData.get("source") as string) ?? "credit_card";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvContent = await file.text();
    const transactions = parseTransactionCSV(
      csvContent,
      source as "credit_card" | "bank"
    );

    if (transactions.length === 0) {
      return NextResponse.json({ error: "No valid transactions found in CSV" }, { status: 400 });
    }

    // Insert and skip duplicates (same date + counterparty + amount)
    const inserted = await TransactionModel.insertMany(transactions, {
      ordered: false,
    }).catch((e) => {
      // Partial success on duplicate key errors is fine
      if (e.code === 11000) return e.insertedDocs ?? [];
      throw e;
    });

    return NextResponse.json({
      imported: transactions.length,
      message: `${transactions.length} Transaktionen importiert`,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import fehlgeschlagen" }, { status: 500 });
  }
}
