import type { BookQuery } from "./bookQuery";

const MIN_LIMIT = 1;
const MAX_LIMIT = 50;

const MIN_YEAR_PUBLISHED = 1450;

function normalizeText(value: string, fieldName: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    throw new Error(`${fieldName} must not be empty`);
  }

  return trimmed;
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit)) {
    throw new Error("limit must be a number");
  }

  const integer = Math.floor(limit);

  if (integer < MIN_LIMIT) {
    throw new Error(`limit must be at least ${MIN_LIMIT}`);
  }

  if (integer > MAX_LIMIT) {
    throw new Error(`limit must be at most ${MAX_LIMIT}`);
  }

  return integer;
}

function normalizeYear(year: number): number {
  if (!Number.isFinite(year)) {
    throw new Error("year must be a number");
  }

  const integer = Math.floor(year);
  const maxYear = new Date().getFullYear() + 1;

  if (integer < MIN_YEAR_PUBLISHED) {
    throw new Error(`year must be at least ${MIN_YEAR_PUBLISHED}`);
  }

  if (integer > maxYear) {
    throw new Error(`year must be at most ${maxYear}`);
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