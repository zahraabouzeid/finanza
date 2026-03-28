import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";
import { parseTransactionCSV } from "@/lib/utils/csv-parser";
import { parseAdvanziaText, parseAdvanziaTextFallback } from "@/lib/utils/advanzia-parser";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const source = (formData.get("source") as string) ?? "credit_card";

    if (!file) {
      return NextResponse.json({ error: "Keine Datei angegeben" }, { status: 400 });
    }

    const isPDF = file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf";
    const isCSV = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";

    let transactions;

    if (isPDF) {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse(uint8);
      const result = await parser.getText();
      const text = result.text;

      transactions = parseAdvanziaText(text);
      if (transactions.length === 0) {
        transactions = parseAdvanziaTextFallback(text);
      }
    } else if (isCSV) {
      const content = await file.text();
      transactions = parseTransactionCSV(content, source as "credit_card" | "bank");
    } else {
      return NextResponse.json(
        { error: "Nur PDF oder CSV Dateien werden unterstützt" },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Keine Transaktionen in der Datei gefunden" },
        { status: 400 }
      );
    }

    await TransactionModel.insertMany(transactions, { ordered: false }).catch((e) => {
      if (e.code !== 11000) throw e;
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
