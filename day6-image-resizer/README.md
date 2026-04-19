# Day 6 — Batch Media Resizer

A CLI tool that batch-resizes images (JPG, PNG) and videos (MP4, MOV, AVI, MKV, WebM) to one of four preset sizes. Processed files are written to a `resized/` subfolder — originals are never overwritten.

## Presets

| # | Name | Dimensions |
|---|------|-----------|
| 1 | Web | 1920px wide |
| 2 | Email | 600px wide |
| 3 | Instagram | 1080×1080px (square crop) |
| 4 | Thumbnail | 300px wide |

## Install

```bash
npm install
```

> **Note:** `sharp` and `ffmpeg-static` include native binaries. Install may take a moment.

## Usage

**Interactive mode** (prompts for folder path and preset):

```bash
node resize.js
```

**Argument mode** (non-interactive, useful for automation):

```bash
node resize.js /path/to/media 3
```

Resized files are saved to `/path/to/media/resized/`. Videos are re-encoded as `.mp4` using H.264 for broad compatibility.

## Dependencies

- [`sharp`](https://www.npmjs.com/package/sharp) — image processing
- [`fluent-ffmpeg`](https://www.npmjs.com/package/fluent-ffmpeg) — video processing
- [`ffmpeg-static`](https://www.npmjs.com/package/ffmpeg-static) — bundled ffmpeg binary
