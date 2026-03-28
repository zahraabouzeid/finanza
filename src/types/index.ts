export type TransactionSource = "credit_card" | "bank";
export type TransactionType = "income" | "expense";

export interface Transaction {
  _id?: string;
  date: Date;
  counterparty: string;
  description?: string;
  category: string;
  amount: number; // positive = income, negative = expense
  source: TransactionSource;
  month: string; // "YYYY-MM" for easy querying
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Subscription {
  _id?: string;
  name: string;
  amount: number; // negative
  paymentMethod: "debit" | "lastschrift" | "credit_card";
  billingDay?: number; // day of month
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

export interface MonthlyBudget {
  _id?: string;
  month: string; // "YYYY-MM"
  creditCardSettlementDate: number; // day of month (default 12)
  savingsTarget: number; // how much to transfer to Tagesgeld
  notes?: string;
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

// CSV import from bank (e.g. Wise, N26)
export interface RawTransaction {
  date: string;
  counterparty: string;
  description?: string;
  category: string;
  amount: string;
}
