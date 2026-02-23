import { createBookSearchClient } from "./index";
import { BookQueries } from "./domain";

async function main() {
  const client = createBookSearchClient({
    format: "json",
    currency: "GBP"
  });

  const booksByShakespeare = await client.search(
    BookQueries.byAuthor("Shakespeare", 10)
  );

  console.log(booksByShakespeare);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});