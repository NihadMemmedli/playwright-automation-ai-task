import { test, expect } from '@fixtures/test-fixtures';

/**
 * Lightweight security smoke checks. These are NOT a substitute for a
 * real DAST scan or a pen-test — they sanity-check that obvious injection
 * payloads are treated as text by the SPA's form handlers and don't leak
 * extra info via error messages.
 */
test.describe('Security — smoke checks', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('XSS payload in email field is treated as plain text', {
    tag: ['@security', '@regression'],
  }, async ({ page, loginPage }) => {
    let alertSeen = false;
    page.on('dialog', async (dialog) => {
      alertSeen = true;
      await dialog.dismiss();
    });

    const xss = '<script>window.__xss__=1;</script>';
    await loginPage.login(xss, 'admin123');
    // Same Bad Credentials path as any other invalid email — no script ran.
    await loginPage.expectBadCredentialsError();

    expect(alertSeen, 'no JS dialog should have fired from the payload').toBe(false);
    const xssMarker = await page.evaluate(() => (window as unknown as { __xss__?: number }).__xss__);
    expect(xssMarker, 'no global state mutation from injected script').toBeUndefined();
  });

  test('SQL-style injection in password field returns the same generic error', {
    tag: ['@security', '@regression'],
  }, async ({ loginPage }) => {
    await loginPage.login('admin@admin.com', "' OR 1=1 --");
    await loginPage.expectBadCredentialsError();
    // The site MUST NOT reveal whether the email exists, the password format
    // matched, etc. Generic "bad credentials" for any failure mode.
    const reflectedHtml = await loginPage['page'].content();
    expect(reflectedHtml.toLowerCase()).not.toContain("' or 1=1 --");
  });

  test('login form does not reflect the typed email back into the DOM as HTML', {
    tag: ['@security', '@regression'],
  }, async ({ page, loginPage }) => {
    const sentinel = '<b id="reflect-sentinel">x</b>';
    await loginPage.login(sentinel, 'pw');
    await loginPage.expectBadCredentialsError();
    await expect(page.locator('#reflect-sentinel')).toHaveCount(0);
  });
});
