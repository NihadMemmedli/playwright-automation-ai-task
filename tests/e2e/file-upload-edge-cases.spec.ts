import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { test, expect } from '@fixtures/test-fixtures';

const dataPath = (name: string): string => resolve(process.cwd(), 'test-data', name);

const writeTempFile = (filename: string, contents: string | Buffer): string => {
  const dir = mkdtempSync(join(tmpdir(), 'pw-upload-'));
  const path = join(dir, filename);
  writeFileSync(path, contents);
  return path;
};

test.describe('File upload — edge cases', () => {
  test.beforeEach(async ({ fileUploadPage }) => {
    await fileUploadPage.goto();
  });

  test('uploads a file with a very long (200+ char) filename', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    const longName = `${'a'.repeat(220)}.txt`;
    const path = writeTempFile(longName, 'long-name payload\n');

    await fileUploadPage.upload(path);
    expect(await fileUploadPage.isResponseVisible()).toBe(true);

    const reportedName = await fileUploadPage.getUploadedFilename();
    expect(reportedName, 'site echoes the long filename verbatim').toBe(longName);
  });

  test('uploads a filename with unicode + special characters', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    const trickyName = "résumé — 中文 'O'Brien' (v2).txt";
    const path = writeTempFile(trickyName, 'unicode payload\n');

    await fileUploadPage.upload(path);
    expect(await fileUploadPage.isResponseVisible()).toBe(true);

    const reportedName = await fileUploadPage.getUploadedFilename();
    expect(reportedName).toBe(trickyName);
  });

  test('uploads a zero-byte file', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    const path = writeTempFile('empty-file.txt', '');

    await fileUploadPage.upload(path);
    expect(await fileUploadPage.isResponseVisible()).toBe(true);
    expect(await fileUploadPage.getUploadedFilename()).toBe('empty-file.txt');
  });

  test('selecting a second file replaces the first before submit', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.selectFile(dataPath('sample.txt'));
    await fileUploadPage.selectFile(dataPath('sample.pdf'));
    await fileUploadPage.submit();
    await fileUploadPage.expectUploadSuccess('sample.pdf');
  });
});
