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

async function main() {
  console.log('\n=== Email Drafter ===\n');

  const recipient = await ask('1. Who is the email to? (name and role)\n> ');
  const situation = await ask('\n2. What is the situation or context?\n> ');
  const goal      = await ask('\n3. What is the goal of this email? (e.g. follow up, propose meeting, deliver news)\n> ');
  const tone      = await ask('\n4. What tone? (formal / friendly-professional / warm)\n> ');
  const details   = await ask('\n5. Any specific details or points to include? (press Enter to skip)\n> ');

  rl.close();

  const detailsLine = details ? `Specific points to include: ${details}.` : '';

  const prompt = `Draft a polished professional email with the following details:

Recipient: ${recipient}
Situation/context: ${situation}
Goal of the email: ${goal}
Tone: ${tone}
${detailsLine}

Structure the email with:
- Subject: line
- Greeting
- Body (clear, concise paragraphs)
- Sign-off

Output only the email itself — no preamble or explanation.`;

  console.log('\nDrafting your email...\n');

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: 'You are an expert business writer. Draft clear, polished, professional emails tailored to the specified tone and goal.',
    messages: [{ role: 'user', content: prompt }],
  });

  const email = message.content[0].text;

  console.log('─'.repeat(60));
  console.log(email);
  console.log('─'.repeat(60));

  const date = new Date().toISOString().split('T')[0];
  const filename = `${date}-${slugify(recipient.split(' ')[0])}.txt`;
  const outputPath = path.resolve(filename);

  fs.writeFileSync(outputPath, email, 'utf8');

  console.log(`\nSaved to: ${outputPath}\n`);
}

main().catch(err => {
  console.error(err.message);
  process.exit(1);
});
