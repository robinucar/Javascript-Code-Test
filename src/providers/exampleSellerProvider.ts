import { DOMParser } from "@xmldom/xmldom";
import { ParseError, UnsupportedQueryError } from "../domain";
import type { Book, BookQuery, CurrencyCode } from "../domain";
import type { HttpClient } from "../http/types";
import type { BookProvider } from "./bookProvider";

type ExampleSellerJsonItem = {
  book: {
    title: string;
    author: string;
    isbn: string;
  };
  stock: {
    quantity: number;
    price: number;
  };
};

type ExampleSellerJsonResponse = ExampleSellerJsonItem[];

export type ExampleSellerProviderConfig = {
  baseUrl: string;
  format: "json" | "xml";
  currency: CurrencyCode;
  timeoutMs?: number;
};

export class ExampleSellerProvider implements BookProvider {
  constructor(
    private readonly http: HttpClient,
    private readonly config: ExampleSellerProviderConfig
  ) {}

  async search(query: BookQuery): Promise<Book[]> {
    const url = this.buildUrl(query);

    if (this.config.format === "json") {
      const response = await this.http.get<ExampleSellerJsonResponse>(url, {
        timeoutMs: this.config.timeoutMs
      });

      return response.data.map((item) => ({
        title: item.book.title,
        author: item.book.author,
        isbn: item.book.isbn,
        quantity: item.stock.quantity,
        price: {
          amount: item.stock.price,
          currency: this.config.currency
        }
      }));
    }

    const response = await this.http.get<string>(url, {
      timeoutMs: this.config.timeoutMs
    });

    return this.parseXmlBooks(response.data);
  }

  private parseXmlBooks(xmlText: string): Book[] {
    const document = new DOMParser().parseFromString(xmlText, "application/xml");
    const rootElement = document.documentElement;

    const itemElements = Array.from(rootElement.getElementsByTagName("item"));

    return itemElements.map((itemElement, itemIndex) => {
      const title = this.getRequiredTagTextFromPath(
        itemElement,
        ["book", "title"],
        itemIndex
      );
      const author = this.getRequiredTagTextFromPath(
        itemElement,
        ["book", "author"],
        itemIndex
      );
      const isbn = this.getRequiredTagTextFromPath(
        itemElement,
        ["book", "isbn"],
        itemIndex
      );
      const quantityText = this.getRequiredTagTextFromPath(
        itemElement,
        ["stock", "quantity"],
        itemIndex
      );
      const priceText = this.getRequiredTagTextFromPath(
        itemElement,
        ["stock", "price"],
        itemIndex
      );

      const quantity = Number(quantityText);
      const amount = Number(priceText);

      if (Number.isNaN(quantity)) {
        throw new ParseError(`Invalid quantity at item ${itemIndex}`);
      }
      if (Number.isNaN(amount)) {
        throw new ParseError(`Invalid price at item ${itemIndex}`);
      }

      return {
        title,
        author,
        isbn,
        quantity,
        price: {
          amount,
          currency: this.config.currency
        }
      };
    });
  }

  private getRequiredTagTextFromPath(
    parentElement: Element,
    path: string[],
    itemIndex: number
  ): string {
    let current: Element | null = parentElement;

    for (const segment of path) {
      current = current.getElementsByTagName(segment).item(0);

      if (!current) {
        throw new ParseError(`Missing ${segment} at item ${itemIndex}`);
      }
    }

    const value = (current.textContent ?? "").trim();

    if (!value) {
      throw new ParseError(`Missing ${path[path.length - 1]} at item ${itemIndex}`);
    }

    return value;
  }

  private buildUrl(query: BookQuery): string {
    const baseUrl = this.config.baseUrl;

    if (query.type === "byAuthor") {
      const searchParams = new URLSearchParams({
        q: query.author,
        limit: String(query.limit),
        format: this.config.format
      });

      return `${baseUrl}/by-author?${searchParams.toString()}`;
    }

    if (query.type === "byPublisher") {
      const searchParams = new URLSearchParams({
        q: query.publisher,
        limit: String(query.limit),
        format: this.config.format
      });

      return `${baseUrl}/by-publisher?${searchParams.toString()}`;
    }

    if (query.type === "byYearPublished") {
      const searchParams = new URLSearchParams({
        q: String(query.year),
        limit: String(query.limit),
        format: this.config.format
      });

      return `${baseUrl}/by-year?${searchParams.toString()}`;
    }

    return assertNever(query);
  }
}

function assertNever(_value: never): never {
  throw new UnsupportedQueryError("Query type is not supported", "unknown");
}