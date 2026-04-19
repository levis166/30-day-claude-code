import Anthropic from '@anthropic-ai/sdk';
import readline from 'readline';
import fs from 'fs';
import os from 'os';
import path from 'path';

const client = new Anthropic();

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

function prompt(question) {
  return new Promise(resolve => rl.question(question, resolve));
}

async function collectMultilineInput() {
  console.log('Paste your text below. When done, press Enter then Ctrl+D (Mac/Linux) or Ctrl+Z (Windows):');
  console.log('');

  return new Promise(resolve => {
    const lines = [];
    rl.on('line', line => lines.push(line));
    rl.on('close', () => resolve(lines.join('\n')));
  });
}

async function rewriteInTones(text) {
  const stream = client.messages.stream({
    model: 'claude-opus-4-7',
    max_tokens: 2048,
    system: [
      {
        type: 'text',
        text: 'You are an expert copywriter who rewrites text in different tones. When given text, you will rewrite it in exactly three versions. Format your response exactly like this:\n\n## 1. Professional\n[rewritten text]\n\n## 2. Casual\n[rewritten text]\n\n## 3. Punchy/Bold\n[rewritten text]\n\nKeep the same core message but adapt the tone, vocabulary, and style for each version. Do not add any other commentary.',
        cache_control: { type: 'ephemeral' },
      }
    ],
    messages: [
      { role: 'user', content: `Please rewrite the following text in three tones:\n\n${text}` }
    ],
  });

  process.stdout.write('\n');
  let output = '';
  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      process.stdout.write(event.delta.text);
      output += event.delta.text;
    }
  }
  process.stdout.write('\n');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `tone-rewrite-${timestamp}.txt`;
  const filepath = path.join(os.homedir(), 'Desktop', filename);
  const fileContent = `ORIGINAL:\n${text}\n\n${'─'.repeat(40)}\n\n${output}`;
  fs.writeFileSync(filepath, fileContent);
  console.log(`\nSaved to Desktop: ${filename}`);
}

const text = await collectMultilineInput();

if (!text.trim()) {
  console.error('No text provided.');
  process.exit(1);
}

console.log('\nRewriting in 3 tones...');
await rewriteInTones(text.trim());
