import Anthropic from "@anthropic-ai/sdk";
import readline from "readline";
import fs from "fs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `Mood board creative director. Given a theme, return ONLY raw JSON, no markdown:
{"images":[{"subject":"","composition":"","colour_palette":"","mood":"","search_query":""}],"colour_palette":[{"hex":"#RRGGBB","name":""}],"typography":{"heading":"","body":"","rationale":""},"creative_direction":""}
Rules: 6 images, 5 palette colours, valid hex codes, search_query is 2-4 words.`;

function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

function themeToFilename(theme) {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80) + "-moodboard.md";
}

function formatHTML(theme, data) {
  const title = theme.replace(/\b\w/g, (c) => c.toUpperCase());

  const swatches = data.colour_palette.map(c => `
    <div class="swatch">
      <div class="swatch-block" style="background:${c.hex}"></div>
      <div class="swatch-label">
        <span class="swatch-name">${c.name}</span>
        <span class="swatch-hex">${c.hex}</span>
      </div>
    </div>`).join("");

  const images = data.images.map((img, i) => {
    const q = encodeURIComponent(img.search_query);
    return `
    <div class="image-card">
      <div class="image-number">0${i + 1}</div>
      <h3>${img.subject}</h3>
      <dl>
        <dt>Composition</dt><dd>${img.composition}</dd>
        <dt>Colours</dt><dd>${img.colour_palette}</dd>
        <dt>Mood</dt><dd>${img.mood}</dd>
        <dt>Search</dt><dd class="search-links">
          <a href="https://cosmos.so/search?q=${q}" target="_blank">Cosmos</a>
          <a href="https://searchsystem.co/search?q=${q}" target="_blank">Searchsystem</a>
          <a href="https://spiral.soot.com/spiral" target="_blank">Spiral ↗</a>
          <button class="copy-btn" onclick="copyQ(this,'${img.search_query}')">Copy query</button>
        </dd>
      </dl>
    </div>`;
  }).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} — Mood Board</title>
<style>
  :root {
    --ink: #1a1a1a;
    --mid: #6b6b6b;
    --rule: #e0e0e0;
    --bg: #f7f5f2;
    --card: #ffffff;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    background: var(--bg);
    color: var(--ink);
    font-size: 14px;
    line-height: 1.6;
  }
  header {
    border-bottom: 1px solid var(--ink);
    padding: 48px 64px 32px;
  }
  header .label {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mid);
    margin-bottom: 12px;
  }
  header h1 {
    font-size: clamp(22px, 4vw, 42px);
    font-weight: 300;
    letter-spacing: -0.01em;
    line-height: 1.15;
    max-width: 800px;
  }
  main { padding: 0 64px 80px; }
  section { padding: 48px 0; border-bottom: 1px solid var(--rule); }
  section:last-child { border-bottom: none; }
  h2 {
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--mid);
    margin-bottom: 24px;
  }
  .creative-direction {
    font-size: 18px;
    font-weight: 300;
    line-height: 1.7;
    max-width: 700px;
    font-style: italic;
  }
  .palette { display: flex; gap: 16px; flex-wrap: wrap; }
  .swatch { display: flex; align-items: center; gap: 12px; }
  .swatch-block {
    width: 48px; height: 48px;
    border-radius: 4px;
    border: 1px solid rgba(0,0,0,0.08);
    flex-shrink: 0;
  }
  .swatch-name { display: block; font-size: 13px; font-weight: 500; }
  .swatch-hex { display: block; font-size: 11px; color: var(--mid); font-family: monospace; }
  .typography-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; max-width: 700px; }
  .type-item dt { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--mid); margin-bottom: 4px; }
  .type-item dd { font-size: 15px; }
  .rationale { grid-column: 1 / -1; font-style: italic; color: var(--mid); font-size: 13px; }
  .images-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1px; background: var(--rule); }
  .image-card { background: var(--card); padding: 28px; position: relative; }
  .image-number {
    font-size: 10px; letter-spacing: 0.15em; color: var(--rule);
    position: absolute; top: 28px; right: 28px;
    font-weight: 700;
  }
  .image-card h3 { font-size: 14px; font-weight: 500; margin-bottom: 16px; padding-right: 32px; line-height: 1.4; }
  .image-card dl {}
  .image-card dt { font-size: 9px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mid); margin-top: 12px; }
  .image-card dd { font-size: 13px; color: var(--ink); }
  .search-links { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 2px; }
  .search-links a {
    font-size: 11px;
    color: var(--ink);
    text-decoration: none;
    border-bottom: 1px solid var(--ink);
    padding-bottom: 1px;
    letter-spacing: 0.05em;
  }
  .search-links a:hover { color: var(--mid); border-color: var(--mid); }
  .copy-btn {
    font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--mid); background: none; border: none; border-left: 1px solid var(--rule);
    padding: 0 0 0 10px; margin-left: 10px; cursor: pointer; font-family: inherit;
    transition: color 0.15s;
  }
  .copy-btn:hover { color: var(--ink); }
  .copy-btn.copied { color: green; }
</style>
</head>
<body>
<header>
  <p class="label">Mood Board</p>
  <h1>${title}</h1>
</header>
<main>
  <section>
    <h2>Creative Direction</h2>
    <p class="creative-direction">${data.creative_direction}</p>
  </section>
  <section>
    <h2>Colour Palette</h2>
    <div class="palette">${swatches}</div>
  </section>
  <section>
    <h2>Typography</h2>
    <dl class="typography-grid">
      <div class="type-item"><dt>Heading</dt><dd>${data.typography.heading}</dd></div>
      <div class="type-item"><dt>Body</dt><dd>${data.typography.body}</dd></div>
      <div class="type-item rationale"><dt>Rationale</dt><dd>${data.typography.rationale}</dd></div>
    </dl>
  </section>
  <section>
    <h2>Image References</h2>
    <div class="images-grid">${images}</div>
  </section>
</main>
<script>
function copyQ(btn, query) {
  navigator.clipboard.writeText(query).then(() => {
    btn.textContent = 'Copied!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy query'; btn.classList.remove('copied'); }, 1800);
  });
}
</script>
</body>
</html>`;
}

function formatMarkdown(theme, data) {
  const lines = [];

  lines.push(`# ${theme.replace(/\b\w/g, (c) => c.toUpperCase())} Mood Board`);
  lines.push("");
  lines.push("---");
  lines.push("");

  lines.push("## Creative Direction");
  lines.push("");
  lines.push(data.creative_direction);
  lines.push("");

  lines.push("---");
  lines.push("");

  lines.push("## Colour Palette");
  lines.push("");
  for (const colour of data.colour_palette) {
    lines.push(`- **${colour.name}** — \`${colour.hex}\``);
  }
  lines.push("");

  lines.push("---");
  lines.push("");

  lines.push("## Typography");
  lines.push("");
  lines.push(`- **Heading:** ${data.typography.heading}`);
  lines.push(`- **Body:** ${data.typography.body}`);
  lines.push(`- **Rationale:** ${data.typography.rationale}`);
  lines.push("");

  lines.push("---");
  lines.push("");

  lines.push("## Image References");
  lines.push("");
  data.images.forEach((img, i) => {
    lines.push(`### Image ${i + 1}: ${img.subject}`);
    lines.push("");
    lines.push(`| Field | Details |`);
    lines.push(`|-------|---------|`);
    lines.push(`| **Composition** | ${img.composition} |`);
    lines.push(`| **Colours** | ${img.colour_palette} |`);
    lines.push(`| **Mood** | ${img.mood} |`);
    const q = encodeURIComponent(img.search_query);
    const cosmos = `https://cosmos.so/search?q=${q}`;
    const searchsystem = `https://searchsystem.co/search?q=${q}`;
    lines.push(`| **Search** | [Cosmos](${cosmos}) · [Searchsystem](${searchsystem}) · [Spiral ↗](https://spiral.soot.com/spiral) |`);
    lines.push(`| **Spiral query** | \`${img.search_query}\` |`);
    lines.push("");
  });

  return lines.join("\n");
}

async function main() {
  const theme = await ask("Enter your mood board theme: ");
  if (!theme) {
    console.error("Error: Theme cannot be empty.");
    process.exit(1);
  }

  console.log(`\nGenerating mood board for: "${theme}" …\n`);

  let response;
  try {
    response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Create a mood board for this theme: ${theme}`,
        },
      ],
    });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      console.error("Error: Invalid or missing ANTHROPIC_API_KEY.");
    } else if (error instanceof Anthropic.RateLimitError) {
      console.error("Error: Rate limit exceeded. Please try again shortly.");
    } else if (error instanceof Anthropic.APIError) {
      console.error(`API error (${error.status}): ${error.message}`);
    } else {
      console.error("Unexpected error:", error.message);
    }
    process.exit(1);
  }

  const rawText = response.content.find((b) => b.type === "text")?.text ?? "";

  const cleaned = rawText.replace(/^```[a-z]*\n?/i, "").replace(/\n?```$/i, "").trim();

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch {
    console.error("Error: The API returned invalid JSON. Raw response:\n");
    console.error(rawText);
    process.exit(1);
  }

  const markdown = formatMarkdown(theme, data);
  const html = formatHTML(theme, data);
  const basename = themeToFilename(theme).replace(".md", "");
  const mdFile = `${basename}.md`;
  const htmlFile = `${process.env.HOME}/Desktop/${basename}.html`;

  try {
    fs.writeFileSync(mdFile, markdown, "utf8");
    fs.writeFileSync(htmlFile, html, "utf8");
  } catch (error) {
    console.error(`Error writing file: ${error.message}`);
    process.exit(1);
  }

  console.log(`Markdown saved to: ${mdFile}`);
  console.log(`Preview saved to:  ${htmlFile}`);
}

main();
