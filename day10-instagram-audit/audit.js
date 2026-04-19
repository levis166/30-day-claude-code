const fs = require('fs');
const { parse } = require('csv-parse/sync');

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: node audit.js <posts.csv>');
  process.exit(1);
}

const raw = fs.readFileSync(csvPath, 'utf8');
const posts = parse(raw, { columns: true, skip_empty_lines: true });

// Normalize numeric fields
posts.forEach(p => {
  p.likes = Number(p.likes) || 0;
  p.comments = Number(p.comments) || 0;
  p.followers = Number(p.followers) || 0;
  p.engagementRate = p.followers > 0
    ? ((p.likes + p.comments) / p.followers) * 100
    : 0;
});

// Average engagement rate
const avgEngagement = posts.reduce((sum, p) => sum + p.engagementRate, 0) / posts.length;

// Best post type by average engagement
const byType = {};
posts.forEach(p => {
  const t = p.type || 'unknown';
  if (!byType[t]) byType[t] = { sum: 0, count: 0 };
  byType[t].sum += p.engagementRate;
  byType[t].count++;
});
const bestType = Object.entries(byType)
  .map(([type, { sum, count }]) => ({ type, avg: sum / count }))
  .sort((a, b) => b.avg - a.avg)[0];

// Best posting day by average engagement
const byDay = {};
posts.forEach(p => {
  const day = p.date ? new Date(p.date).toLocaleDateString('en-US', { weekday: 'long' }) : 'unknown';
  if (!byDay[day]) byDay[day] = { sum: 0, count: 0 };
  byDay[day].sum += p.engagementRate;
  byDay[day].count++;
});
const bestDay = Object.entries(byDay)
  .map(([day, { sum, count }]) => ({ day, avg: sum / count }))
  .sort((a, b) => b.avg - a.avg)[0];

// Top 3 and worst 3 posts
const sorted = [...posts].sort((a, b) => b.engagementRate - a.engagementRate);
const top3 = sorted.slice(0, 3);
const worst3 = sorted.slice(-3).reverse();

// Output
console.log('=== Instagram Audit ===\n');
console.log(`Total posts analyzed: ${posts.length}`);
console.log(`Average engagement rate: ${avgEngagement.toFixed(2)}%`);
console.log(`Best post type: ${bestType.type} (${bestType.avg.toFixed(2)}% avg engagement)`);
console.log(`Best posting day: ${bestDay.day} (${bestDay.avg.toFixed(2)}% avg engagement)`);

console.log('\n--- Top 3 Posts ---');
top3.forEach((p, i) => {
  console.log(`${i + 1}. [${p.type || 'unknown'}] ${p.date || 'no date'} — ${p.engagementRate.toFixed(2)}% engagement (${p.likes} likes, ${p.comments} comments)`);
});

console.log('\n--- Worst 3 Posts ---');
worst3.forEach((p, i) => {
  console.log(`${i + 1}. [${p.type || 'unknown'}] ${p.date || 'no date'} — ${p.engagementRate.toFixed(2)}% engagement (${p.likes} likes, ${p.comments} comments)`);
});
