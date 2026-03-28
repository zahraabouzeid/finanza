import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { pin } = await req.json();

  if (!process.env.APP_PIN) {
    return NextResponse.json({ error: "PIN not configured" }, { status: 500 });
  }

  if (pin !== process.env.APP_PIN) {
    return NextResponse.json({ error: "Falscher PIN" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set("finanza_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
