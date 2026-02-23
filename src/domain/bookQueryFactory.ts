import type { BookQuery } from "./bookQuery";
import { ValidationError } from "./errors";

const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

const MIN_YEAR_PUBLISHED = 1450;

function normalizeText(value: string, fieldName: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new ValidationError(`${fieldName} must not be empty`, fieldName);
  }

  return trimmed;
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    throw new ValidationError("limit must be a number", "limit");
  }

  const integer = Math.floor(limit);

  if (integer < MIN_LIMIT) {
    throw new ValidationError(`limit must be at least ${MIN_LIMIT}`, "limit");
  }

  if (integer > MAX_LIMIT) {
    throw new ValidationError(`limit must be at most ${MAX_LIMIT}`, "limit");
  }

  return integer;
}

function normalizeYear(year: number): number {
  if (!Number.isFinite(year)) {
    throw new ValidationError("year must be a number", "year");
  }

  const integer = Math.floor(year);
  const maxYear = new Date().getFullYear() + 1;

  if (integer < MIN_YEAR_PUBLISHED) {
    throw new ValidationError(
      `year must be at least ${MIN_YEAR_PUBLISHED}`,
      "year"
    );
  }

  if (integer > maxYear) {
    throw new ValidationError(`year must be at most ${maxYear}`, "year");
  }

  return integer;
}

export const BookQueries = {
  byAuthor(author: string, limit: number): BookQuery {
    return {
      type: "byAuthor",
      author: normalizeText(author, "author"),
      limit: normalizeLimit(limit)
    };
  },

  byPublisher(publisher: string, limit: number): BookQuery {
    return {
      type: "byPublisher",
      publisher: normalizeText(publisher, "publisher"),
      limit: normalizeLimit(limit)
    };
  },

  byYearPublished(year: number, limit: number): BookQuery {
    return {
      type: "byYearPublished",
      year: normalizeYear(year),
      limit: normalizeLimit(limit)
    };
  }
};