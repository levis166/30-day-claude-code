import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { createInterface } from "readline";
import { promises as fs } from "fs";
import path from "path";

ffmpeg.setFfmpegPath(ffmpegPath);

const PRESETS = {
  1: { name: "Web",       width: 1920, height: null, fit: "inside" },
  2: { name: "Email",     width: 600,  height: null, fit: "inside" },
  3: { name: "Instagram", width: 1080, height: 1080, fit: "cover"  },
  4: { name: "Thumbnail", width: 300,  height: null, fit: "inside" },
};

const IMAGE_EXTS = /\.(jpg|jpeg|png)$/i;
const VIDEO_EXTS = /\.(mp4|mov|avi|mkv|webm|m4v)$/i;

// ── Image resize (sharp) ────────────────────────────────────────────────────

async function resizeImage(inputPath, outputPath, preset) {
  const opts = { width: preset.width, fit: preset.fit };
  if (preset.height) opts.height = preset.height;
  await sharp(inputPath).resize(opts).toFile(outputPath);
}

// ── Video resize (ffmpeg) ───────────────────────────────────────────────────

function videoScaleFilter(preset) {
  if (preset.height) {
    // Square crop: scale up so shortest side >= target, then centre-crop
    return (
      `scale=${preset.width}:${preset.height}:force_original_aspect_ratio=increase,` +
      `crop=${preset.width}:${preset.height}`
    );
  }
  // Width-only: scale down, keep aspect, ensure even dimensions for codecs
  return `scale=${preset.width}:-2`;
}

function resizeVideo(inputPath, outputPath, preset) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .videoFilter(videoScaleFilter(preset))
      .outputOptions([
        "-c:v libx264",   // widely compatible codec
        "-crf 23",        // quality (lower = better, 23 is default)
        "-preset fast",
        "-c:a copy",      // pass audio through untouched
      ])
      .on("end", resolve)
      .on("error", reject)
      .save(outputPath);
  });
}

// ── CLI helpers ─────────────────────────────────────────────────────────────

function makeReadline() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((resolve) => rl.question(q, resolve));
  return { rl, ask };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Batch Media Resizer (images + video) ===\n");

  const [argFolder, argPreset] = process.argv.slice(2);
  let folderPath, choice;

  if (argFolder && argPreset) {
    folderPath = argFolder;
    choice = argPreset;
    console.log(`Folder : ${folderPath}`);
    console.log(`Preset : ${choice}\n`);
  } else {
    const { rl, ask } = makeReadline();

    folderPath = (await ask("Enter folder path containing media: ")).trim();

    console.log("\nChoose a preset size:");
    for (const [key, p] of Object.entries(PRESETS)) {
      const dims = p.height ? `${p.width}x${p.height}px square` : `${p.width}px wide`;
      console.log(`  ${key}. ${p.name} (${dims})`);
    }

    choice = (await ask("\nEnter choice (1-4): ")).trim();
    rl.close();
  }

  const preset = PRESETS[choice];
  if (!preset) {
    console.error(`Invalid choice "${choice}". Must be 1–4.`);
    process.exit(1);
  }

  let files;
  try {
    files = await fs.readdir(folderPath);
  } catch {
    console.error(`Error: Cannot read folder "${folderPath}"`);
    process.exit(1);
  }

  const images = files.filter((f) => IMAGE_EXTS.test(f));
  const videos = files.filter((f) => VIDEO_EXTS.test(f));
  const total  = images.length + videos.length;

  if (total === 0) {
    console.log("No supported image or video files found.");
    return;
  }

  console.log(`Found ${images.length} image(s) and ${videos.length} video(s).\n`);

  const outputDir = path.join(folderPath, "resized");
  await fs.mkdir(outputDir, { recursive: true });

  console.log(`Resizing to ${preset.name} preset...\n`);

  let success = 0;
  let failed  = 0;

  // Images
  for (const file of images) {
    const inputPath  = path.join(folderPath, file);
    const outputPath = path.join(outputDir, file);
    try {
      await resizeImage(inputPath, outputPath, preset);
      console.log(`  ✓ [image] ${file}`);
      success++;
    } catch (err) {
      console.error(`  ✗ [image] ${file}: ${err.message}`);
      failed++;
    }
  }

  // Videos
  for (const file of videos) {
    const inputPath  = path.join(folderPath, file);
    // Always output as .mp4 for broad compatibility
    const outName    = path.parse(file).name + ".mp4";
    const outputPath = path.join(outputDir, outName);
    try {
      process.stdout.write(`  … [video] ${file}`);
      await resizeVideo(inputPath, outputPath, preset);
      process.stdout.write(`  ✓\n`);
      success++;
    } catch (err) {
      process.stdout.write(`  ✗\n`);
      console.error(`         ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone. ${success} succeeded, ${failed} failed.`);
  console.log(`Output folder: ${outputDir}`);
}

main();
