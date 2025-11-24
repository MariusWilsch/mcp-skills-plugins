# Complete Tool Reference

Alphabetical listing of all 26 chrome-devtools tools with full parameters and examples.

## Table of Contents

- [click](#click)
- [close_page](#close_page)
- [drag](#drag)
- [emulate](#emulate)
- [evaluate_script](#evaluate_script)
- [fill](#fill)
- [fill_form](#fill_form)
- [get_console_message](#get_console_message)
- [get_network_request](#get_network_request)
- [handle_dialog](#handle_dialog)
- [hover](#hover)
- [list_console_messages](#list_console_messages)
- [list_network_requests](#list_network_requests)
- [list_pages](#list_pages)
- [navigate_page](#navigate_page)
- [new_page](#new_page)
- [performance_analyze_insight](#performance_analyze_insight)
- [performance_start_trace](#performance_start_trace)
- [performance_stop_trace](#performance_stop_trace)
- [press_key](#press_key)
- [resize_page](#resize_page)
- [select_page](#select_page)
- [take_screenshot](#take_screenshot)
- [take_snapshot](#take_snapshot)
- [upload_file](#upload_file)
- [wait_for](#wait_for)

---

## click

Clicks on an element identified by its UID.

**Group:** Element Interaction

**Required Parameters:**
- `--uid UID` - Element unique identifier from snapshot

**Optional Parameters:**
- `--dblClick BOOLEAN` - Double click instead of single click (default: false)

**Examples:**
```bash
# Single click
node scripts/click.js --uid button_submit_abc123

# Double click
node scripts/click.js --uid file_icon_xyz789 --dblClick true
```

**Related Tools:** hover, fill, take_snapshot

---

## close_page

Closes a page by its index. Cannot close the last remaining page.

**Group:** Page Management

**Required Parameters:**
- `--pageIdx NUMBER` - Index of page to close (from list_pages)

**Examples:**
```bash
node scripts/close_page.js --pageIdx 2
```

**Notes:** Always keep at least one page open. Close pages from highest to lowest index to avoid index shifting.

**Related Tools:** list_pages, new_page, select_page

---

## drag

Drags one element onto another element.

**Group:** Element Interaction

**Required Parameters:**
- `--from-uid UID` - UID of element to drag
- `--to-uid UID` - UID of target drop zone

**Examples:**
```bash
node scripts/drag.js --from-uid task_item_abc --to-uid dropzone_xyz
```

**Related Tools:** hover, click, take_snapshot

---

## emulate

Emulates network conditions and CPU throttling.

**Group:** Performance Analysis

**Optional Parameters:**
- `--networkConditions JSON` - Network throttling config
- `--cpuThrottlingRate NUMBER` - CPU throttling multiplier (1 = normal)

**Network Conditions Format:**
```json
{
  "downloadThroughput": 50000,
  "uploadThroughput": 50000,
  "latency": 2000
}
```

**Examples:**
```bash
# Slow 3G
node scripts/emulate.js --networkConditions '{"downloadThroughput":50000,"uploadThroughput":50000,"latency":2000}'

# 4x CPU slowdown
node scripts/emulate.js --cpuThrottlingRate 4

# Combined
node scripts/emulate.js --networkConditions '{"downloadThroughput":100000,"uploadThroughput":50000,"latency":100}' --cpuThrottlingRate 2

# Reset to normal
node scripts/emulate.js --cpuThrottlingRate 1
```

**Common Presets:**
- Slow 3G: 50KB/s down, 50KB/s up, 2000ms latency
- Fast 3G: 180KB/s down, 84KB/s up, 562ms latency
- 4G: 1.6MB/s down, 750KB/s up, 150ms latency

**Related Tools:** performance_start_trace, performance_stop_trace

---

## evaluate_script

Executes JavaScript in the page context and returns JSON-serializable results.

**Group:** Performance Analysis

**Required Parameters:**
- `--function STRING` - JavaScript function as string

**Optional Parameters:**
- `--args JSON_ARRAY` - Function arguments as JSON array

**Examples:**
```bash
# Simple extraction
node scripts/evaluate_script.js --function "() => document.title"

# With parameters
node scripts/evaluate_script.js --function "(x, y) => x + y" --args '[5, 3]'

# Extract array of data
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('h2')).map(h => h.textContent)"

# Complex object extraction
node scripts/evaluate_script.js --function "() => ({title: document.title, links: document.querySelectorAll('a').length})"
```

**Important:** Return values must be JSON-serializable (no DOM nodes, functions, or circular references).

**Related Tools:** take_snapshot, wait_for

---

## fill

Types text into inputs/textareas or selects dropdown options.

**Group:** Element Interaction

**Required Parameters:**
- `--uid UID` - Element unique identifier
- `--value STRING` - Text to type or option to select

**Examples:**
```bash
# Text input
node scripts/fill.js --uid input_username_abc --value "john.doe"

# Textarea
node scripts/fill.js --uid textarea_comment_def --value "This is a long comment"

# Dropdown select
node scripts/fill.js --uid select_country_ghi --value "United States"
```

**Related Tools:** fill_form, click, take_snapshot

---

## fill_form

Fills multiple form fields at once.

**Group:** Element Interaction

**Required Parameters:**
- `--elements JSON_ARRAY` - Array of {uid, value} objects

**Format:**
```json
[
  {"uid": "input_email", "value": "test@example.com"},
  {"uid": "input_password", "value": "secret123"}
]
```

**Examples:**
```bash
node scripts/fill_form.js --elements '[{"uid":"input_email","value":"test@example.com"},{"uid":"input_password","value":"secret123"}]'

# Multi-line for readability (bash)
node scripts/fill_form.js --elements '[
  {"uid":"input_name","value":"John Doe"},
  {"uid":"input_email","value":"john@example.com"},
  {"uid":"select_country","value":"USA"}
]'
```

**Related Tools:** fill, click, take_snapshot

---

## get_console_message

Retrieves a specific console message by ID.

**Group:** Inspection & Debugging

**Required Parameters:**
- `--msgid STRING` - Message ID from list_console_messages

**Examples:**
```bash
node scripts/get_console_message.js --msgid msg_abc123
```

**Related Tools:** list_console_messages

---

## get_network_request

Gets details of a specific network request.

**Group:** Inspection & Debugging

**Optional Parameters:**
- `--reqid STRING` - Request ID from list_network_requests (if omitted, returns currently selected request in DevTools)

**Examples:**
```bash
# Specific request
node scripts/get_network_request.js --reqid req_abc123

# Currently selected in DevTools
node scripts/get_network_request.js
```

**Output includes:** URL, method, status code, headers, request/response body, timing.

**Related Tools:** list_network_requests

---

## handle_dialog

Handles browser dialogs (alert, confirm, prompt).

**Group:** Performance Analysis

**Required Parameters:**
- `--action STRING` - Either "accept" or "dismiss"

**Optional Parameters:**
- `--promptText STRING` - Text to enter in prompt dialog (only for prompts)

**Examples:**
```bash
# Accept alert
node scripts/handle_dialog.js --action accept

# Dismiss confirm
node scripts/handle_dialog.js --action dismiss

# Accept prompt with input
node scripts/handle_dialog.js --action accept --promptText "My Answer"
```

**Notes:** Dialog must already be open when calling this tool.

**Related Tools:** click, wait_for

---

## hover

Hovers the mouse over an element.

**Group:** Element Interaction

**Required Parameters:**
- `--uid UID` - Element unique identifier

**Examples:**
```bash
node scripts/hover.js --uid tooltip_trigger_abc

# Common pattern: hover then click
node scripts/hover.js --uid menu_trigger_xyz
node scripts/click.js --uid menu_item_settings
```

**Use Cases:** Triggering tooltips, dropdown menus, hover effects.

**Related Tools:** click, take_snapshot

---

## list_console_messages

Lists console messages (logs, warnings, errors) from the current page.

**Group:** Inspection & Debugging

**Optional Parameters:**
- `--pageSize NUMBER` - Number of messages per page
- `--pageIdx NUMBER` - Page index for pagination (0-based)
- `--types STRING` - Comma-separated types: log,warn,error,info
- `--includePreservedMessages BOOLEAN` - Include messages from before current navigation

**Examples:**
```bash
# All messages
node scripts/list_console_messages.js

# Only errors
node scripts/list_console_messages.js --types error

# Errors and warnings
node scripts/list_console_messages.js --types error,warn

# Paginated
node scripts/list_console_messages.js --pageSize 10 --pageIdx 0
```

**Related Tools:** get_console_message

---

## list_network_requests

Lists network requests made by the current page.

**Group:** Inspection & Debugging

**Optional Parameters:**
- `--pageSize NUMBER` - Number of requests per page
- `--pageIdx NUMBER` - Page index for pagination (0-based)
- `--resourceTypes STRING` - Comma-separated types: fetch,xhr,document,script,stylesheet,image
- `--includePreservedRequests BOOLEAN` - Include requests from before current navigation

**Examples:**
```bash
# All requests
node scripts/list_network_requests.js

# Only API calls
node scripts/list_network_requests.js --resourceTypes fetch,xhr

# Only scripts and stylesheets
node scripts/list_network_requests.js --resourceTypes script,stylesheet

# Paginated
node scripts/list_network_requests.js --pageSize 20 --pageIdx 0
```

**Related Tools:** get_network_request

---

## list_pages

Lists all open browser pages with their indices and URLs.

**Group:** Page Management

**No Parameters**

**Examples:**
```bash
node scripts/list_pages.js
```

**Output Example:**
```
Page 0: https://example.com (selected)
Page 1: https://google.com
Page 2: https://github.com
```

**Related Tools:** new_page, select_page, close_page

---

## navigate_page

Navigates the currently selected page.

**Group:** Page Management

**Optional Parameters:**
- `--url STRING` - URL to navigate to
- `--type STRING` - Navigation type: navigate, reload, back, forward
- `--ignoreCache BOOLEAN` - Bypass cache on reload
- `--timeout NUMBER` - Navigation timeout in milliseconds

**Examples:**
```bash
# Navigate to URL
node scripts/navigate_page.js --url https://example.com/page2

# Reload page
node scripts/navigate_page.js --type reload

# Reload ignoring cache
node scripts/navigate_page.js --type reload --ignoreCache true

# Go back
node scripts/navigate_page.js --type back

# Go forward
node scripts/navigate_page.js --type forward
```

**Related Tools:** new_page, wait_for

---

## new_page

Creates a new browser page (tab).

**Group:** Page Management

**Required Parameters:**
- `--url STRING` - URL to open

**Optional Parameters:**
- `--timeout NUMBER` - Page load timeout in milliseconds (default: 30000)

**Examples:**
```bash
node scripts/new_page.js --url https://example.com

# With longer timeout
node scripts/new_page.js --url https://slow-site.com --timeout 60000
```

**Notes:** New page becomes the selected page automatically.

**Related Tools:** list_pages, select_page, close_page

---

## performance_analyze_insight

Gets detailed information about a specific performance insight.

**Group:** Performance Analysis

**Required Parameters:**
- `--insightSetId STRING` - Insight set ID from performance trace
- `--insightName STRING` - Name of specific insight to analyze

**Examples:**
```bash
node scripts/performance_analyze_insight.js --insightSetId set_abc123 --insightName LargestContentfulPaint

node scripts/performance_analyze_insight.js --insightSetId set_abc123 --insightName CumulativeLayoutShift
```

**Common Insight Names:**
- LargestContentfulPaint
- FirstContentfulPaint
- CumulativeLayoutShift
- TotalBlockingTime
- TimeToInteractive

**Related Tools:** performance_start_trace, performance_stop_trace

---

## performance_start_trace

Starts performance trace recording.

**Group:** Performance Analysis

**Required Parameters:**
- `--reload BOOLEAN` - Reload page before tracing
- `--autoStop BOOLEAN` - Automatically stop when page loads

**Examples:**
```bash
# Start with page reload
node scripts/performance_start_trace.js --reload true --autoStop false

# Start without reload
node scripts/performance_start_trace.js --reload false --autoStop true
```

**Notes:** Only one trace can be active at a time. Call performance_stop_trace to get results.

**Related Tools:** performance_stop_trace, performance_analyze_insight

---

## performance_stop_trace

Stops the active performance trace and returns results.

**Group:** Performance Analysis

**No Parameters**

**Examples:**
```bash
node scripts/performance_stop_trace.js
```

**Output includes:**
- Core Web Vitals scores (LCP, FID, CLS)
- Performance insights
- Insight set IDs for detailed analysis
- Timing metrics

**Related Tools:** performance_start_trace, performance_analyze_insight

---

## press_key

Presses a key or key combination.

**Group:** Element Interaction

**Required Parameters:**
- `--key STRING` - Key or key combination to press

**Examples:**
```bash
# Single key
node scripts/press_key.js --key Enter
node scripts/press_key.js --key Tab
node scripts/press_key.js --key Escape

# Arrow keys
node scripts/press_key.js --key ArrowDown
node scripts/press_key.js --key ArrowUp

# Key combinations (use + separator)
node scripts/press_key.js --key "Control+S"
node scripts/press_key.js --key "Control+Shift+P"
node scripts/press_key.js --key "Alt+F4"
```

**Common Keys:** Enter, Tab, Escape, Space, Backspace, Delete, ArrowUp, ArrowDown, ArrowLeft, ArrowRight

**Modifiers:** Control, Shift, Alt, Meta (Command on Mac)

**Related Tools:** fill, click

---

## resize_page

Resizes the browser window to specific dimensions.

**Group:** Page Management

**Required Parameters:**
- `--width NUMBER` - Width in pixels
- `--height NUMBER` - Height in pixels

**Examples:**
```bash
# Desktop
node scripts/resize_page.js --width 1920 --height 1080

# Laptop
node scripts/resize_page.js --width 1366 --height 768

# Tablet
node scripts/resize_page.js --width 768 --height 1024

# Mobile
node scripts/resize_page.js --width 375 --height 667
```

**Common Dimensions:**
- Desktop: 1920x1080, 1440x900, 1366x768
- Tablet: 768x1024 (iPad), 600x960
- Mobile: 375x667 (iPhone), 360x640 (Android)

**Related Tools:** take_screenshot, emulate

---

## select_page

Switches the active context to a specific page.

**Group:** Page Management

**Required Parameters:**
- `--pageIdx NUMBER` - Page index from list_pages

**Examples:**
```bash
node scripts/select_page.js --pageIdx 0
node scripts/select_page.js --pageIdx 2
```

**Notes:** All subsequent commands operate on the selected page.

**Related Tools:** list_pages, new_page

---

## take_screenshot

Captures a visual screenshot of the page or element.

**Group:** Inspection & Debugging

**Optional Parameters:**
- `--format STRING` - Image format: png or jpeg (default: png)
- `--quality NUMBER` - JPEG quality 0-100 (default: 90)
- `--uid STRING` - Element UID to screenshot (if omitted, screenshots viewport)
- `--fullPage BOOLEAN` - Capture full scrollable page (default: false)
- `--filePath STRING` - Path to save image file

**Examples:**
```bash
# Full page PNG
node scripts/take_screenshot.js --fullPage true --filePath page.png

# Viewport only
node scripts/take_screenshot.js --filePath viewport.png

# Specific element
node scripts/take_screenshot.js --uid element_abc123 --filePath element.png

# Compressed JPEG
node scripts/take_screenshot.js --format jpeg --quality 80 --filePath page.jpg
```

**Related Tools:** take_snapshot

---

## take_snapshot

Captures text-based page structure with element UIDs.

**Group:** Inspection & Debugging

**Optional Parameters:**
- `--verbose BOOLEAN` - Include more details (default: false)
- `--filePath STRING` - Path to save snapshot file

**Examples:**
```bash
# Console output
node scripts/take_snapshot.js

# Verbose mode
node scripts/take_snapshot.js --verbose true

# Save to file
node scripts/take_snapshot.js --filePath snapshot.txt

# Both
node scripts/take_snapshot.js --verbose true --filePath detailed_snapshot.txt
```

**Output Format:**
```
Page: https://example.com
Title: Example Domain

button "Submit" [uid: button_submit_abc123]
input "Email" [uid: input_email_def456]
link "About" [uid: link_about_ghi789]
```

**Important:** Always use UIDs from the most recent snapshot. UIDs regenerate on each snapshot.

**Related Tools:** click, fill, hover, drag, take_screenshot

---

## upload_file

Uploads a file through a file input element.

**Group:** Element Interaction

**Required Parameters:**
- `--uid UID` - File input element UID
- `--filePath STRING` - Absolute path to file to upload

**Examples:**
```bash
# Upload document
node scripts/upload_file.js --uid input_file_abc --filePath /Users/username/documents/resume.pdf

# Upload image
node scripts/upload_file.js --uid input_avatar_xyz --filePath /Users/username/pictures/profile.jpg
```

**Notes:**
- Use absolute paths (not relative)
- Use forward slashes in paths
- Verify file exists before upload

**Related Tools:** click, fill, wait_for

---

## wait_for

Waits for specific text to appear on the page.

**Group:** Performance Analysis

**Required Parameters:**
- `--text STRING` - Text to wait for (exact match)

**Optional Parameters:**
- `--timeout NUMBER` - Maximum wait time in milliseconds (default: 30000)

**Examples:**
```bash
# Wait up to 30 seconds (default)
node scripts/wait_for.js --text "Loading complete"

# Wait up to 10 seconds
node scripts/wait_for.js --text "Welcome" --timeout 10000

# Wait for error message
node scripts/wait_for.js --text "Error occurred" --timeout 5000
```

**Notes:**
- Text match is exact (case-sensitive)
- Times out if text doesn't appear within timeout period
- Use after navigation, clicks, or any action that triggers loading

**Related Tools:** click, navigate_page, take_snapshot
