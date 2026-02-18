const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// load env
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split(/\r?\n/).forEach(l => {
    const m = l.match(/^\s*([A-Z0-9_]+)=(?:"([\s\S]*)"|'([\s\S]*)'|(.*))\s*$/i);
    if (!m) return; process.env[m[1]] = m[2] || m[3] || m[4] || '';
  })
}

(async () => {
  try {
    const prisma = new PrismaClient();
    const docs = await prisma.document.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: { id: true, filename: true, status: true, chunkCount: true, pageCount: true, errorMessage: true, createdAt: true }
    });
    console.log('Latest documents:');
    docs.forEach(d => console.log(d));
    await prisma.$disconnect();
    process.exit(0);
  } catch (e) {
    console.error('DB error:', e);
    process.exit(1);
  }
})();
