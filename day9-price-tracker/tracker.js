const axios = require('axios');
const cheerio = require('cheerio');
const cron = require('node-cron');
const fs = require('fs');

const BASE_URL = 'https://books.toscrape.com';
const PRICES_FILE = 'prices.json';

let isRunning = false;

async function fetchPage(url) {
  const { data } = await axios.get(url, { timeout: 10000 });
  return cheerio.load(data);
}

async function scrapeAllPrices() {
  const prices = {};
  let url = BASE_URL;
  let page = 1;

  while (url) {
    process.stdout.write(`  Fetching page ${page}...\r`);
    const $ = await fetchPage(url);

    $('article.product_pod').each((_, el) => {
      const title = $(el).find('h3 > a').attr('title');
      const price = $(el).find('p.price_color').text().trim();
      prices[title] = price;
    });

    const nextHref = $('li.next > a').attr('href');
    url = nextHref ? new URL(nextHref, url).href : null;
    page++;
  }

  return prices;
}

function loadSavedPrices() {
  if (!fs.existsSync(PRICES_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(PRICES_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function savePrices(prices) {
  fs.writeFileSync(PRICES_FILE, JSON.stringify(prices, null, 2));
}

function compareAndReport(oldPrices, newPrices) {
  const changes = [];

  for (const [title, newPrice] of Object.entries(newPrices)) {
    const oldPrice = oldPrices[title];
    if (oldPrice && oldPrice !== newPrice) {
      changes.push({ title, oldPrice, newPrice });
    }
  }

  // Check for books that disappeared
  for (const title of Object.keys(oldPrices)) {
    if (!(title in newPrices)) {
      changes.push({ title, oldPrice: oldPrices[title], newPrice: '(removed)' });
    }
  }

  if (changes.length === 0) {
    console.log('  No price changes detected.');
  } else {
    console.log(`  ${changes.length} price change(s) detected:\n`);
    for (const { title, oldPrice, newPrice } of changes) {
      console.log(`  Book:      ${title}`);
      console.log(`  Old price: ${oldPrice}`);
      console.log(`  New price: ${newPrice}`);
      console.log('  ' + '-'.repeat(50));
    }
  }
}

async function runScrape() {
  if (isRunning) return;
  isRunning = true;
  const timestamp = new Date().toLocaleTimeString();
  console.log(`\n[${timestamp}] Running price check...`);

  let newPrices;
  try {
    newPrices = await scrapeAllPrices();
  } catch (err) {
    console.error(`  Scrape failed: ${err.message}`);
    isRunning = false;
    return;
  }

  const bookCount = Object.keys(newPrices).length;
  process.stdout.write(`  Scraped ${bookCount} books.                  \n`);

  const oldPrices = loadSavedPrices();

  if (!oldPrices) {
    console.log('  No previous data found — saving baseline prices.');
  } else {
    compareAndReport(oldPrices, newPrices);
  }

  savePrices(newPrices);
  console.log(`  prices.json updated.`);
  isRunning = false;
}

// Run immediately on start, then every minute
runScrape();
cron.schedule('* * * * *', runScrape);

console.log('Price tracker started. Checking every minute. Press Ctrl+C to stop.\n');
