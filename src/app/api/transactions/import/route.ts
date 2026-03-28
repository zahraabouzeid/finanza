import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { TransactionModel } from "@/models/Transaction";
import { parseTransactionCSV } from "@/lib/utils/csv-parser";
import { parseAdvanziaText } from "@/lib/utils/advanzia-parser";

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

      transactions = parseAdvanziaText(result.text);
      // KK: ignore positive amounts (payments to the card, not real income)
      transactions = transactions.filter((t) => t.amount < 0);
    } else if (isCSV) {
      const content = await file.text();
      transactions = parseTransactionCSV(content, source as "credit_card" | "bank");
    } else {
      return NextResponse.json(
        { error: "Nur PDF oder CSV Dateien werden unterstuetzt" },
        { status: 400 }
      );
    }

    if (transactions.length === 0) {
      return NextResponse.json(
        { error: "Keine Transaktionen in der Datei gefunden" },
        { status: 400 }
      );
    }

    // insertMany with ordered:false continues on duplicates (unique index violation = code 11000)
    let inserted = 0;
    let skipped = 0;

    try {
      const result = await TransactionModel.insertMany(transactions, { ordered: false });
      inserted = result.length;
    } catch (e: unknown) {
      const mongoError = e as { code?: number; insertedDocs?: unknown[]; writeErrors?: unknown[] };
      if (mongoError.code === 11000 || (mongoError as { name?: string }).name === "MongoBulkWriteError") {
        inserted = (mongoError.insertedDocs ?? []).length;
        skipped = transactions.length - inserted;
      } else {
        throw e;
      }
    }

    const msg =
      skipped > 0
        ? `${inserted} importiert, ${skipped} bereits vorhanden`
        : `${inserted} Transaktionen importiert`;

    return NextResponse.json({ imported: inserted, skipped, message: msg });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Import fehlgeschlagen" }, { status: 500 });
  }
}
