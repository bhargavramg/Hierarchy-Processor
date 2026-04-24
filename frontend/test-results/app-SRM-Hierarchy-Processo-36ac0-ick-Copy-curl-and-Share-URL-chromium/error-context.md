# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> SRM Hierarchy Processor End-to-End >> Stub navigator.clipboard, click Copy curl and Share URL
- Location: tests\app.spec.js:46:7

# Error details

```
Error: expect(received).toContain(expected) // indexOf

Expected substring: "curl -X POST"
Received string:    ""
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e4]:
    - region "Notifications alt+T":
      - list:
        - listitem [ref=e5]:
          - img [ref=e7]
          - generic [ref=e11]: Copied curl command
    - banner [ref=e12]:
      - generic [ref=e13]:
        - img [ref=e14]
        - generic [ref=e18]: v1.0.0
      - heading "SRM Hierarchy Processor" [level=1] [ref=e19]
      - generic [ref=e20]:
        - link "API Docs" [ref=e21] [cursor=pointer]:
          - /url: "#"
          - text: API Docs
          - img [ref=e22]
        - button "History" [ref=e25] [cursor=pointer]:
          - img [ref=e26]
          - text: History
    - generic [ref=e30]:
      - generic [ref=e31]:
        - textbox "[ \"A->B\", \"A->C\", \"B->D\" ]" [ref=e32]:
          - /placeholder: "[\n  \"A->B\",\n  \"A->C\",\n  \"B->D\"\n]"
          - text: "[\"A->B\", \"A->C\", \"B->D\"]"
        - generic [ref=e33]:
          - button "Two trees" [ref=e34] [cursor=pointer]
          - button "With invalids & dupes" [ref=e35] [cursor=pointer]
          - button "Cycle" [ref=e36] [cursor=pointer]
          - button "Multi-parent" [ref=e37] [cursor=pointer]
        - generic [ref=e38]:
          - button "Process" [ref=e39] [cursor=pointer]:
            - img [ref=e40]
            - text: Process
          - button "Reset" [ref=e44] [cursor=pointer]
      - generic [ref=e46]:
        - heading "Utilities" [level=3] [ref=e47]:
          - img [ref=e48]
          - text: Utilities
        - generic [ref=e52]:
          - button "Copy as curl" [active] [ref=e53] [cursor=pointer]:
            - text: Copy as curl
            - img [ref=e54]
          - button "Share URL" [ref=e57] [cursor=pointer]:
            - text: Share URL
            - img [ref=e58]
  - iframe [ref=e64]:
    - generic [ref=f1e2]:
      - generic [ref=f1e3]: "Uncaught runtime errors:"
      - button "Dismiss" [ref=f1e4] [cursor=pointer]: ×
      - generic [ref=f1e6]:
        - generic [ref=f1e7]: ERROR
        - generic [ref=f1e8]: "Failed to execute 'writeText' on 'Clipboard': Write permission denied. NotAllowedError: Failed to execute 'writeText' on 'Clipboard': Write permission denied."
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | 
  3   | test.describe('SRM Hierarchy Processor End-to-End', () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     // Go to the app. We assume the dev server is running on localhost:3000
  6   |     await page.goto('http://localhost:3000/');
  7   |   });
  8   | 
  9   |   test('Load /, assert header + POST /api/bfhl link', async ({ page }) => {
  10  |     await expect(page.getByTestId('app-kicker')).toBeVisible();
  11  |     await expect(page.getByTestId('app-title')).toBeVisible();
  12  |     await expect(page.getByTestId('header-docs-link')).toBeVisible();
  13  |   });
  14  | 
  15  |   test('Click each example preset, verify textarea updates', async ({ page }) => {
  16  |     const textarea = page.getByTestId('input-textarea');
  17  |     
  18  |     await page.getByTestId('example-btn-0').click();
  19  |     expect(await textarea.inputValue()).toBe('["A->B", "A->C", "B->D"]');
  20  |     
  21  |     await page.getByTestId('example-btn-1').click();
  22  |     expect(await textarea.inputValue()).toBe('["A->B", "AB->C", "B->D", "A->B"]');
  23  |     
  24  |     await page.getByTestId('example-btn-2').click();
  25  |     expect(await textarea.inputValue()).toBe('["A->B", "B->C", "C->A"]');
  26  |     
  27  |     await page.getByTestId('example-btn-3').click();
  28  |     expect(await textarea.inputValue()).toBe('["A->B", "C->B"]');
  29  |   });
  30  | 
  31  |   test('Process and assert layout changes', async ({ page }) => {
  32  |     await page.getByTestId('example-btn-0').click();
  33  |     await page.getByTestId('submit-btn').click();
  34  |     
  35  |     await expect(page.getByTestId('summary-grid')).toBeVisible();
  36  |     await expect(page.getByTestId('stat-total-trees')).toBeVisible();
  37  |     await expect(page.getByTestId('stat-total-cycles')).toBeVisible();
  38  |     
  39  |     await expect(page.getByTestId('tab-tree')).toBeVisible();
  40  |     await expect(page.getByTestId('tab-json')).toBeVisible();
  41  |     
  42  |     await expect(page.getByTestId('invalid-card')).toBeVisible();
  43  |     await expect(page.getByTestId('duplicates-card')).toBeVisible();
  44  |   });
  45  | 
  46  |   test('Stub navigator.clipboard, click Copy curl and Share URL', async ({ page }) => {
  47  |     await page.getByTestId('example-btn-0').click();
  48  |     
  49  |     // Stub clipboard
  50  |     let clipboardText = '';
  51  |     await page.exposeFunction('setClipboardText', (text) => {
  52  |       clipboardText = text;
  53  |     });
  54  |     await page.addInitScript(() => {
  55  |       Object.assign(navigator, {
  56  |         clipboard: {
  57  |           writeText: async (text) => {
  58  |             window.setClipboardText(text);
  59  |           }
  60  |         }
  61  |       });
  62  |     });
  63  | 
  64  |     await page.getByTestId('copy-curl-btn').click();
  65  |     // Wait for the async call to propagate
  66  |     await page.waitForTimeout(100);
> 67  |     expect(clipboardText).toContain('curl -X POST');
      |                           ^ Error: expect(received).toContain(expected) // indexOf
  68  | 
  69  |     await page.getByTestId('share-url-btn').click();
  70  |     await page.waitForTimeout(100);
  71  |     expect(clipboardText).toContain('?q=');
  72  |   });
  73  | 
  74  |   test('Capture .dot download via page.expect_download()', async ({ page }) => {
  75  |     await page.getByTestId('example-btn-0').click();
  76  |     await page.getByTestId('submit-btn').click();
  77  |     
  78  |     await expect(page.getByTestId('export-dot-btn')).toBeVisible();
  79  |     
  80  |     const downloadPromise = page.waitForEvent('download');
  81  |     await page.getByTestId('export-dot-btn').click();
  82  |     const download = await downloadPromise;
  83  |     
  84  |     const path = await download.path();
  85  |     const fs = require('fs');
  86  |     const content = fs.readFileSync(path, 'utf-8');
  87  |     
  88  |     expect(content).toContain('digraph Hierarchy');
  89  |     expect(content).toContain('"A" -> "B"');
  90  |   });
  91  | 
  92  |   test('Reload /?q=<b64url> and assert hydration', async ({ page }) => {
  93  |     // Generate base64url for '["A->B"]'
  94  |     const str = '["A->B"]';
  95  |     const b64url = Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  96  |     
  97  |     await page.goto(`http://localhost:3000/?q=${b64url}`);
  98  |     
  99  |     const textarea = page.getByTestId('input-textarea');
  100 |     expect(await textarea.inputValue()).toBe('["A->B"]');
  101 |   });
  102 | 
  103 |   test('History sheet open, click item, assert restore, click Reset', async ({ page }) => {
  104 |     // Need a submission first to be in history
  105 |     await page.getByTestId('example-btn-0').click();
  106 |     await page.getByTestId('submit-btn').click();
  107 |     // wait for response
  108 |     await expect(page.getByTestId('summary-grid')).toBeVisible();
  109 | 
  110 |     await page.getByTestId('history-open-btn').click();
  111 |     await expect(page.getByTestId('history-list')).toBeVisible();
  112 |     
  113 |     // find the first item
  114 |     const firstItem = page.locator('[data-testid^="history-item-"]').first();
  115 |     await expect(firstItem).toBeVisible();
  116 |     
  117 |     await firstItem.click();
  118 |     
  119 |     // Should restore state
  120 |     const textarea = page.getByTestId('input-textarea');
  121 |     const val = await textarea.inputValue();
  122 |     expect(val).toContain('A->B');
  123 |     await expect(page.getByTestId('summary-grid')).toBeVisible();
  124 |     
  125 |     await page.getByTestId('reset-btn').click();
  126 |     const url = page.url();
  127 |     expect(url).not.toContain('?q=');
  128 |     await expect(page.getByTestId('summary-grid')).not.toBeVisible();
  129 |   });
  130 | });
  131 | 
```