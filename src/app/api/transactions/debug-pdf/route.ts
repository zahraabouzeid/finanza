import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "no file" }, { status: 400 });

  const arrayBuffer = await file.arrayBuffer();
  const uint8 = new Uint8Array(arrayBuffer);
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse(uint8);
  const result = await parser.getText();

  return NextResponse.json({ text: result.text });
}
