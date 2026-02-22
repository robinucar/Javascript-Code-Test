import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import jsonFixture from "../__tests__/fixtures/books.json";
import type { HttpClient, HttpResponse } from "../http/types";
import { ExampleSellerProvider } from "../providers/exampleSellerProvider";
import { BookQueries, ParseError } from "../domain";

class FakeHttpClient implements HttpClient {
  public lastUrl: string | undefined;

  constructor(private readonly responseData: unknown) {}

  async get<T>(url: string): Promise<HttpResponse<T>> {
    this.lastUrl = url;

    return {
      status: 200,
      data: this.responseData as T,
      headers: new Headers({ "content-type": "application/json" })
    };
  }
}

function readFixture(pathFromSrc: string): string {
  return readFileSync(join(process.cwd(), "src", pathFromSrc), "utf8");
}

describe("ExampleSellerProvider", () => {
  it("maps json payload into domain books", async () => {
    const http = new FakeHttpClient(jsonFixture);

    const provider = new ExampleSellerProvider(http, {
      baseUrl: "http://api.book-seller-example.com",
      format: "json",
      currency: "GBP"
    });

    const result = await provider.search(BookQueries.byAuthor("Shakespeare", 10));

    expect(result).toEqual([
      {
        title: "Hamlet",
        author: "Shakespeare",
        isbn: "9780000000001",
        quantity: 3,
        price: { amount: 9.99, currency: "GBP" }
      },
      {
        title: "Macbeth",
        author: "Shakespeare",
        isbn: "9780000000002",
        quantity: 5,
        price: { amount: 12.5, currency: "GBP" }
      }
    ]);

    expect(http.lastUrl).toContain("/by-author?");
    expect(http.lastUrl).toContain("q=Shakespeare");
    expect(http.lastUrl).toContain("limit=10");
    expect(http.lastUrl).toContain("format=json");
  });

  it("maps xml payload into domain books", async () => {
    const xmlFixture = readFixture("__tests__/fixtures/books.xml");
    const http = new FakeHttpClient(xmlFixture);

    const provider = new ExampleSellerProvider(http, {
      baseUrl: "http://api.book-seller-example.com",
      format: "xml",
      currency: "GBP"
    });

    const result = await provider.search(BookQueries.byAuthor("Shakespeare", 10));

    expect(result).toEqual([
      {
        title: "Hamlet",
        author: "Shakespeare",
        isbn: "9780000000001",
        quantity: 3,
        price: { amount: 9.99, currency: "GBP" }
      },
      {
        title: "Macbeth",
        author: "Shakespeare",
        isbn: "9780000000002",
        quantity: 5,
        price: { amount: 12.5, currency: "GBP" }
      }
    ]);

    expect(http.lastUrl).toContain("format=xml");
  });

  it("throws ParseError when xml is missing required fields", async () => {
    const invalidXml = `
      <response>
        <item>
          <book>
            <title></title>
            <author>Shakespeare</author>
            <isbn>9780000000001</isbn>
          </book>
          <stock>
            <quantity>3</quantity>
            <price>9.99</price>
          </stock>
        </item>
      </response>
    `.trim();

    const http = new FakeHttpClient(invalidXml);

    const provider = new ExampleSellerProvider(http, {
      baseUrl: "http://api.book-seller-example.com",
      format: "xml",
      currency: "GBP"
    });

    await expect(
      provider.search(BookQueries.byAuthor("Shakespeare", 10))
    ).rejects.toBeInstanceOf(ParseError);
  });
});