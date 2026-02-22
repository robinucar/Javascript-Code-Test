import { createBookSearchClient } from "./index";

async function main() {
  const client = createBookSearchClient({
    format: "json",
    currency: "GBP"
  });

  const booksByShakespeare = await client.search({
    type: "byAuthor",
    author: "Shakespeare",
    limit: 10
  });

  console.log(booksByShakespeare);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});