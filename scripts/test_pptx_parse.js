const JSZip = require('jszip');
const fs = require('fs');
const path = require('path');

(async () => {
  try {
    const zip = new JSZip();

    // Minimal PPTX structure for slides
    zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n</Types>`);
    zip.folder('ppt');
    zip.folder('ppt/slides');

    // Create two slides with simple <a:t> text nodes
    const slide1 = `<?xml version="1.0" encoding="UTF-8"?>\n<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">\n  <p:cSld>\n    <p:spTree>\n      <p:sp>\n        <p:txBody>\n          <a:p>\n            <a:r>\n              <a:t>Hello from slide 1</a:t>\n            </a:r>\n          </a:p>\n        </p:txBody>\n      </p:sp>\n    </p:spTree>\n  </p:cSld>\n</p:sld>`;

    const slide2 = `<?xml version="1.0" encoding="UTF-8"?>\n<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">\n  <p:cSld>\n    <p:spTree>\n      <p:sp>\n        <p:txBody>\n          <a:p>\n            <a:r>\n              <a:t>Second slide text here</a:t>\n            </a:r>\n          </a:p>\n        </p:txBody>\n      </p:sp>\n    </p:spTree>\n  </p:cSld>\n</p:sld>`;

    zip.file('ppt/slides/slide1.xml', slide1);
    zip.file('ppt/slides/slide2.xml', slide2);

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    // Now parse the buffer similar to parser implementation
    const loaded = await JSZip.loadAsync(buffer);
    const slideFiles = Object.keys(loaded.files).filter((p) =>
      p.startsWith('ppt/slides/slide') && p.endsWith('.xml')
    );

    const slideTexts = [];
    for (const slidePath of slideFiles.sort()) {
      const content = await loaded.files[slidePath].async('string');
      const matches = [...content.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/gi)];
      const slideText = matches.map((m) => m[1].replace(/\s+/g, ' ').trim()).join(' ');
      if (slideText.length > 0) slideTexts.push(slideText);
    }

    console.log('Extracted slides:', slideTexts.length);
    slideTexts.forEach((t, i) => console.log(`Slide ${i + 1}:`, t));

    // Write buffer to file for manual inspection (optional)
    fs.writeFileSync(path.resolve(process.cwd(), 'test_pptx_generated.pptx'), buffer);

    process.exit(0);
  } catch (e) {
    console.error('Error in PPTX test:', e);
    process.exit(1);
  }
})();
