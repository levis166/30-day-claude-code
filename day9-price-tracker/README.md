# Day 9 — Price Tracker

A Node.js tool that monitors book prices on [books.toscrape.com](https://books.toscrape.com) and alerts you to any changes. It runs a full scrape on startup, saves a baseline to `prices.json`, then re-checks every minute and reports any price movements.

## Install

```bash
npm install
```

## Usage

```bash
node tracker.js
```

On first run, it saves current prices as a baseline. On every subsequent check, it compares the live prices against the saved snapshot and logs any changes:

```
[10:32:01] Running price check...
  Scraped 1000 books.
  2 price change(s) detected:

  Book:      A Light in the Attic
  Old price: £51.77
  New price: £49.99
```

Press **Ctrl+C** to stop. The tracker updates `prices.json` after each successful check.

## Dependencies

- [`axios`](https://www.npmjs.com/package/axios) — HTTP requests
- [`cheerio`](https://www.npmjs.com/package/cheerio) — HTML parsing
- [`node-cron`](https://www.npmjs.com/package/node-cron) — scheduled checks
