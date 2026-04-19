# Day 3 — File Renamer

A Node.js script that renames JPG files in the current directory to a clean, sequential naming convention: `bowermans-product-001.jpg`, `bowermans-product-002.jpg`, and so on.

It skips files already matching the pattern and fills in gaps in the sequence, so it's safe to run multiple times.

## Install

No dependencies required — uses Node.js built-ins only.

```bash
node --version  # requires Node.js 14+
```

## Usage

Place the script in the folder containing your JPG files and run:

```bash
node rename.js
```

The script will print each rename operation to the console:

```
IMG_4821.jpg → bowermans-product-001.jpg
IMG_4822.jpg → bowermans-product-002.jpg
```

Files already named correctly are left untouched.
