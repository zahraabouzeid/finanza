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
    month: { type: String, required: true, index: true }, // "YYYY-MM"
  },
  { timestamps: true }
);

TransactionSchema.index({ month: 1, source: 1 });
TransactionSchema.index({ date: -1 });

export const TransactionModel: Model<Transaction> =
  mongoose.models.Transaction ??
  mongoose.model<Transaction>("Transaction", TransactionSchema);
