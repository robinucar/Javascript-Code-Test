import type { Book, BookQuery } from "../domain";

export interface BookProvider {
  search(query: BookQuery): Promise<Book[]>;
}