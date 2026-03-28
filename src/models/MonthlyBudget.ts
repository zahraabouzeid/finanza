import mongoose, { Schema, Model } from "mongoose";
import { MonthlyBudget } from "@/types";

const MonthlyBudgetSchema = new Schema<MonthlyBudget>(
  {
    month: { type: String, required: true, unique: true }, // "YYYY-MM"
    creditCardSettlementDate: { type: Number, default: 12 },
    savingsTarget: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const MonthlyBudgetModel: Model<MonthlyBudget> =
  mongoose.models.MonthlyBudget ??
  mongoose.model<MonthlyBudget>("MonthlyBudget", MonthlyBudgetSchema);
