const readline = require('readline');
const fs = require('fs');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise((resolve) => rl.question(question, (answer) => resolve(answer.trim())));
}

function slugify(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is not set.');
    process.exit(1);
  }

  console.log('\n=== Zine Layout Generator ===\n');

  const title = await ask('Zine title: ');
  const theme = await ask('Theme / topic: ');
  const pages = await ask('Number of pages: ');
  const audience = await ask('Target audience: ');
  const mood = await ask('Mood / aesthetic: ');

  rl.close();

  console.log('\nGenerating your zine layout brief...\n');

  const prompt = `You are a zine designer and art director. Generate a detailed zine layout brief for the following concept:

**Title:** ${title}
**Theme / Topic:** ${theme}
**Number of Pages:** ${pages}
**Target Audience:** ${audience}
**Mood / Aesthetic:** ${mood}

Produce a complete, print-ready brief in Markdown with these sections:

## Cover Page Direction
- Headline copy
- Visual concept description
- Colour palette (name and hex codes)

## Page-by-Page Breakdown
For each page or spread, describe: layout type, content (text, image, pull quote, illustration, etc.), and any design notes. Number each spread.

## Typography Suggestions
- Heading font style (with example typeface recommendations)
- Body font style (with example typeface recommendations)
- Any accent or display type notes

## Print Specifications
- Page size: A5 (148 × 210 mm) individual pages, printed horizontally double-sided on A4 sheets (fold-and-staple / saddle-stitch zine format)
- Bleed: recommended bleed size
- Suggested paper stock
- Binding method recommendation

## Editorial Tone Guide
A short paragraph describing the voice, language style, and editorial personality of this zine.

Be specific, creative, and practical. The brief should be detailed enough for a designer to start work immediately.`;

  let brief;
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: 'You are an experienced zine designer and creative director. Produce clear, actionable, and inspiring layout briefs in well-structured Markdown.',
      messages: [{ role: 'user', content: prompt }],
    });

    brief = message.content[0].text;
  } catch (err) {
    console.error('API error:', err.message);
    process.exit(1);
  }

  const filename = `${slugify(title)}.md`;
  const output = `# ${title} — Zine Layout Brief\n\n> **Theme:** ${theme} | **Pages:** ${pages} | **Audience:** ${audience} | **Mood:** ${mood}\n\n---\n\n${brief}`;

  try {
    fs.writeFileSync(filename, output, 'utf8');
  } catch (err) {
    console.error('Failed to write file:', err.message);
    process.exit(1);
  }

  console.log(`✓ Zine layout brief saved to: ${filename}`);
}

main();
