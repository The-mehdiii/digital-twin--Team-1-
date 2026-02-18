const fs = require('fs');
const path = require('path');

function loadEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  content.split(/\r?\n/).forEach((line) => {
    const m = line.match(/^\s*([A-Z0-9_]+)=(?:"([\s\S]*)"|'([\s\S]*)'|(.*))\s*$/i);
    if (!m) return;
    const key = m[1];
    const val = m[2] ?? m[3] ?? m[4] ?? '';
    process.env[key] = val;
  });
}

(async () => {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) loadEnv(envPath);

    const { Index } = require('@upstash/vector');

    const url = process.env.UPSTASH_VECTOR_REST_URL;
    const token = process.env.UPSTASH_VECTOR_REST_TOKEN;
    if (!url || !token) {
      console.error('UPSTASH_VECTOR_REST_URL or TOKEN missing in .env.local');
      process.exit(1);
    }

    const index = new Index({ url, token });

    const id = `test-vector-${Date.now()}`;
    const batch = [
      {
        id,
        data: 'This is a test vector created by local test script.',
        metadata: {
          documentId: 'test-doc',
          chunkId: id,
          chunkIndex: 0,
          content: 'This is a test vector created by local test script.',
          filename: 'test_document.txt',
          userId: 'user-test',
        },
      },
    ];

    console.log('Upserting vector...');
    const upsertRes = await index.upsert(batch);
    console.log('Upsert response:', upsertRes);

    console.log('Querying vector index for "test vector"...');
    const queryRes = await index.query({
      data: 'test vector',
      topK: 3,
      includeMetadata: true,
    });

    console.log('Query results:', JSON.stringify(queryRes, null, 2));

    // Optionally delete the test vector
    try {
      await index.delete([id]);
      console.log('Deleted test vector', id);
    } catch (e) {
      console.warn('Could not delete test vector:', e.message);
    }

    process.exit(0);
  } catch (e) {
    console.error('Error during Upstash test:', e);
    process.exit(1);
  }
})();
