# Day 8 — Web Scraper

A Node.js scraper that crawls all 50 pages of [books.toscrape.com](https://books.toscrape.com) and exports every book listing — title, price, star rating, availability, and image URL — to a `books.csv` file.

Built as a practical demonstration of multi-page web scraping with Axios and Cheerio.

## Install

```bash
npm install
```

## Usage

```bash
node scraper.js
```

The scraper prints live progress as it crawls each page, then writes the results:

```
Scraping page 1... found 20 books (total so far: 20)
Scraping page 2... found 20 books (total so far: 40)
...
Done! 1000 books saved to books.csv
```

Output file: `books.csv` (written to the current directory).

## Dependencies

- [`axios`](https://www.npmjs.com/package/axios) — HTTP requests
- [`cheerio`](https://www.npmjs.com/package/cheerio) — HTML parsing
- [`csv-writer`](https://www.npmjs.com/package/csv-writer) — CSV export
