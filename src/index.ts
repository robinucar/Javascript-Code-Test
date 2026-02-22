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

export function createBookSearchClient(
  options: CreateClientOptions = {}
): BookSearchClient {
  const httpClient = new FetchHttpClient();

  const baseUrl = options.baseUrl ?? process.env.BOOK_API_BASE_URL;

  if (!baseUrl) {
    throw new Error(
      "Missing base URL. Set BOOK_API_BASE_URL or pass baseUrl to createBookSearchClient."
    );
  }

  const providerName = "exampleSeller";
  const provider = new ExampleSellerProvider(httpClient, {
    baseUrl,
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