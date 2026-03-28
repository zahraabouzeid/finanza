import mongoose, { Schema, Model } from "mongoose";
import { Account } from "@/types";

const AccountSchema = new Schema<Account>(
  {
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ["giro", "tagesgeld", "credit_card"],
      required: true,
    },
    balance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const AccountModel: Model<Account> =
  mongoose.models.Account ??
  mongoose.model<Account>("Account", AccountSchema);
