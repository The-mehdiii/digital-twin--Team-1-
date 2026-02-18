const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

function loadEnv(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(?:"([\s\S]*)"|'([\s\S]*)'|(.*))\s*$/i);
    if (!m) return;
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    process.env[key] = val;
  });
}

function chunkTextSimple(text, opts = {}) {
  const DEFAULT = { chunkSize: 1000, chunkOverlap: 200, minChunkSize: 100 };
  const { chunkSize, chunkOverlap, minChunkSize } = { ...DEFAULT, ...opts };
  const chunks = [];
  if (!text || text.length === 0) return chunks;
  if (text.length <= chunkSize) return [{ content: text, index: 0 }];
  let startIndex = 0;
  let idx = 0;
  while (startIndex < text.length) {
    let endIndex = startIndex + chunkSize;
    if (endIndex >= text.length) endIndex = text.length;
    else {
      // try to break at newline or space
      const region = text.slice(Math.max(startIndex, endIndex - 200), Math.min(text.length, endIndex + 100));
      const para = region.lastIndexOf('\n\n');
      if (para > 0) endIndex = Math.max(startIndex, endIndex - 200) + para + 2;
      else {
        const nl = region.lastIndexOf('\n');
        if (nl > 0) endIndex = Math.max(startIndex, endIndex - 200) + nl + 1;
        else {
          const sp = region.lastIndexOf(' ');
          if (sp > 0) endIndex = Math.max(startIndex, endIndex - 200) + sp + 1;
        }
      }
    }
    const c = text.slice(startIndex, endIndex).trim();
    if (c.length >= minChunkSize) {
      chunks.push({ content: c, index: idx++ });
    }
    startIndex = endIndex - chunkOverlap;
    if (startIndex <= 0) startIndex = endIndex;
    if (startIndex >= text.length) break;
  }
  return chunks;
}

(async () => {
  try {
    loadEnv(path.resolve(process.cwd(), '.env.local'));
    const { Index } = require('@upstash/vector');
    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) {
      console.error('Missing UPSTASH_VECTOR_REST_URL or TOKEN in .env.local');
      process.exit(1);
    }
    const index = new Index({ url, token });

    const testFiles = ['test_document.txt', 'test_pptx_generated.pptx'];
    const insertedIds = [];

    for (const fname of testFiles) {
      const p = path.resolve(process.cwd(), fname);
      if (!fs.existsSync(p)) {
        console.log('Skipping missing', fname);
        continue;
      }

      console.log('Processing', fname);
      let text = '';
      let pageCount = undefined;

      if (fname.endsWith('.pptx')) {
        const buf = fs.readFileSync(p);
        const zip = await JSZip.loadAsync(buf);
        const slideFiles = Object.keys(zip.files).filter((k) => k.startsWith('ppt/slides/slide') && k.endsWith('.xml'));
        const slideTexts = [];
        for (const sf of slideFiles.sort()) {
          try {
            const content = await zip.files[sf].async('string');
            const matches = [...content.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi)];
            const slideText = matches.map(m => m[1].replace(/\s+/g, ' ').trim()).join(' ');
            if (slideText.length > 0) slideTexts.push(slideText);
          } catch (e) {}
        }
        text = slideTexts.join('\n\n');
        pageCount = slideTexts.length;
      } else {
        text = fs.readFileSync(p, 'utf-8');
      }

      text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
      console.log('Text length:', text.length);
      const chunks = chunkTextSimple(text);
      console.log('Chunks:', chunks.length);

      // upsert in batches
      const timestamp = Date.now();
      const vectors = chunks.map((c, i) => {
        const id = `diag-${fname.replace(/\W/g,'')}-${timestamp}-${i}`;
        insertedIds.push(id);
        return {
          id,
          data: c.content,
          metadata: {
            filename: fname,
            chunkIndex: i,
            sample: c.content.slice(0, 200),
          }
        };
      });

      const batchSize = 100;
      for (let i = 0; i < vectors.length; i += batchSize) {
        const batch = vectors.slice(i, i + batchSize);
        console.log('Upserting batch', i / batchSize + 1, 'size', batch.length);
        const res = await index.upsert(batch);
        console.log('Upsert response:', res);
      }
    }

    if (insertedIds.length === 0) {
      console.log('No vectors inserted (no test files found). Exiting.');
      process.exit(0);
    }

    // Query sample: use first inserted chunk text as query
    console.log('Running sample query...');
    const sampleQuery = 'test';
    const qres = await index.query({ data: sampleQuery, topK: 5, includeMetadata: true });
    console.log('Query results:', JSON.stringify(qres, null, 2));

    // Cleanup: delete inserted ids
    try {
      console.log('Deleting inserted vectors:', insertedIds.length);
      await index.delete(insertedIds);
      console.log('Deleted.');
    } catch (e) {
      console.warn('Failed to delete vectors:', e.message);
    }

    process.exit(0);
  } catch (e) {
    console.error('Headless diagnostic error:', e);
    process.exit(1);
  }
})();
