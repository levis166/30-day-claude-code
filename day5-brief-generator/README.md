# Day 5 — Copy Brief Generator

An interactive CLI tool that collects brand and content details, then uses Claude AI to generate a structured, strategic copy brief — formatted and ready to hand off to a writer or designer.

Built for design, furniture, and interiors brands, with editorial tone and a structured output format.

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
node brief.js
```

The tool walks you through eight prompts:

1. Brand name
2. Topic or product category
3. Primary angle or direction
4. Secondary angles (comma-separated)
5. Key takeaways
6. Format (blog, EDM, social, catalogue)
7. Target word count
8. Reference articles (optional)

Claude generates the brief and streams it to the terminal. A `.txt` file named `[brand]-brief-[topic]-[date].txt` is saved to your Desktop.

## Dependencies

- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)
