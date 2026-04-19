# Day 11 — Blog Post Generator

An interactive CLI tool that uses Claude AI to write a complete, structured blog post based on your inputs. Output is saved as a Markdown file, ready to publish or hand off to an editor.

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
node blog.js
```

The tool asks five questions:

1. Blog post topic
2. Target audience
3. Tone (professional / conversational / thought leadership)
4. Length (short ~300 words / medium ~600 words / long ~1000 words)
5. Specific points or keywords to include (optional)

Claude generates a fully formatted Markdown post with a title, introduction, 3–4 subheadings, and a conclusion. The file is saved as `YYYY-MM-DD-[topic-slug].md` in the current directory.

## Dependencies

- [`@anthropic-ai/sdk`](https://www.npmjs.com/package/@anthropic-ai/sdk)
