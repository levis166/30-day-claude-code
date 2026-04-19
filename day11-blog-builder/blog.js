const readline = require('readline');
const fs = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function ask(question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const wordTargets = { short: 300, medium: 600, long: 1000 };

async function main() {
  console.log('\n=== Blog Post Generator ===\n');

  const topic    = await ask('1. What is the blog post topic?\n> ');
  const audience = await ask('\n2. Who is the target audience?\n> ');
  const tone     = await ask('\n3. What tone? (professional / conversational / thought leadership)\n> ');
  const length   = await ask('\n4. How long? (short: ~300 words / medium: ~600 words / long: ~1000 words)\n> ');
  const keywords = await ask('\n5. Any specific points or keywords to include? (press Enter to skip)\n> ');

  rl.close();

  const wordCount = wordTargets[length.toLowerCase()] || 600;
  const keywordsLine = keywords ? `Include these specific points or keywords: ${keywords}.` : '';

  const prompt = `Write a fully structured blog post with the following requirements:

Topic: ${topic}
Target audience: ${audience}
Tone: ${tone}
Length: approximately ${wordCount} words
${keywordsLine}

Format the post in Markdown with:
- A compelling title (H1)
- An engaging introduction paragraph
- 3-4 subheadings (H2) with substantive content under each
- A conclusion section (H2) with a clear takeaway or call to action

Output only the Markdown content — no preamble or explanation.`;

  console.log('\nGenerating your blog post...\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: 'You are an expert blog writer. Write clear, engaging, well-structured content tailored to the specified audience and tone.',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0].text;

  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${slugify(topic)}.md`;
  const outputPath = path.resolve(filename);

  fs.writeFileSync(outputPath, content, 'utf8');

  console.log(`Blog post saved to: ${outputPath}\n`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
