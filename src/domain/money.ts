export type CurrencyCode = "GBP" | "EUR" | "USD";

export interface Money {
  amount: number;
  currency: CurrencyCode;
}