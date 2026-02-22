import type { Book, BookQuery } from "./domain";
import type { BookProvider } from "./providers/bookProvider";

export type ProviderRegistry = Record<string, BookProvider>;

export type BookSearchClientConfig = {
  defaultProvider: string;
};

export class BookSearchClient {
  constructor(
    private readonly providers: ProviderRegistry,
    private readonly config: BookSearchClientConfig
  ) {}

  async search(query: BookQuery, providerName?: string): Promise<Book[]> {
    const selectedProviderName = providerName ?? this.config.defaultProvider;
    const provider = this.providers[selectedProviderName];

    if (!provider) {
      throw new Error(`Unknown provider: ${selectedProviderName}`);
    }

    return provider.search(query);
  }
}