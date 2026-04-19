# Day 13 — AI Tools Dashboard

A local web dashboard that brings three AI writing tools into a single browser interface. Built with Express and the Claude API — no external services, no accounts, runs entirely on your machine.

## Tools Included

| Tool | Description |
|------|-------------|
| Tone Rewriter | Paste any text and rewrite it in a chosen tone |
| Email Drafter | Fill in a brief and get a polished email draft |
| Brief Generator | Answer a few prompts and receive a structured copywriting brief |

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
node server.js
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

The server runs on port 3000. All AI requests are handled server-side — your API key is never exposed to the browser.

## Dependencies

- [`express`](https://www.npmjs.com/package/express) — web server
- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)
