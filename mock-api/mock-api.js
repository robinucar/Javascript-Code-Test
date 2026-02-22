import http from 'node:http';
import { URL } from 'node:url';

const books = [
  {
    book: { title: 'Hamlet', author: 'Shakespeare', isbn: '9780000000001' },
    stock: { quantity: 3, price: 9.99 },
  },
  {
    book: { title: 'Macbeth', author: 'Shakespeare', isbn: '9780000000002' },
    stock: { quantity: 5, price: 12.5 },
  },
];

function toXml(items) {
  const itemsXml = items
    .map(
      (item) => `
  <item>
    <book>
      <title>${item.book.title}</title>
      <author>${item.book.author}</author>
      <isbn>${item.book.isbn}</isbn>
    </book>
    <stock>
      <quantity>${item.stock.quantity}</quantity>
      <price>${item.stock.price}</price>
    </stock>
  </item>`,
    )
    .join('');

  return `<response>${itemsXml}\n</response>`;
}

function filterBooksByQuery(searchParams) {
  const q = (searchParams.get('q') ?? '').toLowerCase();
  const limit = Number(searchParams.get('limit') ?? '10');
  const safeLimit = Number.isFinite(limit)
    ? Math.max(0, Math.min(limit, 50))
    : 10;

  const filtered = books.filter((item) => {
    return (
      item.book.author.toLowerCase().includes(q) ||
      item.book.title.toLowerCase().includes(q)
    );
  });

  return filtered.slice(0, safeLimit);
}

const server = http.createServer((req, res) => {
  if (!req.url) {
    res.statusCode = 400;
    res.end('Missing url');
    return;
  }

  const url = new URL(req.url, 'http://localhost');
  const format = (url.searchParams.get('format') ?? 'json').toLowerCase();

  if (
    url.pathname !== '/by-author' &&
    url.pathname !== '/by-publisher' &&
    url.pathname !== '/by-year'
  ) {
    res.statusCode = 404;
    res.end('Not found');
    return;
  }

  const result = filterBooksByQuery(url.searchParams);

  if (format === 'xml') {
    res.setHeader('content-type', 'application/xml');
    res.end(toXml(result));
    return;
  }

  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(result));
});

const port = Number(process.env.MOCK_API_PORT ?? '3000');
server.listen(port, () => {
  console.log(`Mock API running on http://localhost:${port}`);
});
