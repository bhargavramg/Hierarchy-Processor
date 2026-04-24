# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: app.spec.js >> SRM Hierarchy Processor End-to-End >> History sheet open, click item, assert restore, click Reset
- Location: tests\app.spec.js:103:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator:  getByTestId('history-list')
Expected: visible
Received: hidden
Timeout:  5000ms

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByTestId('history-list')
    9 × locator resolved to <div class="space-y-4" data-testid="history-list"></div>
      - unexpected value "hidden"

```

# Page snapshot

```yaml
- generic:
  - generic:
    - generic:
      - generic:
        - region "Notifications alt+T"
        - banner:
          - generic:
            - img
            - generic: v1.0.0
          - heading [level=1]: SRM Hierarchy Processor
          - generic:
            - link:
              - /url: "#"
              - text: API Docs
              - img
            - button [expanded]:
              - img
              - text: History
            - dialog "Recent Runs" [active] [ref=e1]:
              - heading "Recent Runs" [level=2] [ref=e3]
        - generic:
          - generic:
            - textbox:
              - /placeholder: "[\n  \"A->B\",\n  \"A->C\",\n  \"B->D\"\n]"
              - text: "[\"A->B\", \"A->C\", \"B->D\"]"
            - generic:
              - button: Two trees
              - button: With invalids & dupes
              - button: Cycle
              - button: Multi-parent
            - generic:
              - button:
                - img
                - text: Process
              - button: Reset
          - generic:
            - generic:
              - heading [level=3]:
                - img
                - text: Utilities
              - generic:
                - button:
                  - text: Copy as curl
                  - img
                - button:
                  - text: Share URL
                  - img
        - generic:
          - generic:
            - generic:
              - img
              - text: john_doe_17091999
            - generic: john@xyz.com
            - generic: ROLL123
          - generic:
            - generic:
              - generic:
                - img
              - generic: "1"
              - generic: Total Trees
            - generic:
              - generic:
                - img
              - generic: "0"
              - generic: Cycles
            - generic:
              - generic:
                - img
              - generic: A
              - generic: Deepest Root
            - generic:
              - generic:
                - img
              - generic: "0"
              - generic: Duplicates
          - generic:
            - generic:
              - generic:
                - generic:
                  - generic:
                    - button: root A · depth 3
                  - button:
                    - img
                - generic:
                  - generic:
                    - tablist:
                      - tab [selected]: Tree view
                      - tab: JSON
                    - generic:
                      - tabpanel:
                        - generic:
                          - generic:
                            - generic:
                              - img
                            - generic: A
                          - generic:
                            - generic:
                              - img
                            - generic: B
                          - generic:
                            - generic: D
                          - generic:
                            - generic: C
              - generic:
                - generic:
                  - heading [level=3]: Raw Response
                  - link:
                    - /url: https://dreampuf.github.io/GraphvizOnline/
                    - text: Render .dot online
                    - img
                - generic:
                  - generic: "{ \"user_id\": \"john_doe_17091999\", \"email_id\": \"john@xyz.com\", \"college_roll_number\": \"ROLL123\", \"hierarchies\": [ { \"root\": \"A\", \"tree\": { \"B\": { \"D\": {} }, \"C\": {} }, \"depth\": 3 } ], \"invalid_entries\": [], \"duplicate_edges\": [], \"summary\": { \"total_trees\": 1, \"total_cycles\": 0, \"largest_tree_root\": \"A\" }, \"submission_id\": \"75986f0d-e3a7-4300-88f2-bcf80693c858\" }"
            - generic:
              - generic:
                - heading [level=3]:
                  - text: Invalid Entries
                  - generic: "0"
                - generic:
                  - generic: None
              - generic:
                - heading [level=3]:
                  - text: Duplicate Edges
                  - generic: "0"
                - generic:
                  - generic: None
```

# Test source

```ts
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
  67  |     expect(clipboardText).toContain('curl -X POST');
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
> 111 |     await expect(page.getByTestId('history-list')).toBeVisible();
      |                                                    ^ Error: expect(locator).toBeVisible() failed
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