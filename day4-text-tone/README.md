# Day 4 — Text Tone Rewriter

A CLI tool that uses Claude AI to rewrite any block of text in three distinct tones: **Professional**, **Casual**, and **Punchy/Bold**. Output streams in real time and is automatically saved to your Desktop.

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
node tone.js
```

Paste your text when prompted, then press **Enter** followed by **Ctrl+D** (Mac/Linux) or **Ctrl+Z** (Windows) to submit.

Claude streams all three rewrites to the terminal. A timestamped `.txt` file is saved to your Desktop containing the original and all three versions.

## Dependencies

- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)
