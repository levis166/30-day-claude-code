const axios = require('axios');
const cheerio = require('cheerio');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const BASE_URL = 'https://books.toscrape.com';

const RATING_MAP = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
};

const csvWriter = createCsvWriter({
  path: 'books.csv',
  header: [
    { id: 'title', title: 'Title' },
    { id: 'price', title: 'Price' },
    { id: 'rating', title: 'Star Rating' },
    { id: 'availability', title: 'Availability' },
    { id: 'imageUrl', title: 'Image URL' },
  ],
});

async function fetchPage(url) {
  const response = await axios.get(url, { timeout: 10000 });
  return cheerio.load(response.data);
}

function parseBooksFromPage($) {
  const books = [];

  $('article.product_pod').each((_, el) => {
    const title = $(el).find('h3 > a').attr('title');
    const price = $(el).find('p.price_color').text().trim();
    const ratingClass = $(el).find('p.star-rating').attr('class') || '';
    const ratingWord = ratingClass.replace('star-rating', '').trim();
    const rating = RATING_MAP[ratingWord] ?? 0;
    const availability = $(el).find('p.availability').text().trim();
    const imgSrc = $(el).find('div.image_container img').attr('src') || '';
    const imageUrl = imgSrc.startsWith('http')
      ? imgSrc
      : `${BASE_URL}/${imgSrc.replace(/^\.\.\/\.\.\//, '')}`;

    books.push({ title, price, rating, availability, imageUrl });
  });

  return books;
}

function getNextPageUrl($, currentUrl) {
  const nextHref = $('li.next > a').attr('href');
  if (!nextHref) return null;
  return new URL(nextHref, currentUrl).href;
}

async function scrape() {
  const allBooks = [];
  let url = BASE_URL;
  let pageNum = 1;

  while (url) {
    process.stdout.write(`Scraping page ${pageNum}...`);
    const $ = await fetchPage(url);
    const books = parseBooksFromPage($);
    allBooks.push(...books);
    console.log(` found ${books.length} books (total so far: ${allBooks.length})`);

    url = getNextPageUrl($, url);
    pageNum++;
  }

  console.log('\nWriting to books.csv...');
  await csvWriter.writeRecords(allBooks);
  console.log(`Done! ${allBooks.length} books saved to books.csv`);
}

scrape().catch((err) => {
  console.error('Scraper failed:', err.message);
  process.exit(1);
});
