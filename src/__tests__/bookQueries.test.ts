import { describe, it, expect } from "vitest";
import { BookQueries, ValidationError } from "../domain";

describe("BookQueries", () => {
  it("throws ValidationError when author is empty", () => {
    expect(() => BookQueries.byAuthor("   ", 10)).toThrowError(ValidationError);
  });

  it("throws ValidationError when limit is less than 1", () => {
    expect(() => BookQueries.byAuthor("Shakespeare", 0)).toThrowError(
      ValidationError
    );
  });

  it("throws ValidationError when year is out of range", () => {
    expect(() => BookQueries.byYearPublished(1200, 10)).toThrowError(
      ValidationError
    );
  });
});