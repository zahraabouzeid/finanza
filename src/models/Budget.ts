import mongoose, { Schema, Model } from "mongoose";
import { Budget } from "@/types";

const BudgetSchema = new Schema<Budget>(
  {
    month: { type: String, required: true, unique: true },
    incomeTarget: { type: Number, default: 0 },
    expenseTarget: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const BudgetModel: Model<Budget> =
  mongoose.models.Budget ?? mongoose.model<Budget>("Budget", BudgetSchema);
