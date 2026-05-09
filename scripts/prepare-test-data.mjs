#!/usr/bin/env node
/**
 * Generates fixtures used by file-upload tests:
 *   test-data/sample.txt    — small ASCII file
 *   test-data/sample.pdf    — minimal valid 1-page PDF
 *   test-data/large-file.bin — ~5 MB binary blob
 *
 * Idempotent: skips files that already exist with the right size.
 */
import { existsSync, mkdirSync, statSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomBytes } from 'node:crypto';

const DATA_DIR = resolve(process.cwd(), 'test-data');
mkdirSync(DATA_DIR, { recursive: true });

const TXT = resolve(DATA_DIR, 'sample.txt');
const PDF = resolve(DATA_DIR, 'sample.pdf');
const LARGE = resolve(DATA_DIR, 'large-file.bin');
const LARGE_SIZE = 5 * 1024 * 1024; // 5 MB

if (!existsSync(TXT)) {
  writeFileSync(
    TXT,
    'QA Automation Code Challenge 2026 — sample upload payload.\nLine 2.\n',
    'utf-8',
  );
  console.log(`created ${TXT}`);
}

if (!existsSync(PDF)) {
  // Minimal but valid 1-page PDF (handcrafted, ~700 bytes)
  const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 55 >>
stream
BT /F1 24 Tf 100 700 Td (QA Challenge sample PDF) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000010 00000 n
0000000058 00000 n
0000000109 00000 n
0000000214 00000 n
0000000316 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
382
%%EOF
`;
  writeFileSync(PDF, pdf, 'binary');
  console.log(`created ${PDF}`);
}

if (!existsSync(LARGE) || statSync(LARGE).size !== LARGE_SIZE) {
  writeFileSync(LARGE, randomBytes(LARGE_SIZE));
  console.log(`created ${LARGE} (${(LARGE_SIZE / 1024 / 1024).toFixed(1)} MB)`);
}
