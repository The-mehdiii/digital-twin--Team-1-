const fs = require('fs');
const path = require('path');

function cleanText(text) {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+/g, " ")
    .split('\n')
    .map(line => line.trim())
    .join('\n')
    .trim();
}

(async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'test_document.txt');
    const buf = fs.readFileSync(filePath);
    const text = cleanText(buf.toString('utf-8'));
    const words = text.split(/\s+/).filter(w => w.length > 0);
    console.log('--- Extracted Text ---');
    console.log(text);
    console.log('--- Stats ---');
    console.log('chars:', text.length);
    console.log('words:', words.length);
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
