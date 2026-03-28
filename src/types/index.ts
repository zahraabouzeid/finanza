export type TransactionSource = "credit_card" | "bank";

export interface Transaction {
  _id?: string;
  date: Date;
  counterparty: string;
  description?: string;
  category: string;
  amount: number; // positive = income (bank only), negative = expense
  source: TransactionSource;
  month: string; // "YYYY-MM"
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subscription {
  _id?: string;
  name: string;
  amount: number; // negative
  paymentMethod: "debit" | "lastschrift" | "credit_card";
  billingDay?: number;
  active: boolean;
  category: string;
  createdAt?: Date;
}

export interface Account {
  _id?: string;
  name: string;
  type: "giro" | "tagesgeld" | "credit_card";
  balance: number;
  updatedAt?: Date;
}

export interface Budget {
  _id?: string;
  month: string; // "YYYY-MM"
  incomeTarget: number;
  expenseTarget: number; // positive number, represents max spending
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MonthlySummary {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  byCategory: Record<string, number>;
  creditCardTotal: number;
  bankTotal: number;
}

export interface RawTransaction {
  date: string;
  counterparty: string;
  description?: string;
  category: string;
  amount: string;
}
