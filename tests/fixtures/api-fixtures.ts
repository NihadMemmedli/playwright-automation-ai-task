import { test as base } from '@playwright/test';
import { ApiClient } from '../../src/api/api-client';

interface ApiFixtures {
  apiClient: ApiClient;
}

const BASE_URL = process.env.BASE_URL ?? 'https://qa-practice.netlify.app';

export const test = base.extend<ApiFixtures>({
  apiClient: async ({ request }, use) => {
    await use(new ApiClient(request, BASE_URL));
  },
});

export { expect } from '@playwright/test';
