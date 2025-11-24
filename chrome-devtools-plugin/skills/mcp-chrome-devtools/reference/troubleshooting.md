# Troubleshooting Guide

Common issues and solutions for chrome-devtools skill.

## Table of Contents

- [Connection Issues](#connection-issues)
- [Page Management Problems](#page-management-problems)
- [Element Interaction Issues](#element-interaction-issues)
- [Snapshot and Screenshot Problems](#snapshot-and-screenshot-problems)
- [Console and Network Debugging](#console-and-network-debugging)
- [Performance Analysis Issues](#performance-analysis-issues)
- [General Best Practices](#general-best-practices)

---

## Connection Issues

### Problem: "Cannot connect to mcp2rest"

**Symptoms:**
- Scripts fail with connection error
- "ECONNREFUSED" error on port 28888

**Solutions:**

1. **Check if mcp2rest is running:**
```bash
curl http://localhost:28888/health
```

Expected: `{"status": "healthy"}`

2. **Start mcp2rest if not running:**
```bash
mcp2rest start
```

3. **Verify chrome-devtools server is loaded:**
```bash
curl http://localhost:28888/servers
```

Should list chrome-devtools with "connected" status.

4. **Reload server if disconnected:**
```bash
mcp2rest reload chrome-devtools
```

### Problem: "Server not found"

**Symptoms:**
- Server not listed in mcp2rest
- Tools return "server not configured" error

**Solutions:**

1. **Check installed servers:**
```bash
mcp2rest list
```

2. **Add chrome-devtools server:**
```bash
mcp2rest add chrome-devtools
```

3. **Restart mcp2rest:**
```bash
mcp2rest restart
```

---

## Page Management Problems

### Problem: "Cannot close last page"

**Symptoms:**
- close_page fails with error about last page

**Solution:**

Always keep at least one page open. Open a new page before closing the last one:

```bash
# Check current pages
node scripts/list_pages.js

# Open new page first
node scripts/new_page.js --url https://example.com

# Now close the old page
node scripts/close_page.js --pageIdx 1
```

### Problem: "Page index out of range"

**Symptoms:**
- select_page or close_page fails
- "Invalid page index" error

**Solutions:**

1. **Always list pages first:**
```bash
node scripts/list_pages.js
```

2. **Use indices from the current list:**
Page indices shift when pages are closed. Always get fresh indices.

3. **Close pages in reverse order:**
```bash
# If closing multiple pages, start from highest index
node scripts/close_page.js --pageIdx 3
node scripts/close_page.js --pageIdx 2
node scripts/close_page.js --pageIdx 1
```

### Problem: "Navigation timeout"

**Symptoms:**
- new_page or navigate_page times out
- Page doesn't load within timeout period

**Solutions:**

1. **Increase timeout:**
```bash
node scripts/new_page.js --url https://slow-site.com --timeout 60000
```

2. **Check network connectivity:**
Verify the URL loads in a regular browser.

3. **Use emulation to debug slow loading:**
```bash
# Test without throttling first
node scripts/emulate.js --cpuThrottlingRate 1
node scripts/new_page.js --url https://example.com
```

### Problem: "Wrong page context"

**Symptoms:**
- Commands execute on wrong page
- Unexpected elements in snapshot

**Solutions:**

1. **Check selected page:**
```bash
node scripts/list_pages.js
# Look for "(selected)" indicator
```

2. **Explicitly select target page:**
```bash
node scripts/select_page.js --pageIdx 0
```

3. **Pattern: Always select before interaction:**
```bash
node scripts/list_pages.js
node scripts/select_page.js --pageIdx 1
node scripts/take_snapshot.js
```

---

## Element Interaction Issues

### Problem: "Element UID not found"

**Symptoms:**
- click, fill, or hover fails
- "UID does not exist" error

**Solutions:**

1. **Take fresh snapshot:**
UIDs regenerate on each snapshot. Never reuse old UIDs.

```bash
# Always take new snapshot before interaction
node scripts/take_snapshot.js
# Use UIDs from this output
node scripts/click.js --uid <fresh-uid>
```

2. **Verify element exists:**
Check the snapshot output to confirm the element is present.

3. **Wait for page to load:**
```bash
node scripts/wait_for.js --text "Page loaded" --timeout 10000
node scripts/take_snapshot.js
```

### Problem: "Click doesn't trigger action"

**Symptoms:**
- Element is clicked but nothing happens
- No error, but expected behavior doesn't occur

**Solutions:**

1. **Wait for page to fully load:**
```bash
node scripts/wait_for.js --text "Ready" --timeout 5000
node scripts/click.js --uid button_abc
```

2. **Try hover first:**
Some elements require hover to become clickable.

```bash
node scripts/hover.js --uid element_abc
node scripts/click.js --uid element_abc
```

3. **Check if element is visible:**
Hidden or off-screen elements may not be clickable. Use take_snapshot with verbose to check visibility.

4. **Use double-click if needed:**
```bash
node scripts/click.js --uid element_abc --dblClick true
```

### Problem: "Fill doesn't work on input"

**Symptoms:**
- Text not entered into field
- Select dropdown not changing

**Solutions:**

1. **Verify element type:**
Use take_snapshot to confirm it's an input/textarea/select.

2. **Click to focus first:**
```bash
node scripts/click.js --uid input_abc
node scripts/fill.js --uid input_abc --value "text"
```

3. **For custom components, use press_key:**
```bash
node scripts/click.js --uid custom_input
node scripts/press_key.js --key "H"
node scripts/press_key.js --key "i"
```

4. **For dropdowns, use exact option value:**
Check the HTML to find the correct option value.

### Problem: "Drag and drop doesn't work"

**Symptoms:**
- Drag operation completes but element doesn't move
- "Invalid UID" error

**Solutions:**

1. **Verify both UIDs are current:**
```bash
node scripts/take_snapshot.js
# Use UIDs from this output
node scripts/drag.js --from-uid <fresh-from> --to-uid <fresh-to>
```

2. **Add wait between operations:**
```bash
node scripts/drag.js --from-uid item1 --to-uid zone1
node scripts/wait_for.js --text "Moved" --timeout 3000
```

3. **Check if dropzone accepts the element:**
Some drag-and-drop UIs have restrictions on what can be dropped where.

### Problem: "File upload fails"

**Symptoms:**
- upload_file fails
- File path error

**Solutions:**

1. **Use absolute paths:**
```bash
# Good
node scripts/upload_file.js --uid input_file --filePath /Users/username/file.pdf

# Bad
# node scripts/upload_file.js --uid input_file --filePath ./file.pdf
```

2. **Use forward slashes:**
```bash
# Good
/Users/username/documents/file.pdf

# Bad (Windows-style)
# C:\Users\username\documents\file.pdf
```

3. **Verify file exists:**
```bash
ls -la /Users/username/documents/file.pdf
```

4. **Check file input UID:**
Take fresh snapshot and verify the element is a file input.

---

## Snapshot and Screenshot Problems

### Problem: "Snapshot shows different UIDs each time"

**Symptoms:**
- UIDs change on each snapshot
- Previously working UIDs stop working

**Solution:**

**This is expected behavior.** UIDs are dynamically generated on each snapshot. Always use the most recent snapshot:

```bash
# Pattern: Always snapshot before interaction
node scripts/take_snapshot.js
# Immediately use UIDs from output
node scripts/click.js --uid <current-uid>
```

### Problem: "Screenshot is blank or black"

**Symptoms:**
- Screenshot file is created but shows blank/black image

**Solutions:**

1. **Wait for page to render:**
```bash
node scripts/wait_for.js --text "Content" --timeout 10000
node scripts/take_screenshot.js --filePath page.png
```

2. **Try full page screenshot:**
```bash
node scripts/take_screenshot.js --fullPage true --filePath page.png
```

3. **Verify element is visible:**
For element screenshots, ensure the element isn't hidden or off-screen.

4. **Check page actually loaded:**
```bash
node scripts/take_snapshot.js
# Verify page content appears in snapshot
```

### Problem: "Screenshot file not saving"

**Symptoms:**
- No error but file not created
- "File not found" when opening

**Solutions:**

1. **Use absolute path:**
```bash
node scripts/take_screenshot.js --filePath /Users/username/screenshots/page.png
```

2. **Ensure directory exists:**
```bash
mkdir -p /Users/username/screenshots
node scripts/take_screenshot.js --filePath /Users/username/screenshots/page.png
```

3. **Check file permissions:**
Ensure you have write access to the target directory.

---

## Console and Network Debugging

### Problem: "Console messages not showing up"

**Symptoms:**
- list_console_messages returns empty or incomplete results

**Solutions:**

1. **Messages accumulate since navigation:**
Console messages are captured from the current page navigation onwards.

2. **Reload if needed:**
```bash
node scripts/navigate_page.js --type reload
# Wait for page load
node scripts/wait_for.js --text "Ready" --timeout 10000
# Now check console
node scripts/list_console_messages.js
```

3. **Include preserved messages:**
```bash
node scripts/list_console_messages.js --includePreservedMessages true
```

4. **Ensure page has errors to show:**
Use take_snapshot or evaluate_script to verify page loaded correctly.

### Problem: "Network requests list is empty"

**Symptoms:**
- list_network_requests returns no results
- Expected API calls not showing

**Solutions:**

1. **Requests are captured from navigation onwards:**
```bash
# Navigate first to capture requests
node scripts/navigate_page.js --url https://example.com
# Wait for page to load
node scripts/wait_for.js --text "Loaded" --timeout 10000
# Now check requests
node scripts/list_network_requests.js
```

2. **Filter by resource type:**
```bash
# Maybe filtering too strictly
node scripts/list_network_requests.js --resourceTypes fetch,xhr,document
```

3. **Include preserved requests:**
```bash
node scripts/list_network_requests.js --includePreservedRequests true
```

### Problem: "Cannot find console message or network request ID"

**Symptoms:**
- get_console_message or get_network_request fails
- "Invalid ID" error

**Solutions:**

1. **List first to get IDs:**
```bash
# For console
node scripts/list_console_messages.js
# Copy message ID from output
node scripts/get_console_message.js --msgid <id-from-list>

# For network
node scripts/list_network_requests.js
# Copy request ID from output
node scripts/get_network_request.js --reqid <id-from-list>
```

2. **IDs are session-specific:**
IDs don't persist across page navigations. Get fresh IDs after navigation.

---

## Performance Analysis Issues

### Problem: "evaluate_script returns null or error"

**Symptoms:**
- Script execution fails
- Returns null unexpectedly
- "Evaluation failed" error

**Solutions:**

1. **Return JSON-serializable values only:**
```bash
# Good: primitives, arrays, plain objects
node scripts/evaluate_script.js --function "() => document.title"
node scripts/evaluate_script.js --function "() => [1, 2, 3]"
node scripts/evaluate_script.js --function "() => ({key: 'value'})"

# Bad: DOM nodes, functions, circular references
# node scripts/evaluate_script.js --function "() => document.querySelector('div')"
```

2. **Extract values from DOM elements:**
```bash
# Instead of returning DOM nodes, extract their properties
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('a')).map(a => a.href)"
```

3. **Check for JavaScript errors:**
```bash
node scripts/list_console_messages.js --types error
```

4. **Verify function syntax:**
```bash
# Arrow function
node scripts/evaluate_script.js --function "() => document.title"

# Function with parameters
node scripts/evaluate_script.js --function "(x, y) => x + y" --args '[5, 3]'
```

### Problem: "wait_for times out"

**Symptoms:**
- wait_for exceeds timeout
- Text never appears

**Solutions:**

1. **Increase timeout:**
```bash
node scripts/wait_for.js --text "Loaded" --timeout 30000
```

2. **Verify text actually appears:**
```bash
# Check with snapshot
node scripts/take_snapshot.js
# Look for the expected text
```

3. **Text match is exact:**
Check spelling, capitalization, and spacing.

```bash
# Case-sensitive match
# "Welcome" ≠ "welcome" ≠ "Welcome!"
```

4. **Wait for network first:**
```bash
# If text appears after API call, wait longer
node scripts/wait_for.js --text "Data loaded" --timeout 20000
```

### Problem: "Dialog not handled"

**Symptoms:**
- handle_dialog fails
- "No dialog present" error

**Solutions:**

1. **Dialog must be open first:**
```bash
# Trigger dialog
node scripts/click.js --uid button_delete

# Immediately handle it
node scripts/handle_dialog.js --action accept
```

2. **Some "dialogs" are custom HTML:**
If it's not a real browser dialog (alert/confirm/prompt), use click instead:

```bash
# For custom modal dialogs
node scripts/take_snapshot.js
node scripts/click.js --uid button_modal_ok
```

3. **Timing matters:**
Handle dialog immediately after triggering action.

### Problem: "Performance trace shows unexpected results"

**Symptoms:**
- CWV scores don't match expectations
- Missing performance data

**Solutions:**

1. **Ensure page fully loads:**
```bash
node scripts/performance_start_trace.js --reload true --autoStop false
node scripts/wait_for.js --text "Loaded" --timeout 20000
node scripts/performance_stop_trace.js
```

2. **Use reload for consistent measurement:**
```bash
# For initial page load measurement
node scripts/performance_start_trace.js --reload true --autoStop false
```

3. **Clear browser state:**
Navigation with cache clear:
```bash
node scripts/navigate_page.js --url https://example.com --ignoreCache true
```

4. **Disable emulation if active:**
```bash
node scripts/emulate.js --cpuThrottlingRate 1
```

### Problem: "Emulation not working"

**Symptoms:**
- Page loads at normal speed despite emulation
- No visible effect from throttling

**Solutions:**

1. **Emulation persists for session:**
Reset to normal first, then apply:

```bash
# Reset
node scripts/emulate.js --cpuThrottlingRate 1

# Then apply desired emulation
node scripts/emulate.js --cpuThrottlingRate 4
```

2. **Network conditions must be valid JSON:**
```bash
# All three properties required
node scripts/emulate.js --networkConditions '{"downloadThroughput":50000,"uploadThroughput":50000,"latency":2000}'
```

3. **Verify effect with performance trace:**
```bash
node scripts/emulate.js --cpuThrottlingRate 4
node scripts/performance_start_trace.js --reload true --autoStop false
node scripts/wait_for.js --text "Loaded" --timeout 60000
node scripts/performance_stop_trace.js
# Check timing metrics in output
```

---

## General Best Practices

### Always Snapshot Before Interaction

UIDs are dynamic. Take a fresh snapshot before every interaction:

```bash
# Good pattern
node scripts/take_snapshot.js
node scripts/click.js --uid <current-uid>

# Bad pattern (will fail)
# node scripts/take_snapshot.js
# ... do other things ...
# node scripts/click.js --uid <old-uid>  # UID expired!
```

### Wait After Actions

Allow time for UI updates:

```bash
node scripts/click.js --uid button_submit
node scripts/wait_for.js --text "Success" --timeout 5000
node scripts/take_snapshot.js
```

### Use Absolute Paths

Always use absolute paths for files:

```bash
# Good
/Users/username/documents/file.pdf
/home/user/screenshots/page.png

# Bad
./file.pdf
../screenshots/page.png
```

### Check Connection First

Before running workflows, verify mcp2rest is healthy:

```bash
curl http://localhost:28888/health
```

### List Before Selecting

Always list pages before selecting or closing:

```bash
node scripts/list_pages.js
node scripts/select_page.js --pageIdx 1
```

### Handle Errors Gracefully

Check console and network for debugging:

```bash
# After error occurs
node scripts/list_console_messages.js --types error
node scripts/list_network_requests.js
node scripts/take_screenshot.js --filePath error_state.png
```

### Use Verbose for Debugging

Get more details when troubleshooting:

```bash
node scripts/take_snapshot.js --verbose true
```

### Save Outputs for Analysis

Redirect output to files for later review:

```bash
node scripts/list_console_messages.js > console_log.txt
node scripts/list_network_requests.js > network_log.txt
node scripts/take_snapshot.js --filePath snapshot.txt
```

---

## Getting Help

If you encounter issues not covered here:

1. **Check tool documentation:** @reference/all-tools.md
2. **Review workflows:** @workflows/[tool-group].md
3. **Test with minimal example:** Isolate the problem with simplest reproduction
4. **Check mcp2rest status:** Ensure server is connected and healthy
5. **Restart mcp2rest:** Sometimes a fresh start helps: `mcp2rest restart`
