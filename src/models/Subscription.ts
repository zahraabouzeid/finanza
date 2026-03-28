import mongoose, { Schema, Model } from "mongoose";
import { Subscription } from "@/types";

const SubscriptionSchema = new Schema<Subscription>(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true }, // negative
    paymentMethod: {
      type: String,
      enum: ["debit", "lastschrift", "credit_card"],
      required: true,
    },
    billingDay: { type: Number },
    active: { type: Boolean, default: true },
    category: { type: String, default: "Abonnements" },
  },
  { timestamps: true }
);

export const SubscriptionModel: Model<Subscription> =
  mongoose.models.Subscription ??
  mongoose.model<Subscription>("Subscription", SubscriptionSchema);
