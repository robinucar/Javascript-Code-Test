import { FetchHttpClient } from "./http/fetchHttpClient";
import { BookSearchClient } from "./bookSearchClient";
import { ExampleSellerProvider } from "./providers/exampleSellerProvider";
import type { CurrencyCode } from "./domain";
import type { BookProvider } from "./providers/bookProvider";

export type ProviderName = "exampleSeller";

export type CreateClientOptions = {
  provider?: ProviderName;
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

  const providers: Record<ProviderName, BookProvider> = {
    exampleSeller: new ExampleSellerProvider(httpClient, {
      baseUrl,
      format: options.format ?? "json",
      currency: options.currency ?? "GBP",
      timeoutMs: options.timeoutMs
    })
  };

  const providerName: ProviderName = options.provider ?? "exampleSeller";

  const provider = providers[providerName];

  if (!provider) {
    throw new Error(`Unknown provider: ${providerName}`);
  }

  return new BookSearchClient(
    { [providerName]: provider },
    { defaultProvider: providerName }
  );
}

export { BookSearchClient } from "./bookSearchClient";
export type { Book, BookQuery, Money, CurrencyCode, Isbn } from "./domain";