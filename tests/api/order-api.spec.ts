import { resolve } from 'node:path';
import { test, expect } from '../fixtures/api-fixtures';
import { test as uiTest } from '../fixtures/test-fixtures';

const dataPath = (name: string): string => resolve(process.cwd(), 'test-data', name);

test.describe('Order & upload — API & network layer', () => {
  test('file-upload endpoint is reachable', {
    tag: ['@api'],
  }, async ({ apiClient }) => {
    const res = await apiClient.getFileUploadPage();
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body.toLowerCase()).toContain('upload');
  });

  test('direct multipart POST to /file-upload does not 5xx', {
    tag: ['@api'],
  }, async ({ apiClient }) => {
    const res = await apiClient.postFileUpload({
      filename: 'sample.txt',
      contents: 'hello-from-api-test\n',
      mimeType: 'text/plain',
    });
    // Static host may 405 / 404 on POST. Contract: never 5xx, and any response
    // must include a usable status text we can record in CI artifacts.
    expect(res.status(), `unexpected 5xx; got ${res.status()}`).toBeLessThan(500);
    expect(typeof res.statusText()).toBe('string');
  });
});

uiTest.describe('Order — captured submission traffic', () => {
  uiTest('submitting an order issues network calls or a console signal', {
    tag: ['@api'],
  }, async ({ page, loginPage, shopPage, checkoutPage }) => {
    const submitTraffic: { method: string; url: string; postData: string | null }[] = [];
    const consoleMessages: string[] = [];

    page.on('request', (req) => {
      // Capture only requests fired after the user clicks "Submit Order" — the
      // shop page issues no traffic up to that point on the static demo site.
      if (req.method() !== 'GET') {
        submitTraffic.push({ method: req.method(), url: req.url(), postData: req.postData() });
      }
    });
    page.on('console', (msg) => consoleMessages.push(msg.text()));

    await loginPage.goto();
    await loginPage.loginWithValidCredentials();
    await shopPage.addProductToCart(0);
    await shopPage.addProductToCart(1);
    await shopPage.proceedToCheckout();
    await checkoutPage.fillShippingDetails({
      phone: '15551234567',
      street: '221B Baker Street',
      city: 'London',
      country: 'United Kingdom',
    });

    const { orderConsoleSeen } = await checkoutPage.submitOrder();

    // The site signals success either via a network POST OR via a console log.
    // Document whichever channel fires; both being silent would be a regression.
    const hasSignal = orderConsoleSeen || submitTraffic.length > 0;
    expect(hasSignal, `expected order signal; traffic=${submitTraffic.length}, consoleSeen=${orderConsoleSeen}, console=${consoleMessages.slice(0, 10).join('|')}`).toBe(true);
  });

  uiTest('upload via UI reflects the uploaded filename in the response', {
    tag: ['@api'],
  }, async ({ fileUploadPage }) => {
    const networkErrors: string[] = [];
    fileUploadPage['page'].on('response', (res) => {
      if (res.status() >= 500) {
        networkErrors.push(`${res.status()} ${res.url()}`);
      }
    });

    await fileUploadPage.goto();
    await fileUploadPage.upload(dataPath('sample.txt'));
    await fileUploadPage.expectUploadSuccess('sample.txt');

    expect(networkErrors, `no 5xx errors during upload; saw: ${networkErrors.join(', ')}`).toEqual([]);
  });
});
