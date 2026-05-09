import { resolve } from 'node:path';
import { test, expect } from '@fixtures/test-fixtures';

const dataPath = (name: string): string => resolve(process.cwd(), 'test-data', name);

test.describe('File upload', () => {
  test.beforeEach(async ({ fileUploadPage }) => {
    await fileUploadPage.goto();
  });

  test('uploads a text file successfully', {
    tag: ['@smoke', '@critical'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.upload(dataPath('sample.txt'));
    await fileUploadPage.expectUploadSuccess('sample.txt');
  });

  test('uploads a PDF file successfully', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.upload(dataPath('sample.pdf'));
    await fileUploadPage.expectUploadSuccess('sample.pdf');
  });

  test('uploads a large (~5MB) binary file successfully', {
    tag: ['@critical'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.upload(dataPath('large-file.bin'));
    await fileUploadPage.expectUploadSuccess('large-file.bin');
  });

  test('exposes the uploaded filename verbatim in the success response', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.upload(dataPath('sample.txt'));
    expect(await fileUploadPage.getUploadedFilename()).toBe('sample.txt');
  });

  /**
   * Site bug: clicking submit without selecting a file still renders the success
   * banner with an empty filename ("You have successfully uploaded \"\""). This test
   * documents that bug — the filename in the response should be empty, proving the
   * site does not validate before showing success.
   */
  test('site bug: submit with no file shows success with empty filename', {
    tag: ['@regression'],
  }, async ({ fileUploadPage }) => {
    await fileUploadPage.submit();
    expect(await fileUploadPage.isResponseVisible()).toBe(true);
    expect(await fileUploadPage.getUploadedFilename()).toBe('');
  });
});
