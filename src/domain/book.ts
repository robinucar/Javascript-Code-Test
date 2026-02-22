import type {Money} from "./money"

export type Isbn = string;

export interface Book {
  title: string;
  author: string;
  isbn: Isbn;
  quantity: number;
  price: Money;
}