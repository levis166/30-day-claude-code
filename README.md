# 30 Days of Claude Code

A collection of practical AI-powered tools built over 30 days by a marketing coordinator learning to code with Claude.

Each project is self-contained, built with Node.js, and focused on real tasks that come up in marketing and content work — renaming files, resizing images, drafting emails, generating briefs, and more. No prior programming experience required to use them.

## About

**Author:** Levi Stubbs — marketing coordinator exploring AI development tools through daily builds.

**Stack:** Node.js, Claude API (Anthropic), Express

**Approach:** One tool per day, starting simple and building toward more complex, AI-integrated projects.

## Tools

| Day | Project | Description |
|-----|---------|-------------|
| 3 | [File Renamer](./day3-file-renamer) | Batch-renames JPG files to a clean, sequential naming convention |
| 4 | [Text Tone Rewriter](./day4-text-tone) | Rewrites any text in Professional, Casual, and Punchy/Bold tones using Claude |
| 5 | [Copy Brief Generator](./day5-brief-generator) | Generates structured, strategic copy briefs via interactive CLI and Claude |
| 6 | [Batch Media Resizer](./day6-image-resizer) | Resizes images and videos to web, email, Instagram, or thumbnail presets |
| 8 | [Web Scraper](./day8-web-scraper) | Scrapes all book listings from a demo site and exports them to CSV |
| 9 | [Price Tracker](./day9-price-tracker) | Monitors a site for price changes every minute and logs any movements |
| 10 | [Instagram Audit](./day10-instagram-audit) | Analyzes a CSV export of posts and surfaces engagement insights |
| 11 | [Blog Post Generator](./day11-blog-builder) | Generates complete Markdown blog posts from a topic brief using Claude |
| 12 | [Email Drafter](./day12-email-drafter) | Drafts polished professional emails from a short situation brief using Claude |
| 13 | [AI Tools Dashboard](./day13-dashboard) | Local web dashboard combining the tone rewriter, email drafter, and brief generator |

## Getting Started

Each tool has its own `README.md` with install and usage instructions. Most require Node.js 18+ and follow the same setup pattern:

```bash
cd day<N>-<tool-name>
npm install
node <script>.js
```

Tools that use Claude require an Anthropic API key:

```bash
export ANTHROPIC_API_KEY=your_key_here
```

You can get a key at [console.anthropic.com](https://console.anthropic.com).
