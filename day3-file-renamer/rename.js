const fs = require('fs');
const path = require('path');

const PREFIX = 'bowermans-product';
const PATTERN = new RegExp(`^${PREFIX}-(\\d{3})\\.jpg$`);

const dir = process.cwd();
const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.jpg'));

const alreadyNamed = new Set(files.filter(f => PATTERN.test(f)));
const toRename = files.filter(f => !PATTERN.test(f));

if (toRename.length === 0) {
  console.log('No files to rename.');
  process.exit(0);
}

const usedNumbers = new Set(
  [...alreadyNamed].map(f => parseInt(PATTERN.exec(f)[1], 10))
);

let counter = 1;
const getNext = () => {
  while (usedNumbers.has(counter)) counter++;
  const n = counter++;
  usedNumbers.add(n);
  return n;
};

for (const file of toRename) {
  const num = String(getNext()).padStart(3, '0');
  const newName = `${PREFIX}-${num}.jpg`;
  fs.renameSync(path.join(dir, file), path.join(dir, newName));
  console.log(`${file} → ${newName}`);
}
