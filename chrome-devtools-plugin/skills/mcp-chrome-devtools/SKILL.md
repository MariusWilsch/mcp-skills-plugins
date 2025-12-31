---
name: mcp-chrome-devtools
description: Automate Chrome browser via DevTools Protocol. Navigate pages, interact with elements, inspect network/console, analyze performance, and capture screenshots for web testing and automation tasks.
server-version: 0.10.2
---

# Chrome DevTools Skill

Control Chrome browser programmatically using the Chrome DevTools Protocol. This skill provides 26 tools for browser automation, web scraping, testing, and performance analysis.

## Prerequisites

- Node.js 18+ installed
- mcp2rest running on http://localhost:28888
- chrome-devtools server loaded in mcp2rest
- Package: `chrome-devtools-mcp@latest`
- Dependencies installed (already done during generation)

## Quick Start

Launch a browser, navigate to a page, and interact with elements:

```bash
# 1. Open a new page
node scripts/new_page.js --url https://example.com

# 2. Take a FILTERED snapshot (specify what you're looking for)
node scripts/take_snapshot.js --context "find submit button"

# 3. Click a button (use UID from snapshot output)
node scripts/click.js --uid button_submit_abc123
```

**Expected Output:**
- Page opens in Chrome browser
- Snapshot shows ONLY matching elements (90% context reduction)
- Button is clicked and any action triggers

## Best Practices

### Always use --context for verbose tools

The `--context` flag uses LLM filtering to return only relevant elements, reducing context usage by ~90%:

```bash
# Filtered (recommended) - returns only matching UIDs
node scripts/take_snapshot.js --context "find login button"

# Full output (escape hatch) - returns everything
node scripts/take_snapshot.js --context "*"
```

**Tools supporting --context:**
- `take_snapshot.js` - Filter accessibility tree elements
- `list_console_messages.js` - Filter console output (coming soon)
- `list_network_requests.js` - Filter network requests (coming soon)

**Why this matters:**
- Full snapshots: ~8,500 tokens (~$0.13 context cost)
- Filtered snapshots: ~500 tokens (~$0.01 context cost)
- ROI: ~25x per call

## Tool Groups

This skill provides 26 tools organized into 4 groups:

### 1. Page Management
Browser window and tab operations: creating pages, navigation, switching contexts.

**Tools:** new_page, list_pages, close_page, navigate_page, select_page, resize_page

See: @workflows/page-management.md for detailed workflows

### 2. Element Interaction
User input simulation: clicking, typing, form filling, drag & drop.

**Tools:** click, fill, fill_form, hover, drag, upload_file, press_key

See: @workflows/element-interaction.md for detailed workflows

### 3. Inspection & Debugging
Monitoring and debugging: snapshots, screenshots, console logs, network requests.

**Tools:** take_snapshot, take_screenshot, list_console_messages, get_console_message, list_network_requests, get_network_request

See: @workflows/inspection-debugging.md for detailed workflows

### 4. Performance Analysis
Scripting and performance tools: JavaScript execution, performance tracing, device emulation.

**Tools:** evaluate_script, wait_for, handle_dialog, emulate, performance_start_trace, performance_stop_trace, performance_analyze_insight

See: @workflows/performance-analysis.md for detailed workflows

## Common Workflows

### Workflow: Automated Form Submission

Complete end-to-end form filling and submission:

- [ ] **Open page:** `node scripts/new_page.js --url https://example.com/login`
- [ ] **Get form elements:** `node scripts/take_snapshot.js --context "find email and password inputs"`
- [ ] **Fill email:** `node scripts/fill.js --uid email_input_xyz --value test@example.com`
- [ ] **Fill password:** `node scripts/fill.js --uid pass_input_abc --value mypassword`
- [ ] **Submit form:** `node scripts/click.js --uid submit_btn_def`
- [ ] **Verify:** `node scripts/wait_for.js --text "Welcome" --timeout 5000`
- [ ] **Capture result:** `node scripts/take_screenshot.js --format png --filePath result.png`

**Input Example:**
```
Email field UID: input_email_1a2b3c
Password field UID: input_password_4d5e6f
Submit button UID: button_submit_7g8h9i
```

**Expected Output:**
Form submitted successfully, redirected to dashboard, screenshot saved.

### Workflow: Web Scraping with Network Monitoring

Capture page data and network activity:

- [ ] **Start monitoring:** `node scripts/new_page.js --url https://example.com/data`
- [ ] **Wait for load:** `node scripts/wait_for.js --text "Data loaded" --timeout 10000`
- [ ] **Get page snapshot:** `node scripts/take_snapshot.js --verbose true --filePath snapshot.txt`
- [ ] **List network calls:** `node scripts/list_network_requests.js --resourceTypes fetch,xhr`
- [ ] **Get specific request:** `node scripts/get_network_request.js --reqid request_123`
- [ ] **Extract via script:** `node scripts/evaluate_script.js --function "() => document.querySelector('.data').textContent"`

**Expected Output:**
Page data extracted, network requests logged, specific API responses captured.

### Workflow: Performance Testing

Analyze page performance and Core Web Vitals:

- [ ] **Open page:** `node scripts/new_page.js --url https://example.com`
- [ ] **Start tracing:** `node scripts/performance_start_trace.js --reload true --autoStop false`
- [ ] **Wait for page:** `node scripts/wait_for.js --text "Content loaded" --timeout 15000`
- [ ] **Stop tracing:** `node scripts/performance_stop_trace.js`
- [ ] **Review insights:** Check trace output for performance metrics and CWV scores
- [ ] **Analyze specific insight:** `node scripts/performance_analyze_insight.js --insightSetId set_123 --insightName LargestContentfulPaint`

**Expected Output:**
Performance trace with metrics, CWV scores (LCP, FID, CLS), actionable insights.

### Workflow: Multi-Page Session Management

Work with multiple browser tabs:

- [ ] **List current pages:** `node scripts/list_pages.js`
- [ ] **Open new tab:** `node scripts/new_page.js --url https://example.com/page1`
- [ ] **Open another tab:** `node scripts/new_page.js --url https://example.com/page2`
- [ ] **List all pages:** `node scripts/list_pages.js` (note page indices)
- [ ] **Switch to page 0:** `node scripts/select_page.js --pageIdx 0`
- [ ] **Interact with page 0:** `node scripts/take_snapshot.js`
- [ ] **Switch to page 1:** `node scripts/select_page.js --pageIdx 1`
- [ ] **Close page 1:** `node scripts/close_page.js --pageIdx 1`

**Expected Output:**
Multiple tabs managed, context switching works, specific pages closed.

## State Persistence

This server maintains state between script calls:
- Browser instance stays open across multiple commands
- Page context persists until explicitly changed with `select_page.js`
- Console messages and network requests accumulate since last navigation
- State resets when mcp2rest server restarts

## Reference

- **Complete tool listing:** @reference/all-tools.md
- **Troubleshooting guide:** @reference/troubleshooting.md
- **Advanced examples:** @reference/advanced-examples.md

## Quick Tips

1. **Always use --context for snapshots:** Specify what you're looking for to reduce context by 90%
2. **Use wait_for for dynamic content:** Don't assume instant loading
3. **Handle dialogs proactively:** Use `handle_dialog.js` if alerts/confirms appear
4. **Check console for errors:** Use `list_console_messages.js` to debug issues
5. **Monitor network for API calls:** Use `list_network_requests.js` to track backend communication
6. **Use --context "*" as escape hatch:** When you need full unfiltered output
