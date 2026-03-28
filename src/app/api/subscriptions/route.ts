import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { SubscriptionModel } from "@/models/Subscription";

export async function GET() {
  try {
    await connectDB();
    const subscriptions = await SubscriptionModel.find().sort({ name: 1 }).lean();
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const subscription = await SubscriptionModel.create(body);
    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create subscription" }, { status: 500 });
  }
}
