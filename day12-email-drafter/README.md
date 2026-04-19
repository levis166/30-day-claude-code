# Day 12 — Email Drafter

An interactive CLI tool that uses Claude AI to write polished, professional emails based on a short situation brief. The draft is printed to the terminal and saved as a text file.

## Install

```bash
npm install
```

Requires an Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

## Usage

```bash
node email.js
```

The tool asks five questions:

1. Recipient name and role
2. Situation or context
3. Goal of the email (e.g. follow up, propose meeting, deliver news)
4. Tone (formal / friendly-professional / warm)
5. Specific details or points to include (optional)

Claude drafts a complete email with subject line, greeting, body, and sign-off. The output is saved as `YYYY-MM-DD-[recipient].txt` in the current directory.

## Dependencies

- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)
