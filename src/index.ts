import { FetchHttpClient } from "./http/fetchHttpClient";
import { BookSearchClient } from "./bookSearchClient";
import { ExampleSellerProvider } from "./providers/exampleSellerProvider";
import type { CurrencyCode } from "./domain";

export type CreateClientOptions = {
  provider?: "exampleSeller";
  baseUrl?: string;
  format?: "json" | "xml";
  currency?: CurrencyCode;
  timeoutMs?: number;
};

export function createBookSearchClient(options: CreateClientOptions = {}): BookSearchClient {
  const httpClient = new FetchHttpClient();

  const providerName = "exampleSeller";
  const provider = new ExampleSellerProvider(httpClient, {
    baseUrl: options.baseUrl ?? "http://api.book-seller-example.com",
    format: options.format ?? "json",
    currency: options.currency ?? "GBP",
    timeoutMs: options.timeoutMs
  });

  return new BookSearchClient(
    { [providerName]: provider },
    { defaultProvider: providerName }
  );
}

export { BookSearchClient } from "./bookSearchClient";
export type { Book, BookQuery, Money, CurrencyCode, Isbn } from "./domain";