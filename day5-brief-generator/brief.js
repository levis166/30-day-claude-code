import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import fs from 'fs';
import os from 'os';
import path from 'path';

const client = new Anthropic();

let ask;

if (process.stdin.isTTY) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  ask = (question) => new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
  ask._close = () => rl.close();
} else {
  const lines = await new Promise(resolve => {
    const buf = [];
    const rl = readline.createInterface({ input: process.stdin, output: null, terminal: false });
    rl.on('line', line => buf.push(line));
    rl.on('close', () => resolve(buf));
  });
  let i = 0;
  ask = (question) => {
    process.stdout.write(question);
    const answer = (lines[i++] ?? '').trim();
    process.stdout.write(answer + '\n');
    return Promise.resolve(answer);
  };
  ask._close = () => {};
}

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

console.log('\nCopy Brief Generator');
console.log('─'.repeat(40));
console.log('');

const brand       = await ask('1. What brand is this for?\n   > ');
const topic       = await ask('\n2. What is the topic or product category?\n   > ');
const primaryAngle  = await ask('\n3. What is the primary angle or direction?\n   > ');
const secondary     = await ask('\n4. Secondary angles or supporting points? (separate with commas)\n   > ');
const takeaways     = await ask(`\n5. Key takeaways — what should the reader understand about ${brand}?\n   (separate with commas)\n   > `);
const format        = await ask('\n6. What format is this for? (blog, EDM, social, catalogue)\n   > ');
const wordCount     = await ask('\n7. Target word count?\n   > ');
const references    = await ask('\n8. Any reference articles or past projects to draw from? (press Enter to skip)\n   > ');

ask._close();

const secondaryList = secondary.split(',').map(s => s.trim()).filter(Boolean);
const takeawayList  = takeaways.split(',').map(s => s.trim()).filter(Boolean);

console.log('\nGenerating brief...\n');

const systemPrompt = `You are a senior brand and content strategist. You write considered, strategic copy briefs for content teams across design, furniture, and interiors brands.

The tone should be confident, knowledgeable, and editorial — like a trusted design authority, not a salesperson. Content focuses on context, use cases, and how design fits into people's lives and industries. Avoid feature-listing or promotional language.

When generating a brief, follow this exact format with no deviation:

${brand} Copy Brief
[Topic]

Direction:
[2–3 strategic directional sentences that guide the writer's approach — not prescriptive, but orienting]

Primary angle:
[One clear, specific primary angle in one sentence]

Secondary angles:
• [point]
• [point]
• [point]

Key takeaways:
• [what this says about ${brand}]
• [what this says about ${brand}]
• [what this says about ${brand}]

Length: [word count]
Use cases: [format]

Output only the brief. No preamble, no commentary after.`;

const userMessage = `Generate a copy brief for ${brand}:

Topic: ${topic}
Primary angle: ${primaryAngle}
Secondary angles: ${secondaryList.join('; ')}
Key takeaways: ${takeawayList.join('; ')}
Format: ${format}
Word count: ${wordCount}${references ? `\nReferences: ${references}` : ''}`;

const stream = client.messages.stream({
  model: 'claude-opus-4-7',
  max_tokens: 1024,
  system: systemPrompt,
  messages: [{ role: 'user', content: userMessage }],
});

let output = '';
for await (const event of stream) {
  if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
    process.stdout.write(event.delta.text);
    output += event.delta.text;
  }
}
process.stdout.write('\n');

const date = new Date().toISOString().slice(0, 10);
const filename = `${slugify(brand)}-brief-${slugify(topic)}-${date}.txt`;
const filepath = path.join(os.homedir(), 'Desktop', filename);
fs.writeFileSync(filepath, output);
console.log(`\nSaved to Desktop: ${filename}`);
