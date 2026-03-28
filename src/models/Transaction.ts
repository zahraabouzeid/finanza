import mongoose, { Schema, Model } from "mongoose";
import { Transaction } from "@/types";

const TransactionSchema = new Schema<Transaction>(
  {
    date: { type: Date, required: true },
    counterparty: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    source: {
      type: String,
      enum: ["credit_card", "bank"],
      required: true,
    },
    month: { type: String, required: true, index: true },
  },
  { timestamps: true }
);

TransactionSchema.index({ month: 1, source: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ amount: 1 });
// Prevent duplicate imports: same date + counterparty + amount + source
TransactionSchema.index(
  { date: 1, counterparty: 1, amount: 1, source: 1 },
  { unique: true }
);

export const TransactionModel: Model<Transaction> =
  mongoose.models.Transaction ??
  mongoose.model<Transaction>("Transaction", TransactionSchema);
