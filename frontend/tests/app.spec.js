import { test, expect } from '@playwright/test';

test.describe('SRM Hierarchy Processor End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the app. We assume the dev server is running on localhost:3000
    await page.goto('http://localhost:3000/');
  });

  test('Load /, assert header + POST /api/bfhl link', async ({ page }) => {
    await expect(page.getByTestId('app-kicker')).toBeVisible();
    await expect(page.getByTestId('app-title')).toBeVisible();
    await expect(page.getByTestId('header-docs-link')).toBeVisible();
  });

  test('Click each example preset, verify textarea updates', async ({ page }) => {
    const textarea = page.getByTestId('input-textarea');
    
    await page.getByTestId('example-btn-0').click();
    expect(await textarea.inputValue()).toBe('["A->B", "A->C", "B->D"]');
    
    await page.getByTestId('example-btn-1').click();
    expect(await textarea.inputValue()).toBe('["A->B", "AB->C", "B->D", "A->B"]');
    
    await page.getByTestId('example-btn-2').click();
    expect(await textarea.inputValue()).toBe('["A->B", "B->C", "C->A"]');
    
    await page.getByTestId('example-btn-3').click();
    expect(await textarea.inputValue()).toBe('["A->B", "C->B"]');
  });

  test('Process and assert layout changes', async ({ page }) => {
    await page.getByTestId('example-btn-0').click();
    await page.getByTestId('submit-btn').click();
    
    await expect(page.getByTestId('summary-grid')).toBeVisible();
    await expect(page.getByTestId('stat-total-trees')).toBeVisible();
    await expect(page.getByTestId('stat-total-cycles')).toBeVisible();
    
    await expect(page.getByTestId('tab-tree')).toBeVisible();
    await expect(page.getByTestId('tab-json')).toBeVisible();
    
    await expect(page.getByTestId('invalid-card')).toBeVisible();
    await expect(page.getByTestId('duplicates-card')).toBeVisible();
  });

  test('Stub navigator.clipboard, click Copy curl and Share URL', async ({ page }) => {
    await page.getByTestId('example-btn-0').click();
    
    // Stub clipboard
    let clipboardText = '';
    await page.exposeFunction('setClipboardText', (text) => {
      clipboardText = text;
    });
    await page.addInitScript(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: async (text) => {
            window.setClipboardText(text);
          }
        }
      });
    });

    await page.getByTestId('copy-curl-btn').click();
    // Wait for the async call to propagate
    await page.waitForTimeout(100);
    expect(clipboardText).toContain('curl -X POST');

    await page.getByTestId('share-url-btn').click();
    await page.waitForTimeout(100);
    expect(clipboardText).toContain('?q=');
  });

  test('Capture .dot download via page.expect_download()', async ({ page }) => {
    await page.getByTestId('example-btn-0').click();
    await page.getByTestId('submit-btn').click();
    
    await expect(page.getByTestId('export-dot-btn')).toBeVisible();
    
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-dot-btn').click();
    const download = await downloadPromise;
    
    const path = await download.path();
    const fs = require('fs');
    const content = fs.readFileSync(path, 'utf-8');
    
    expect(content).toContain('digraph Hierarchy');
    expect(content).toContain('"A" -> "B"');
  });

  test('Reload /?q=<b64url> and assert hydration', async ({ page }) => {
    // Generate base64url for '["A->B"]'
    const str = '["A->B"]';
    const b64url = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    
    await page.goto(`http://localhost:3000/?q=${b64url}`);
    
    const textarea = page.getByTestId('input-textarea');
    expect(await textarea.inputValue()).toBe('["A->B"]');
  });

  test('History sheet open, click item, assert restore, click Reset', async ({ page }) => {
    // Need a submission first to be in history
    await page.getByTestId('example-btn-0').click();
    await page.getByTestId('submit-btn').click();
    // wait for response
    await expect(page.getByTestId('summary-grid')).toBeVisible();

    await page.getByTestId('history-open-btn').click();
    await expect(page.getByTestId('history-list')).toBeVisible();
    
    // find the first item
    const firstItem = page.locator('[data-testid^="history-item-"]').first();
    await expect(firstItem).toBeVisible();
    
    await firstItem.click();
    
    // Should restore state
    const textarea = page.getByTestId('input-textarea');
    const val = await textarea.inputValue();
    expect(val).toContain('A->B');
    await expect(page.getByTestId('summary-grid')).toBeVisible();
    
    await page.getByTestId('reset-btn').click();
    const url = page.url();
    expect(url).not.toContain('?q=');
    await expect(page.getByTestId('summary-grid')).not.toBeVisible();
  });
});
