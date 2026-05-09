import type { APIRequestContext, APIResponse } from '@playwright/test';
import { createLogger } from '@utils/logger';

const log = createLogger('api-client');

export interface LoginPayload {
  email: string;
  password: string;
}

export interface FileUploadPayload {
  filename: string;
  contents: Buffer | string;
  mimeType?: string;
}

/**
 * Thin wrapper over Playwright's APIRequestContext for direct HTTP calls.
 *
 * The qa-practice.netlify.app target is largely client-rendered — auth state is
 * computed in the browser, not via a backend session — so the methods below are
 * deliberately tolerant: they return raw responses for the test to assert on,
 * rather than baking in any single shape. When the live site has no
 * corresponding endpoint, the response status reflects that (typically 404 or
 * 405) and the test can document the all-client-side behavior.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseURL: string,
  ) {}

  url(path: string): string {
    const trimmedBase = this.baseURL.replace(/\/+$/, '');
    const trimmedPath = path.startsWith('/') ? path : `/${path}`;
    return `${trimmedBase}${trimmedPath}`;
  }

  async getAuthEcommercePage(): Promise<APIResponse> {
    log.debug('GET /auth_ecommerce');
    return this.request.get(this.url('/auth_ecommerce'));
  }

  async getFileUploadPage(): Promise<APIResponse> {
    log.debug('GET /file-upload');
    return this.request.get(this.url('/file-upload'));
  }

  async postLogin(payload: LoginPayload, path: string = '/auth_ecommerce'): Promise<APIResponse> {
    log.debug('POST login', { path, email: payload.email });
    return this.request.post(this.url(path), {
      form: { email: payload.email, password: payload.password },
      failOnStatusCode: false,
    });
  }

  async postFileUpload(payload: FileUploadPayload, path: string = '/file-upload'): Promise<APIResponse> {
    log.debug('POST file-upload', { filename: payload.filename, size: payload.contents.length });
    return this.request.post(this.url(path), {
      multipart: {
        file_upload: {
          name: payload.filename,
          mimeType: payload.mimeType ?? 'application/octet-stream',
          buffer: typeof payload.contents === 'string' ? Buffer.from(payload.contents) : payload.contents,
        },
      },
      failOnStatusCode: false,
    });
  }
}
