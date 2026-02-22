import { describe, it, expect } from "vitest";
import type { BookProvider } from "../providers/bookProvider";
import { BookSearchClient } from "../bookSearchClient";

describe("BookSearchClient", () => {
  it("delegates search to the default provider", async () => {
    const fakeProvider: BookProvider = {
      search: async () => [
        {
          title: "Test Book",
          author: "Test Author",
          isbn: "test",
          quantity: 1,
          price: { amount: 1, currency: "GBP" }
        }
      ]
    };

    const client = new BookSearchClient(
      { example: fakeProvider },
      { defaultProvider: "example" }
    );

    const result = await client.search({
      type: "byAuthor",
      author: "Someone",
      limit: 1
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.title).toBe("Test Book");
  });

  it("can select a provider by name", async () => {
    const providerA: BookProvider = { search: async () => [] };
    const providerB: BookProvider = {
      search: async () => [
        {
          title: "From B",
          author: "B",
          isbn: "b",
          quantity: 1,
          price: { amount: 2, currency: "GBP" }
        }
      ]
    };

    const client = new BookSearchClient(
      { a: providerA, b: providerB },
      { defaultProvider: "a" }
    );

    const result = await client.search(
      { type: "byAuthor", author: "X", limit: 1 },
      "b"
    );

    expect(result[0]?.title).toBe("From B");
  });
});

it("throws an error when the selected provider is not registered", async () => {
  const client = new BookSearchClient({}, { defaultProvider: "missing" });

  await expect(
    client.search({ type: "byAuthor", author: "X", limit: 1 })
  ).rejects.toThrow("Unknown provider: missing");
});