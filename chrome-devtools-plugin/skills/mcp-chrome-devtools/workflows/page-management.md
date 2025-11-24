# Page Management Workflows

Browser window and tab operations for managing multiple pages and navigation.

## Tools in This Group

### new_page
Creates a new browser page (tab).

**Required:** `--url URL`
**Optional:** `--timeout MILLISECONDS`

```bash
node scripts/new_page.js --url https://example.com --timeout 30000
```

### list_pages
Lists all open pages with their indices and URLs.

```bash
node scripts/list_pages.js
```

**Output Example:**
```
Page 0: https://example.com (selected)
Page 1: https://google.com
Page 2: https://github.com
```

### select_page
Switches the active context to a specific page by index.

**Required:** `--pageIdx INDEX`

```bash
node scripts/select_page.js --pageIdx 1
```

### navigate_page
Navigates the currently selected page to a new URL.

**Optional:** `--url URL`, `--type [navigate|reload|back|forward]`, `--ignoreCache [true|false]`, `--timeout MILLISECONDS`

```bash
# Navigate to URL
node scripts/navigate_page.js --url https://example.com/page2

# Reload page
node scripts/navigate_page.js --type reload --ignoreCache true

# Go back
node scripts/navigate_page.js --type back
```

### resize_page
Resizes the browser window to specific dimensions.

**Required:** `--width WIDTH --height HEIGHT`

```bash
node scripts/resize_page.js --width 1920 --height 1080
```

### close_page
Closes a page by its index. Cannot close the last remaining page.

**Required:** `--pageIdx INDEX`

```bash
node scripts/close_page.js --pageIdx 2
```

## Workflows

### Workflow: Open Multiple Research Tabs

Open several pages for research or comparison:

- [ ] List current pages: `node scripts/list_pages.js`
- [ ] Open first article: `node scripts/new_page.js --url https://example.com/article1`
- [ ] Open second article: `node scripts/new_page.js --url https://example.com/article2`
- [ ] Open third article: `node scripts/new_page.js --url https://example.com/article3`
- [ ] Verify all open: `node scripts/list_pages.js`

**Expected Output:**
Multiple tabs open, each with different content, ready for analysis.

### Workflow: Navigate Through Site Pages

Walk through a multi-page flow:

- [ ] Start at homepage: `node scripts/new_page.js --url https://example.com`
- [ ] Take initial snapshot: `node scripts/take_snapshot.js`
- [ ] Click "About" link: `node scripts/click.js --uid link_about_xyz`
- [ ] Wait for page load: `node scripts/wait_for.js --text "About Us" --timeout 5000`
- [ ] Go back: `node scripts/navigate_page.js --type back`
- [ ] Verify homepage: `node scripts/wait_for.js --text "Welcome" --timeout 5000`
- [ ] Go forward: `node scripts/navigate_page.js --type forward`

**Expected Output:**
Browser navigates through pages, back/forward works correctly.

### Workflow: Multi-Tab Data Extraction

Extract data from multiple pages simultaneously:

- [ ] Open page 1: `node scripts/new_page.js --url https://example.com/data/item1`
- [ ] Take snapshot 1: `node scripts/take_snapshot.js --filePath item1.txt`
- [ ] Open page 2: `node scripts/new_page.js --url https://example.com/data/item2`
- [ ] Take snapshot 2: `node scripts/take_snapshot.js --filePath item2.txt`
- [ ] Open page 3: `node scripts/new_page.js --url https://example.com/data/item3`
- [ ] Take snapshot 3: `node scripts/take_snapshot.js --filePath item3.txt`
- [ ] Switch to page 0: `node scripts/select_page.js --pageIdx 0`
- [ ] Extract from page 0: `node scripts/evaluate_script.js --function "() => document.querySelector('.price').textContent"`
- [ ] Switch to page 1: `node scripts/select_page.js --pageIdx 1`
- [ ] Extract from page 1: `node scripts/evaluate_script.js --function "() => document.querySelector('.price').textContent"`

**Expected Output:**
Data extracted from multiple pages, context switching successful.

### Workflow: Responsive Design Testing

Test page at different viewport sizes:

- [ ] Open test page: `node scripts/new_page.js --url https://example.com`
- [ ] Desktop view: `node scripts/resize_page.js --width 1920 --height 1080`
- [ ] Take desktop screenshot: `node scripts/take_screenshot.js --fullPage true --filePath desktop.png`
- [ ] Tablet view: `node scripts/resize_page.js --width 768 --height 1024`
- [ ] Take tablet screenshot: `node scripts/take_screenshot.js --fullPage true --filePath tablet.png`
- [ ] Mobile view: `node scripts/resize_page.js --width 375 --height 667`
- [ ] Take mobile screenshot: `node scripts/take_screenshot.js --fullPage true --filePath mobile.png`

**Expected Output:**
Screenshots captured at different viewport sizes for comparison.

### Workflow: Clean Up Tabs

Close unnecessary tabs while keeping important ones:

- [ ] List all pages: `node scripts/list_pages.js`
- [ ] Identify indices to close (e.g., pages 2, 3, 4)
- [ ] Close page 4: `node scripts/close_page.js --pageIdx 4`
- [ ] Close page 3: `node scripts/close_page.js --pageIdx 3`
- [ ] Close page 2: `node scripts/close_page.js --pageIdx 2`
- [ ] Verify remaining: `node scripts/list_pages.js`
- [ ] Switch to desired page: `node scripts/select_page.js --pageIdx 0`

**Note:** Close tabs in reverse order (highest index first) to avoid index shifting issues.

**Expected Output:**
Unwanted tabs closed, important tabs remain active.

## Common Patterns

### Pattern: Safe Page Closing

Always list pages before closing to avoid errors:

```bash
# 1. Check what's open
node scripts/list_pages.js

# 2. Close specific page (use actual index from list)
node scripts/close_page.js --pageIdx 2

# 3. Verify closure
node scripts/list_pages.js
```

### Pattern: Page Context Switching

When working with multiple pages, always select before interacting:

```bash
# 1. List to see indices
node scripts/list_pages.js

# 2. Select target page
node scripts/select_page.js --pageIdx 1

# 3. Now interact with that page
node scripts/take_snapshot.js
node scripts/click.js --uid button_xyz
```

### Pattern: Reliable Navigation

Use wait_for to ensure page loads before interaction:

```bash
# 1. Navigate
node scripts/navigate_page.js --url https://example.com/login

# 2. Wait for key element
node scripts/wait_for.js --text "Sign In" --timeout 10000

# 3. Now safe to interact
node scripts/take_snapshot.js
```

## Troubleshooting

**Problem:** "Cannot close last page" error

**Solution:** You must keep at least one page open. Open a new page before closing the last one.

**Problem:** Page index out of range

**Solution:** Always run `list_pages.js` first to see current indices. Indices shift when pages are closed.

**Problem:** Navigation timeout

**Solution:** Increase timeout value: `--timeout 60000` (60 seconds) for slow-loading pages.

**Problem:** Wrong page context

**Solution:** Use `list_pages.js` to check which page is selected (marked with "selected"). Use `select_page.js` to switch.
