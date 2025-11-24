# Inspection & Debugging Workflows

Monitor and debug web applications using snapshots, screenshots, console logs, and network requests.

## Tools in This Group

### take_snapshot
Captures text-based page structure from the accessibility tree with element UIDs.

**Optional:** `--verbose [true|false]`, `--filePath FILEPATH`

```bash
# Console output
node scripts/take_snapshot.js

# Verbose mode (more details)
node scripts/take_snapshot.js --verbose true

# Save to file
node scripts/take_snapshot.js --filePath snapshot.txt
```

**Output Example:**
```
Page: https://example.com
Title: Example Domain

button "Submit" [uid: button_submit_abc123]
input "Email" [uid: input_email_def456]
link "About" [uid: link_about_ghi789]
```

### take_screenshot
Captures visual screenshot of the page or specific element.

**Optional:** `--format [png|jpeg]`, `--quality 0-100`, `--uid UID`, `--fullPage [true|false]`, `--filePath FILEPATH`

```bash
# Full page screenshot
node scripts/take_screenshot.js --format png --fullPage true --filePath page.png

# Element screenshot
node scripts/take_screenshot.js --uid element_abc123 --filePath element.png

# Compressed JPEG
node scripts/take_screenshot.js --format jpeg --quality 80 --filePath page.jpg
```

### list_console_messages
Lists console logs, warnings, and errors from the current page.

**Optional:** `--pageSize SIZE`, `--pageIdx INDEX`, `--types [log,warn,error,info]`, `--includePreservedMessages [true|false]`

```bash
# All messages
node scripts/list_console_messages.js

# Only errors
node scripts/list_console_messages.js --types error

# Paginated results
node scripts/list_console_messages.js --pageSize 10 --pageIdx 0
```

### get_console_message
Retrieves a specific console message by ID.

**Required:** `--msgid MESSAGE_ID`

```bash
node scripts/get_console_message.js --msgid msg_abc123
```

### list_network_requests
Lists network requests made by the current page.

**Optional:** `--pageSize SIZE`, `--pageIdx INDEX`, `--resourceTypes [fetch,xhr,document,script,stylesheet]`, `--includePreservedRequests [true|false]`

```bash
# All requests
node scripts/list_network_requests.js

# Only API calls
node scripts/list_network_requests.js --resourceTypes fetch,xhr

# Paginated results
node scripts/list_network_requests.js --pageSize 20 --pageIdx 0
```

### get_network_request
Retrieves details of a specific network request.

**Optional:** `--reqid REQUEST_ID`

```bash
# Get specific request
node scripts/get_network_request.js --reqid req_abc123

# Get currently selected request in DevTools
node scripts/get_network_request.js
```

## Workflows

### Workflow: Debug JavaScript Errors

Identify and analyze console errors:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/app`
- [ ] Wait for page load: `node scripts/wait_for.js --text "Welcome" --timeout 10000`
- [ ] List all console messages: `node scripts/list_console_messages.js`
- [ ] Filter errors only: `node scripts/list_console_messages.js --types error`
- [ ] Get specific error details: `node scripts/get_console_message.js --msgid <error-id-from-list>`
- [ ] Take screenshot of error state: `node scripts/take_screenshot.js --filePath error_state.png`
- [ ] Take snapshot for context: `node scripts/take_snapshot.js --filePath error_snapshot.txt`

**Expected Output:**
Console errors identified, stack traces captured, visual state documented.

### Workflow: Monitor API Calls

Track network requests and responses:

- [ ] Open application: `node scripts/new_page.js --url https://example.com/dashboard`
- [ ] Trigger data load: `node scripts/click.js --uid button_load_data`
- [ ] Wait for request: `node scripts/wait_for.js --text "Data loaded" --timeout 10000`
- [ ] List API calls: `node scripts/list_network_requests.js --resourceTypes fetch,xhr`
- [ ] Get specific request: `node scripts/get_network_request.js --reqid <request-id>`
- [ ] Verify response data in output
- [ ] Save network log: `node scripts/list_network_requests.js > network_log.txt`

**Expected Output:**
All API calls logged, request/response details captured, timing information available.

### Workflow: Visual Regression Testing

Capture screenshots for comparison:

- [ ] Open baseline page: `node scripts/new_page.js --url https://example.com/page`
- [ ] Wait for load: `node scripts/wait_for.js --text "Content loaded" --timeout 5000`
- [ ] Capture full page: `node scripts/take_screenshot.js --fullPage true --filePath baseline.png`
- [ ] Capture header: `node scripts/take_screenshot.js --uid header_main --filePath header.png`
- [ ] Capture footer: `node scripts/take_screenshot.js --uid footer_main --filePath footer.png`
- [ ] Navigate to variant: `node scripts/navigate_page.js --url https://example.com/page?variant=b`
- [ ] Wait for load: `node scripts/wait_for.js --text "Content loaded" --timeout 5000`
- [ ] Capture variant: `node scripts/take_screenshot.js --fullPage true --filePath variant.png`

**Expected Output:**
Screenshots captured for visual comparison, specific components isolated.

### Workflow: Form Submission Debugging

Debug form submission issues:

- [ ] Open form: `node scripts/new_page.js --url https://example.com/contact`
- [ ] Initial snapshot: `node scripts/take_snapshot.js`
- [ ] Fill form fields: `node scripts/fill.js --uid input_name --value "Test User"`
- [ ] Continue filling: `node scripts/fill.js --uid input_email --value "test@example.com"`
- [ ] Submit form: `node scripts/click.js --uid button_submit`
- [ ] Monitor console: `node scripts/list_console_messages.js --types error,warn`
- [ ] Monitor network: `node scripts/list_network_requests.js --resourceTypes fetch,xhr`
- [ ] Get POST request: `node scripts/get_network_request.js --reqid <post-request-id>`
- [ ] Check response: Verify status code and response body in output
- [ ] Take error screenshot: `node scripts/take_screenshot.js --filePath form_error.png`

**Expected Output:**
Form submission tracked, network call details captured, errors identified.

### Workflow: Content Extraction

Extract page content and structure:

- [ ] Navigate to page: `node scripts/new_page.js --url https://example.com/article`
- [ ] Wait for content: `node scripts/wait_for.js --text "Published" --timeout 5000`
- [ ] Take detailed snapshot: `node scripts/take_snapshot.js --verbose true --filePath article_structure.txt`
- [ ] Extract main content: `node scripts/evaluate_script.js --function "() => document.querySelector('article').textContent"`
- [ ] Extract metadata: `node scripts/evaluate_script.js --function "() => ({title: document.title, author: document.querySelector('.author').textContent})"`
- [ ] Screenshot article: `node scripts/take_screenshot.js --uid article_main --filePath article.png`
- [ ] List external resources: `node scripts/list_network_requests.js --resourceTypes script,stylesheet,image`

**Expected Output:**
Page structure documented, content extracted, external dependencies identified.

### Workflow: Performance Monitoring

Monitor page performance and resource loading:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/heavy-page`
- [ ] Wait for interactive: `node scripts/wait_for.js --text "Loaded" --timeout 30000`
- [ ] List all requests: `node scripts/list_network_requests.js`
- [ ] Identify slow requests: Review timing in network list output
- [ ] Get slow request details: `node scripts/get_network_request.js --reqid <slow-request-id>`
- [ ] Check console warnings: `node scripts/list_console_messages.js --types warn`
- [ ] Take final screenshot: `node scripts/take_screenshot.js --filePath loaded_state.png`

**Expected Output:**
Resource loading times captured, slow requests identified, console warnings logged.

### Workflow: Multi-Step User Flow Debugging

Debug complex user interactions:

- [ ] Start flow: `node scripts/new_page.js --url https://example.com/checkout`
- [ ] **Step 1: Cart**
  - [ ] Snapshot: `node scripts/take_snapshot.js --filePath step1_snapshot.txt`
  - [ ] Screenshot: `node scripts/take_screenshot.js --filePath step1_cart.png`
  - [ ] Console: `node scripts/list_console_messages.js > step1_console.txt`
  - [ ] Network: `node scripts/list_network_requests.js > step1_network.txt`
  - [ ] Next: `node scripts/click.js --uid button_checkout`
- [ ] **Step 2: Shipping**
  - [ ] Wait: `node scripts/wait_for.js --text "Shipping Information" --timeout 5000`
  - [ ] Snapshot: `node scripts/take_snapshot.js --filePath step2_snapshot.txt`
  - [ ] Screenshot: `node scripts/take_screenshot.js --filePath step2_shipping.png`
  - [ ] Fill: `node scripts/fill_form.js --elements '[{"uid":"input_address","value":"123 Main St"}]'`
  - [ ] Next: `node scripts/click.js --uid button_continue`
- [ ] **Step 3: Payment**
  - [ ] Wait: `node scripts/wait_for.js --text "Payment Method" --timeout 5000`
  - [ ] Snapshot: `node scripts/take_snapshot.js --filePath step3_snapshot.txt`
  - [ ] Console errors: `node scripts/list_console_messages.js --types error`
  - [ ] Network calls: `node scripts/list_network_requests.js --resourceTypes fetch,xhr`

**Expected Output:**
Full debugging trace of multi-step flow, each step documented with snapshot/screenshot/logs.

## Common Patterns

### Pattern: Snapshot First, Then Screenshot

Use snapshot for UIDs and structure, screenshot for visual verification:

```bash
# 1. Get structure and UIDs
node scripts/take_snapshot.js --filePath structure.txt

# 2. Get visual representation
node scripts/take_screenshot.js --filePath visual.png

# 3. Use UIDs from snapshot for interaction
node scripts/click.js --uid <uid-from-snapshot>
```

### Pattern: Filter Console by Type

Focus on specific message types:

```bash
# Errors only (most critical)
node scripts/list_console_messages.js --types error

# Errors and warnings
node scripts/list_console_messages.js --types error,warn

# Everything
node scripts/list_console_messages.js
```

### Pattern: Track API Call Sequence

Monitor API calls in order:

```bash
# 1. Before action
node scripts/list_network_requests.js > before.txt

# 2. Trigger action
node scripts/click.js --uid button_submit

# 3. After action
node scripts/list_network_requests.js > after.txt

# 4. Compare to see new requests
# (manually diff before.txt and after.txt)
```

### Pattern: Element-Specific Screenshot

Capture specific UI components:

```bash
# 1. Get element UID
node scripts/take_snapshot.js

# 2. Screenshot just that element
node scripts/take_screenshot.js --uid <element-uid> --filePath component.png
```

## Troubleshooting

**Problem:** Snapshot shows different UIDs each time

**Solution:** This is expected. UIDs are regenerated on each snapshot. Always use the most recent snapshot before interaction.

**Problem:** Screenshot is blank or black

**Solution:**
- Wait for page to fully load with `wait_for.js`
- Check if element is visible (not hidden or off-screen)
- Try full page screenshot first: `--fullPage true`

**Problem:** Console messages not showing up

**Solution:**
- Messages accumulate since last navigation
- Reload page if you need to clear: `navigate_page.js --type reload`
- Use `--includePreservedMessages true` to see older messages

**Problem:** Network requests list is empty

**Solution:**
- Requests are captured from current navigation onwards
- Navigate to page after opening it to capture requests
- Use `--includePreservedRequests true` to see older requests

**Problem:** Cannot find specific console message ID

**Solution:**
- Run `list_console_messages.js` first to get message IDs
- Message IDs are shown in the list output
- Use the exact ID from the list in `get_console_message.js`

**Problem:** Screenshot file path error

**Solution:**
- Use absolute paths: `/Users/username/screenshots/image.png`
- Use forward slashes (not backslashes)
- Ensure directory exists before saving
