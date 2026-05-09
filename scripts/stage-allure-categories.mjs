#!/usr/bin/env node
// Copies allure/categories.json into allure-results/ so `allure generate`
// picks it up. Allure resolves categories from the results dir alongside
// per-test JSON, so this needs to land before report generation. Idempotent.
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';

const SRC = resolve(process.cwd(), 'allure', 'categories.json');
const DEST_DIR = resolve(process.cwd(), 'allure-results');
const DEST = resolve(DEST_DIR, 'categories.json');

if (!existsSync(SRC)) {
  console.error(`source not found: ${SRC}`);
  process.exit(1);
}

mkdirSync(DEST_DIR, { recursive: true });
copyFileSync(SRC, DEST);
console.log(`staged ${SRC} -> ${DEST}`);
