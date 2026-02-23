export type BookQuery =
  | {
      type: "byAuthor";
      author: string;
      limit: number;
    }
  | {
      type: "byPublisher";
      publisher: string;
      limit: number;
    }
  | {
      type: "byYearPublished";
      year: number;
      limit: number;
    };