# Performance Analysis Workflows

Advanced tools for JavaScript execution, performance tracing, device emulation, and automation utilities.

## Tools in This Group

### evaluate_script
Executes JavaScript code in the page context and returns JSON-serializable results.

**Required:** `--function FUNCTION_STRING`
**Optional:** `--args JSON_ARRAY`

```bash
# Simple extraction
node scripts/evaluate_script.js --function "() => document.title"

# With parameters
node scripts/evaluate_script.js --function "(x, y) => x + y" --args '[5, 3]'

# Complex extraction
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('h2')).map(h => h.textContent)"
```

### wait_for
Waits for specific text to appear on the page (for dynamic content loading).

**Required:** `--text TEXT`
**Optional:** `--timeout MILLISECONDS`

```bash
# Wait up to 10 seconds
node scripts/wait_for.js --text "Loading complete" --timeout 10000

# Wait for error message
node scripts/wait_for.js --text "Error" --timeout 5000
```

### handle_dialog
Handles browser dialogs (alert, confirm, prompt).

**Required:** `--action [accept|dismiss]`
**Optional:** `--promptText TEXT`

```bash
# Accept alert
node scripts/handle_dialog.js --action accept

# Dismiss confirm
node scripts/handle_dialog.js --action dismiss

# Accept prompt with text
node scripts/handle_dialog.js --action accept --promptText "User input"
```

### emulate
Emulates network conditions and CPU throttling.

**Optional:** `--networkConditions JSON`, `--cpuThrottlingRate NUMBER`

```bash
# Slow 3G network
node scripts/emulate.js --networkConditions '{"downloadThroughput":50000,"uploadThroughput":50000,"latency":2000}'

# 4x CPU throttling
node scripts/emulate.js --cpuThrottlingRate 4

# Both
node scripts/emulate.js --networkConditions '{"downloadThroughput":100000,"uploadThroughput":50000,"latency":100}' --cpuThrottlingRate 2
```

### performance_start_trace
Starts recording performance trace for Core Web Vitals and performance insights.

**Required:** `--reload [true|false]`, `--autoStop [true|false]`

```bash
# Start tracing with page reload
node scripts/performance_start_trace.js --reload true --autoStop false

# Start tracing without reload
node scripts/performance_start_trace.js --reload false --autoStop true
```

### performance_stop_trace
Stops the active performance trace and returns results.

```bash
node scripts/performance_stop_trace.js
```

**Output includes:**
- Core Web Vitals: LCP, FID, CLS scores
- Performance insights and recommendations
- Insight set IDs for detailed analysis

### performance_analyze_insight
Gets detailed information about a specific performance insight.

**Required:** `--insightSetId SET_ID`, `--insightName INSIGHT_NAME`

```bash
node scripts/performance_analyze_insight.js --insightSetId set_abc123 --insightName LargestContentfulPaint
```

## Workflows

### Workflow: Extract Structured Data

Scrape data from pages using JavaScript:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/products`
- [ ] Wait for load: `node scripts/wait_for.js --text "Products" --timeout 10000`
- [ ] Extract product titles:
```bash
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.product-title')).map(el => el.textContent)"
```
- [ ] Extract product prices:
```bash
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.product-price')).map(el => el.textContent)"
```
- [ ] Extract complete product data:
```bash
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.product')).map(p => ({title: p.querySelector('.title').textContent, price: p.querySelector('.price').textContent, id: p.dataset.id}))"
```

**Expected Output:**
Structured JSON data extracted from page, ready for processing.

### Workflow: Comprehensive Performance Analysis

Measure page performance and Core Web Vitals:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/landing`
- [ ] Start trace with reload: `node scripts/performance_start_trace.js --reload true --autoStop false`
- [ ] Wait for page load: `node scripts/wait_for.js --text "Get Started" --timeout 20000`
- [ ] Interact with page: `node scripts/click.js --uid button_cta`
- [ ] Wait for interaction: `node scripts/wait_for.js --text "Form" --timeout 5000`
- [ ] Stop trace: `node scripts/performance_stop_trace.js`
- [ ] Review output for:
  - LCP (Largest Contentful Paint) - should be < 2.5s
  - FID (First Input Delay) - should be < 100ms
  - CLS (Cumulative Layout Shift) - should be < 0.1
  - Performance insights list
- [ ] Analyze specific insight: `node scripts/performance_analyze_insight.js --insightSetId <set-id> --insightName LargestContentfulPaint`

**Expected Output:**
Full performance profile, CWV scores, actionable insights for optimization.

### Workflow: Test Under Network Constraints

Simulate slow connections:

- [ ] Set up slow 3G: `node scripts/emulate.js --networkConditions '{"downloadThroughput":50000,"uploadThroughput":50000,"latency":2000}'`
- [ ] Open page: `node scripts/new_page.js --url https://example.com --timeout 60000`
- [ ] Start performance trace: `node scripts/performance_start_trace.js --reload true --autoStop false`
- [ ] Wait for load: `node scripts/wait_for.js --text "Content" --timeout 60000`
- [ ] Stop trace: `node scripts/performance_stop_trace.js`
- [ ] Review load times: Check trace output for timing metrics
- [ ] Screenshot loaded state: `node scripts/take_screenshot.js --filePath slow_3g_loaded.png`
- [ ] Reset to fast network: `node scripts/emulate.js --networkConditions '{"downloadThroughput":10000000,"uploadThroughput":10000000,"latency":10}'`

**Expected Output:**
Page behavior under slow network documented, performance impact measured.

### Workflow: CPU Throttling Test

Test performance on low-powered devices:

- [ ] Apply 4x throttling: `node scripts/emulate.js --cpuThrottlingRate 4`
- [ ] Open app: `node scripts/new_page.js --url https://example.com/app`
- [ ] Start trace: `node scripts/performance_start_trace.js --reload true --autoStop false`
- [ ] Interact with heavy UI: `node scripts/click.js --uid button_render_chart`
- [ ] Wait for render: `node scripts/wait_for.js --text "Chart loaded" --timeout 30000`
- [ ] Stop trace: `node scripts/performance_stop_trace.js`
- [ ] Check JavaScript execution time in trace output
- [ ] Remove throttling: `node scripts/emulate.js --cpuThrottlingRate 1`
- [ ] Repeat test for comparison

**Expected Output:**
Performance comparison between throttled and normal CPU, bottlenecks identified.

### Workflow: Handle Dynamic Content Loading

Work with lazy-loaded content:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/infinite-scroll`
- [ ] Wait for initial load: `node scripts/wait_for.js --text "Item 1" --timeout 5000`
- [ ] Scroll to bottom: `node scripts/evaluate_script.js --function "() => window.scrollTo(0, document.body.scrollHeight)"`
- [ ] Wait for more items: `node scripts/wait_for.js --text "Item 20" --timeout 10000`
- [ ] Take snapshot: `node scripts/take_snapshot.js`
- [ ] Scroll again: `node scripts/evaluate_script.js --function "() => window.scrollTo(0, document.body.scrollHeight)"`
- [ ] Wait for more: `node scripts/wait_for.js --text "Item 40" --timeout 10000`
- [ ] Extract all items:
```bash
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.item')).length"
```

**Expected Output:**
All lazy-loaded content triggered and captured, full list extracted.

### Workflow: Automated Dialog Handling

Automate flows with browser dialogs:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/confirm-action`
- [ ] Click delete button: `node scripts/click.js --uid button_delete`
- [ ] Handle confirm dialog: `node scripts/handle_dialog.js --action accept`
- [ ] Wait for deletion: `node scripts/wait_for.js --text "Deleted successfully" --timeout 5000`
- [ ] Verify: `node scripts/take_snapshot.js`

**For prompt dialog:**
```bash
# Click button that opens prompt
node scripts/click.js --uid button_rename

# Enter new name and accept
node scripts/handle_dialog.js --action accept --promptText "New Name"

# Verify change
node scripts/wait_for.js --text "New Name" --timeout 3000
```

**Expected Output:**
Browser dialogs handled automatically, flow completes without manual intervention.

### Workflow: Custom Metrics Collection

Collect custom performance metrics:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/dashboard`
- [ ] Wait for load: `node scripts/wait_for.js --text "Dashboard" --timeout 10000`
- [ ] Get page load time:
```bash
node scripts/evaluate_script.js --function "() => performance.timing.loadEventEnd - performance.timing.navigationStart"
```
- [ ] Get resource count:
```bash
node scripts/evaluate_script.js --function "() => performance.getEntriesByType('resource').length"
```
- [ ] Get memory usage (if available):
```bash
node scripts/evaluate_script.js --function "() => performance.memory ? performance.memory.usedJSHeapSize : null"
```
- [ ] Get paint timings:
```bash
node scripts/evaluate_script.js --function "() => performance.getEntriesByType('paint').map(p => ({name: p.name, time: p.startTime}))"
```

**Expected Output:**
Custom performance metrics collected via Performance API, specific to your needs.

### Workflow: A/B Test Performance Comparison

Compare performance across variants:

- [ ] **Variant A:**
  - [ ] Open: `node scripts/new_page.js --url https://example.com?variant=a`
  - [ ] Trace: `node scripts/performance_start_trace.js --reload true --autoStop false`
  - [ ] Wait: `node scripts/wait_for.js --text "Content" --timeout 15000`
  - [ ] Stop: `node scripts/performance_stop_trace.js > variant_a_trace.txt`
  - [ ] Screenshot: `node scripts/take_screenshot.js --filePath variant_a.png`
- [ ] **Variant B:**
  - [ ] Navigate: `node scripts/navigate_page.js --url https://example.com?variant=b`
  - [ ] Trace: `node scripts/performance_start_trace.js --reload true --autoStop false`
  - [ ] Wait: `node scripts/wait_for.js --text "Content" --timeout 15000`
  - [ ] Stop: `node scripts/performance_stop_trace.js > variant_b_trace.txt`
  - [ ] Screenshot: `node scripts/take_screenshot.js --filePath variant_b.png`
- [ ] Compare CWV scores from both trace files

**Expected Output:**
Performance metrics for both variants, data-driven comparison for optimization.

## Common Patterns

### Pattern: Safe Script Evaluation

Always return JSON-serializable data:

```bash
# Good: Returns string
node scripts/evaluate_script.js --function "() => document.title"

# Good: Returns array of strings
node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('a')).map(a => a.href)"

# Bad: Returns DOM nodes (not serializable)
# node scripts/evaluate_script.js --function "() => document.querySelectorAll('a')"
```

### Pattern: Wait Before Interaction

Always wait for dynamic content:

```bash
# 1. Trigger action
node scripts/click.js --uid button_load

# 2. Wait for content
node scripts/wait_for.js --text "Loaded" --timeout 10000

# 3. Now safe to interact
node scripts/take_snapshot.js
```

### Pattern: Complete Performance Workflow

Standard performance analysis sequence:

```bash
# 1. Start tracing
node scripts/performance_start_trace.js --reload true --autoStop false

# 2. Let page load completely
node scripts/wait_for.js --text "Ready" --timeout 20000

# 3. Stop tracing
node scripts/performance_stop_trace.js

# 4. Analyze specific insights
node scripts/performance_analyze_insight.js --insightSetId <id> --insightName <name>
```

### Pattern: Emulation Reset

Reset emulation to normal after testing:

```bash
# 1. Test under constraints
node scripts/emulate.js --cpuThrottlingRate 4

# ... run tests ...

# 2. Reset to normal
node scripts/emulate.js --cpuThrottlingRate 1
```

## Troubleshooting

**Problem:** evaluate_script returns null or error

**Solution:**
- Ensure function returns JSON-serializable values (no DOM nodes, functions, or circular references)
- Use .map() to extract primitive values from DOM elements
- Check browser console for JavaScript errors: `list_console_messages.js --types error`

**Problem:** wait_for times out

**Solution:**
- Increase timeout: `--timeout 30000` (30 seconds)
- Verify text actually appears on page (check with `take_snapshot.js`)
- Text match is exact - check spelling and case
- Wait for network to finish if text appears after API call

**Problem:** Dialog not handled

**Solution:**
- Dialog must be already open when you call `handle_dialog.js`
- Trigger dialog first (e.g., click button), then immediately call `handle_dialog.js`
- Some "dialogs" are custom HTML, not browser dialogs - use `click.js` instead

**Problem:** Performance trace shows unexpected results

**Solution:**
- Ensure page fully loads before stopping trace
- Use `--reload true` for consistent initial page load measurement
- Clear browser cache if testing first-time load performance
- Disable browser extensions that might affect performance

**Problem:** Emulation not working

**Solution:**
- Emulation settings persist for the session
- To remove emulation, set back to normal values
- Network conditions JSON must be valid with all three properties
- CPU throttling rate of 1 = normal, higher = slower

**Problem:** Script evaluation with args fails

**Solution:**
- Args must be valid JSON array: `--args '[1, 2, 3]'`
- Function must accept the correct number of parameters
- Use single quotes around JSON, double quotes inside
- Example: `--function "(a, b) => a + b" --args '[5, 10]'`
