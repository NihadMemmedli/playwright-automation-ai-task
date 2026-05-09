import { test as base } from '@playwright/test';
import { CheckoutPage, FileUploadPage, LoginPage, ShopPage } from '@pages/index';
import { healingBudget } from '@healing/index';

interface PageObjects {
  loginPage: LoginPage;
  shopPage: ShopPage;
  checkoutPage: CheckoutPage;
  fileUploadPage: FileUploadPage;
}

export const test = base.extend<PageObjects>({
  loginPage: async ({ page }, use) => {
    healingBudget.resetForTest();
    await use(new LoginPage(page));
  },
  shopPage: async ({ page }, use) => {
    await use(new ShopPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  fileUploadPage: async ({ page }, use) => {
    await use(new FileUploadPage(page));
  },
});

export { expect } from '@playwright/test';
