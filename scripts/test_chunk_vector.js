const fs = require('fs');
const path = require('path');

const DEFAULT_OPTIONS = {
  chunkSize: 1000,
  chunkOverlap: 200,
  minChunkSize: 100,
};

function findBreakPoint(text, start, target) {
  const searchStart = Math.max(start, target - 200);
  const searchEnd = Math.min(text.length, target + 100);
  const searchRegion = text.slice(searchStart, searchEnd);

  const paragraphBreak = searchRegion.lastIndexOf('\n\n');
  if (paragraphBreak > 0) return searchStart + paragraphBreak + 2;

  const newline = searchRegion.lastIndexOf('\n');
  if (newline > 0) return searchStart + newline + 1;

  const sentenceMatch = searchRegion.match(/[.!?]['"']?\s+/g);
  if (sentenceMatch) {
    const lastSentenceEnd = searchRegion.lastIndexOf(sentenceMatch[sentenceMatch.length - 1]);
    if (lastSentenceEnd > 0) return searchStart + lastSentenceEnd + sentenceMatch[sentenceMatch.length - 1].length;
  }

  const punctuation = searchRegion.lastIndexOf(', ');
  if (punctuation > 0) return searchStart + punctuation + 2;

  const space = searchRegion.lastIndexOf(' ');
  if (space > 0) return searchStart + space + 1;

  return target;
}

function chunkText(text, options = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks = [];
  if (!text || text.length === 0) return chunks;
  if (text.length <= opts.chunkSize) {
    return [{ content: text, index: 0, startChar: 0, endChar: text.length }];
  }
  let startIndex = 0;
  let chunkIndex = 0;
  while (startIndex < text.length) {
    let endIndex = startIndex + opts.chunkSize;
    if (endIndex >= text.length) endIndex = text.length;
    else endIndex = findBreakPoint(text, startIndex, endIndex);
    const chunkContent = text.slice(startIndex, endIndex).trim();
    if (chunkContent.length >= opts.minChunkSize) {
      chunks.push({ content: chunkContent, index: chunkIndex, startChar: startIndex, endChar: endIndex });
      chunkIndex++;
    }
    startIndex = endIndex - opts.chunkOverlap;
    if (startIndex <= chunks[chunks.length - 1]?.startChar) startIndex = endIndex;
    if (startIndex >= text.length) break;
  }
  return chunks;
}

(async () => {
  try {
    const filePath = path.resolve(process.cwd(), 'test_document.txt');
    const text = fs.readFileSync(filePath, 'utf-8');
    const chunks = chunkText(text);
    console.log('chunks count:', chunks.length);
    chunks.forEach((c, i) => {
      console.log('--- chunk', i, '---');
      console.log('start', c.startChar, 'end', c.endChar);
      console.log(c.content);
    });

    // Simulate vector payloads
    const vectors = chunks.map((c, i) => ({
      id: `doc-test-chunk-${i}`,
      data: c.content,
      metadata: {
        documentId: 'doc-test',
        chunkId: `doc-test-chunk-${i}`,
        chunkIndex: i,
        content: c.content.slice(0, 500),
        filename: 'test_document.txt',
        userId: 'user-test',
      }
    }));

    console.log('--- simulated vectors to upsert ---');
    console.log(JSON.stringify(vectors, null, 2));

    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
