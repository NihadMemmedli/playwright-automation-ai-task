import type { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class FileUploadPage extends BasePage {
  readonly path = '/file-upload';

  constructor(page: Page) {
    super(page);
  }

  // The file input and response box have no labels / roles / aria-live on the live
  // page (a separate a11y issue, out of locator scope). Their IDs are the only stable
  // anchor and don't look auto-generated. Submit button uses role+name.
  private get fileInput()    { return this.$('file upload input',  '#file_upload'); }
  private get submitButton() { return this.$('upload submit button','role=button[name="Submit"]'); }
  private get responseBox()  { return this.$('upload response box','#file_upload_response'); }

  async selectFile(absolutePath: string): Promise<void> {
    await this.fileInput.setInputFiles(absolutePath);
  }

  async submit(): Promise<void> {
    // Mobile-viewport quirk: this Bootstrap button sits partially off-screen on
    // Pixel 5 (393px wide; button extends to x=444). Even after scrollIntoView,
    // Playwright's actionability check is unreliable on this site/viewport combo —
    // the click works (verified via dispatchEvent in 20ms), but auto-wait times out.
    // Scroll first, then force-click. The form submission semantics are unaffected.
    await this.submitButton.scrollIntoViewIfNeeded();
    await this.submitButton.click({ force: true });
  }

  async upload(absolutePath: string): Promise<void> {
    await this.selectFile(absolutePath);
    await this.submit();
  }

  async expectUploadSuccess(filename: string): Promise<void> {
    await this.responseBox.expectVisible();
    await this.responseBox.expectText(`successfully uploaded "${filename}"`);
  }

  async getResponseText(): Promise<string> {
    return (await this.responseBox.textContent()) ?? '';
  }

  async isResponseVisible(): Promise<boolean> {
    return this.responseBox.isVisible();
  }

  /** Extracts the filename embedded in the success message: `... uploaded "<filename>"`. */
  async getUploadedFilename(): Promise<string | null> {
    const text = await this.getResponseText();
    const match = text.match(/uploaded\s+"([^"]*)"/i);
    return match ? match[1] : null;
  }
}
