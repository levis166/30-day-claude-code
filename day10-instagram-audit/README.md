# Day 10 — Instagram Audit

A CLI tool that analyzes a CSV export of Instagram posts and surfaces actionable engagement insights — without any API access or third-party login required.

## What It Reports

- Average engagement rate across all posts
- Best-performing post type (photo, video, reel, etc.)
- Best day of the week to post
- Top 3 and worst 3 posts by engagement

## Install

```bash
npm install
```

## CSV Format

Your input file must be a CSV with these column headers:

| Column | Description |
|--------|-------------|
| `date` | Post date (any standard format) |
| `type` | Post type (e.g. `photo`, `video`, `reel`) |
| `likes` | Number of likes |
| `comments` | Number of comments |
| `followers` | Follower count at time of post |

## Usage

```bash
node audit.js posts.csv
```

Results are printed to the terminal. No output file is created.

## Dependencies

- [`csv-parse`](https://www.npmjs.com/package/csv-parse) — CSV parsing
