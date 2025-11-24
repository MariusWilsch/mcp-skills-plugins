# Advanced Examples

Complex workflows and advanced usage patterns for chrome-devtools.

## Table of Contents

- [E2E Testing Workflows](#e2e-testing-workflows)
- [Web Scraping Patterns](#web-scraping-patterns)
- [Performance Optimization](#performance-optimization)
- [CI/CD Integration](#cicd-integration)
- [Cross-Browser Testing Simulation](#cross-browser-testing-simulation)
- [Advanced JavaScript Extraction](#advanced-javascript-extraction)

---

## E2E Testing Workflows

### Complete User Registration Flow

Test full registration process with validation:

```bash
#!/bin/bash
# test_registration.sh

echo "Starting registration flow test..."

# 1. Open registration page
node scripts/new_page.js --url https://example.com/register

# 2. Wait for page load
node scripts/wait_for.js --text "Create Account" --timeout 10000

# 3. Get form structure
node scripts/take_snapshot.js --filePath registration_form.txt

# 4. Fill registration form (update UIDs from snapshot)
node scripts/fill_form.js --elements '[
  {"uid":"input_firstname","value":"John"},
  {"uid":"input_lastname","value":"Doe"},
  {"uid":"input_email","value":"john.doe@example.com"},
  {"uid":"input_password","value":"SecurePass123!"},
  {"uid":"input_password_confirm","value":"SecurePass123!"},
  {"uid":"select_country","value":"United States"}
]'

# 5. Screenshot before submission
node scripts/take_screenshot.js --filePath before_submit.png

# 6. Accept terms checkbox
node scripts/click.js --uid checkbox_terms

# 7. Submit form
node scripts/click.js --uid button_register

# 8. Wait for success message
if node scripts/wait_for.js --text "Registration successful" --timeout 15000; then
  echo "✓ Registration succeeded"

  # 9. Capture success state
  node scripts/take_screenshot.js --filePath registration_success.png
  node scripts/take_snapshot.js --filePath success_page.txt

  # 10. Check for welcome email notification
  node scripts/wait_for.js --text "Verification email sent" --timeout 5000

  echo "✓ Test passed: Registration flow complete"
  exit 0
else
  echo "✗ Registration failed"

  # Capture error state
  node scripts/take_screenshot.js --filePath registration_error.png
  node scripts/list_console_messages.js --types error > console_errors.txt

  echo "✗ Test failed: See error screenshots and logs"
  exit 1
fi
```

### Shopping Cart Checkout Flow

Test complete e-commerce checkout:

```bash
#!/bin/bash
# test_checkout.sh

echo "Testing checkout flow..."

# 1. Navigate to product page
node scripts/new_page.js --url https://example.com/products/widget-123

# 2. Wait and verify product loads
node scripts/wait_for.js --text "Add to Cart" --timeout 10000
node scripts/take_snapshot.js > product_page.txt

# 3. Add to cart
node scripts/click.js --uid button_add_to_cart
node scripts/wait_for.js --text "Added to cart" --timeout 5000

# 4. Go to cart
node scripts/click.js --uid link_view_cart
node scripts/wait_for.js --text "Shopping Cart" --timeout 5000

# 5. Verify cart contents
node scripts/take_snapshot.js --filePath cart_contents.txt
node scripts/evaluate_script.js --function "() => document.querySelector('.cart-total').textContent" > cart_total.txt

# 6. Proceed to checkout
node scripts/click.js --uid button_checkout
node scripts/wait_for.js --text "Shipping Information" --timeout 10000

# 7. Fill shipping info
node scripts/fill_form.js --elements '[
  {"uid":"input_address","value":"123 Main Street"},
  {"uid":"input_city","value":"San Francisco"},
  {"uid":"input_state","value":"CA"},
  {"uid":"input_zip","value":"94102"}
]'

# 8. Continue to payment
node scripts/click.js --uid button_continue
node scripts/wait_for.js --text "Payment Method" --timeout 10000

# 9. Select payment method
node scripts/click.js --uid radio_credit_card

# 10. Fill payment info (test mode)
node scripts/fill_form.js --elements '[
  {"uid":"input_card_number","value":"4242424242424242"},
  {"uid":"input_card_expiry","value":"12/25"},
  {"uid":"input_card_cvc","value":"123"}
]'

# 11. Place order
node scripts/click.js --uid button_place_order
node scripts/wait_for.js --text "Order Confirmed" --timeout 20000

# 12. Capture confirmation
node scripts/take_screenshot.js --filePath order_confirmation.png
node scripts/evaluate_script.js --function "() => ({orderNumber: document.querySelector('.order-number').textContent, total: document.querySelector('.order-total').textContent})" > order_details.json

echo "✓ Checkout flow completed successfully"
```

---

## Web Scraping Patterns

### Multi-Page Data Extraction

Scrape data across paginated results:

```bash
#!/bin/bash
# scrape_listings.sh

BASE_URL="https://example.com/listings"
OUTPUT_FILE="all_listings.json"
MAX_PAGES=10

echo "[" > $OUTPUT_FILE

for page in $(seq 1 $MAX_PAGES); do
  echo "Scraping page $page..."

  # Navigate to page
  if [ $page -eq 1 ]; then
    node scripts/new_page.js --url "$BASE_URL"
  else
    node scripts/navigate_page.js --url "$BASE_URL?page=$page"
  fi

  # Wait for listings to load
  node scripts/wait_for.js --text "listings found" --timeout 10000

  # Extract listings data
  LISTINGS=$(node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.listing')).map(item => ({
    title: item.querySelector('.title').textContent.trim(),
    price: item.querySelector('.price').textContent.trim(),
    location: item.querySelector('.location').textContent.trim(),
    url: item.querySelector('a').href
  }))")

  # Append to output (remove outer brackets)
  echo "$LISTINGS" | jq '.[]' >> $OUTPUT_FILE

  # Check if there's a next page
  HAS_NEXT=$(node scripts/evaluate_script.js --function "() => document.querySelector('.pagination .next') !== null")

  if [ "$HAS_NEXT" != "true" ]; then
    echo "Reached last page at page $page"
    break
  fi

  # Add comma separator
  if [ $page -lt $MAX_PAGES ]; then
    echo "," >> $OUTPUT_FILE
  fi

  # Be polite: wait between requests
  sleep 2
done

echo "]" >> $OUTPUT_FILE

echo "✓ Scraped listings saved to $OUTPUT_FILE"

# Summary statistics
TOTAL=$(cat $OUTPUT_FILE | jq 'length')
echo "Total listings extracted: $TOTAL"
```

### Dynamic Content Scraping with Infinite Scroll

Extract data from infinite scroll pages:

```bash
#!/bin/bash
# scrape_infinite_scroll.sh

echo "Scraping infinite scroll content..."

# Open page
node scripts/new_page.js --url https://example.com/feed

# Wait for initial content
node scripts/wait_for.js --text "Post" --timeout 10000

# Initialize
PREVIOUS_COUNT=0
SCROLL_ATTEMPTS=0
MAX_SCROLLS=20
OUTPUT_FILE="feed_items.json"

while [ $SCROLL_ATTEMPTS -lt $MAX_SCROLLS ]; do
  # Count current items
  CURRENT_COUNT=$(node scripts/evaluate_script.js --function "() => document.querySelectorAll('.feed-item').length")

  echo "Scroll $SCROLL_ATTEMPTS: Found $CURRENT_COUNT items"

  # Check if we got new items
  if [ "$CURRENT_COUNT" -eq "$PREVIOUS_COUNT" ]; then
    echo "No new items loaded, reached end"
    break
  fi

  PREVIOUS_COUNT=$CURRENT_COUNT

  # Scroll to bottom
  node scripts/evaluate_script.js --function "() => window.scrollTo(0, document.body.scrollHeight)"

  # Wait for new content to load
  sleep 2

  SCROLL_ATTEMPTS=$((SCROLL_ATTEMPTS + 1))
done

# Extract all items
echo "Extracting all $CURRENT_COUNT items..."

node scripts/evaluate_script.js --function "() => Array.from(document.querySelectorAll('.feed-item')).map(item => ({
  author: item.querySelector('.author').textContent.trim(),
  content: item.querySelector('.content').textContent.trim(),
  timestamp: item.querySelector('.timestamp').textContent.trim(),
  likes: item.querySelector('.likes').textContent.trim()
}))" > $OUTPUT_FILE

echo "✓ Extracted $CURRENT_COUNT items to $OUTPUT_FILE"
```

---

## Performance Optimization

### Automated Performance Regression Testing

Compare performance across builds:

```bash
#!/bin/bash
# performance_regression_test.sh

BASELINE_URL="https://staging.example.com"
CURRENT_URL="https://production.example.com"

echo "Running performance regression tests..."

# Test baseline (staging)
echo "Testing baseline: $BASELINE_URL"

node scripts/new_page.js --url "$BASELINE_URL"
node scripts/performance_start_trace.js --reload true --autoStop false
node scripts/wait_for.js --text "Ready" --timeout 30000
node scripts/performance_stop_trace.js > baseline_trace.json

BASELINE_LCP=$(cat baseline_trace.json | jq -r '.metrics.LCP.value')
BASELINE_FID=$(cat baseline_trace.json | jq -r '.metrics.FID.value')
BASELINE_CLS=$(cat baseline_trace.json | jq -r '.metrics.CLS.value')

echo "Baseline: LCP=$BASELINE_LCP, FID=$BASELINE_FID, CLS=$BASELINE_CLS"

# Test current (production)
echo "Testing current: $CURRENT_URL"

node scripts/navigate_page.js --url "$CURRENT_URL"
node scripts/performance_start_trace.js --reload true --autoStop false
node scripts/wait_for.js --text "Ready" --timeout 30000
node scripts/performance_stop_trace.js > current_trace.json

CURRENT_LCP=$(cat current_trace.json | jq -r '.metrics.LCP.value')
CURRENT_FID=$(cat current_trace.json | jq -r '.metrics.FID.value')
CURRENT_CLS=$(cat current_trace.json | jq -r '.metrics.CLS.value')

echo "Current: LCP=$CURRENT_LCP, FID=$CURRENT_FID, CLS=$CURRENT_CLS"

# Compare (allow 10% regression threshold)
THRESHOLD=1.1
FAILED=false

LCP_RATIO=$(echo "scale=2; $CURRENT_LCP / $BASELINE_LCP" | bc)
if (( $(echo "$LCP_RATIO > $THRESHOLD" | bc -l) )); then
  echo "✗ LCP regression detected: ${CURRENT_LCP}ms vs ${BASELINE_LCP}ms"
  FAILED=true
else
  echo "✓ LCP within threshold"
fi

FID_RATIO=$(echo "scale=2; $CURRENT_FID / $BASELINE_FID" | bc)
if (( $(echo "$FID_RATIO > $THRESHOLD" | bc -l) )); then
  echo "✗ FID regression detected: ${CURRENT_FID}ms vs ${BASELINE_FID}ms"
  FAILED=true
else
  echo "✓ FID within threshold"
fi

CLS_RATIO=$(echo "scale=2; $CURRENT_CLS / $BASELINE_CLS" | bc)
if (( $(echo "$CLS_RATIO > $THRESHOLD" | bc -l) )); then
  echo "✗ CLS regression detected: ${CURRENT_CLS} vs ${BASELINE_CLS}"
  FAILED=true
else
  echo "✓ CLS within threshold"
fi

if [ "$FAILED" = true ]; then
  echo "Performance regression test FAILED"
  exit 1
else
  echo "Performance regression test PASSED"
  exit 0
fi
```

### Network Performance Testing Matrix

Test performance across network conditions:

```bash
#!/bin/bash
# network_performance_matrix.sh

URL="https://example.com"
OUTPUT_DIR="performance_results"

mkdir -p $OUTPUT_DIR

# Define network profiles
declare -A NETWORKS
NETWORKS["fast"]='{"downloadThroughput":10000000,"uploadThroughput":10000000,"latency":10}'
NETWORKS["4g"]='{"downloadThroughput":1600000,"uploadThroughput":750000,"latency":150}'
NETWORKS["3g"]='{"downloadThroughput":180000,"uploadThroughput":84000,"latency":562}'
NETWORKS["slow-3g"]='{"downloadThroughput":50000,"uploadThroughput":50000,"latency":2000}'

echo "Testing performance across network conditions..."

# Open page once
node scripts/new_page.js --url "$URL"

for profile in "${!NETWORKS[@]}"; do
  echo "Testing network profile: $profile"

  # Apply network emulation
  node scripts/emulate.js --networkConditions "${NETWORKS[$profile]}"

  # Run performance trace
  node scripts/performance_start_trace.js --reload true --autoStop false
  node scripts/wait_for.js --text "Ready" --timeout 60000
  node scripts/performance_stop_trace.js > "$OUTPUT_DIR/${profile}_trace.json"

  # Extract key metrics
  LCP=$(cat "$OUTPUT_DIR/${profile}_trace.json" | jq -r '.metrics.LCP.value')
  FID=$(cat "$OUTPUT_DIR/${profile}_trace.json" | jq -r '.metrics.FID.value')
  CLS=$(cat "$OUTPUT_DIR/${profile}_trace.json" | jq -r '.metrics.CLS.value')

  echo "$profile: LCP=${LCP}ms, FID=${FID}ms, CLS=$CLS"

  # Capture screenshot
  node scripts/take_screenshot.js --filePath "$OUTPUT_DIR/${profile}_loaded.png"
done

# Reset to normal
node scripts/emulate.js --cpuThrottlingRate 1

echo "✓ Performance testing complete. Results in $OUTPUT_DIR/"
```

---

## CI/CD Integration

### GitHub Actions Workflow

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'

    - name: Install mcp2skill-tools
      run: |
        npm install -g mcp2skill-tools

    - name: Start mcp2rest
      run: |
        mcp2rest start
        mcp2rest add chrome-devtools

    - name: Install skill dependencies
      run: |
        cd ~/.claude/skills/mcp-chrome-devtools/scripts
        npm install

    - name: Run E2E tests
      run: |
        cd tests
        bash test_registration.sh
        bash test_checkout.sh
        bash test_search.sh

    - name: Upload test artifacts
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: test-results
        path: |
          **/*.png
          **/*.txt
          **/*.json

    - name: Stop mcp2rest
      if: always()
      run: mcp2rest stop
```

### Jenkins Pipeline

```groovy
// Jenkinsfile
pipeline {
    agent any

    environment {
        NODE_VERSION = '18'
    }

    stages {
        stage('Setup') {
            steps {
                sh 'npm install -g mcp2skill-tools'
                sh 'mcp2rest start'
                sh 'mcp2rest add chrome-devtools'
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('~/.claude/skills/mcp-chrome-devtools/scripts') {
                    sh 'npm install'
                }
            }
        }

        stage('E2E Tests') {
            parallel {
                stage('Registration Flow') {
                    steps {
                        sh 'bash tests/test_registration.sh'
                    }
                }
                stage('Checkout Flow') {
                    steps {
                        sh 'bash tests/test_checkout.sh'
                    }
                }
                stage('Search Flow') {
                    steps {
                        sh 'bash tests/test_search.sh'
                    }
                }
            }
        }

        stage('Performance Tests') {
            steps {
                sh 'bash tests/performance_regression_test.sh'
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: '**/*.png,**/*.txt,**/*.json', allowEmptyArchive: true
            sh 'mcp2rest stop'
        }
        failure {
            emailext (
                subject: "E2E Tests Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Check console output at ${env.BUILD_URL}",
                to: "team@example.com"
            )
        }
    }
}
```

---

## Cross-Browser Testing Simulation

### Device Emulation Matrix

```bash
#!/bin/bash
# device_matrix_test.sh

URL="https://example.com"
OUTPUT_DIR="device_screenshots"

mkdir -p $OUTPUT_DIR

# Define device viewports
declare -A DEVICES
DEVICES["desktop_1080"]="1920 1080"
DEVICES["desktop_720"]="1280 720"
DEVICES["laptop"]="1366 768"
DEVICES["ipad_portrait"]="768 1024"
DEVICES["ipad_landscape"]="1024 768"
DEVICES["iphone_portrait"]="375 667"
DEVICES["iphone_landscape"]="667 375"
DEVICES["android_portrait"]="360 640"
DEVICES["android_landscape"]="640 360"

echo "Testing across device viewports..."

# Open page
node scripts/new_page.js --url "$URL"

for device in "${!DEVICES[@]}"; do
  echo "Testing device: $device"

  # Parse dimensions
  read -r width height <<< "${DEVICES[$device]}"

  # Resize window
  node scripts/resize_page.js --width $width --height $height

  # Wait for reflow
  sleep 2

  # Capture screenshot
  node scripts/take_screenshot.js --fullPage true --filePath "$OUTPUT_DIR/${device}.png"

  # Capture snapshot for debugging
  node scripts/take_snapshot.js --filePath "$OUTPUT_DIR/${device}_snapshot.txt"
done

echo "✓ Device matrix testing complete. Screenshots in $OUTPUT_DIR/"
```

---

## Advanced JavaScript Extraction

### Extract Structured Data from SPA

```bash
#!/bin/bash
# extract_spa_data.sh

echo "Extracting data from Single Page Application..."

# Open SPA
node scripts/new_page.js --url https://example.com/dashboard

# Wait for app to initialize
node scripts/wait_for.js --text "Dashboard" --timeout 15000

# Wait for data to load (check for spinner to disappear)
node scripts/evaluate_script.js --function "() => new Promise(resolve => {
  const checkSpinner = setInterval(() => {
    if (!document.querySelector('.loading-spinner')) {
      clearInterval(checkSpinner);
      resolve(true);
    }
  }, 100);
})"

# Extract React/Vue component state
APP_STATE=$(node scripts/evaluate_script.js --function "() => {
  // Try to access React DevTools state
  const root = document.querySelector('#root');
  const reactInternals = root._reactRootContainer || root._reactInternalFiber;

  // Or access Vue instance
  const vueInstance = root.__vue__;

  // Extract data from global state (Redux, Vuex, etc.)
  return {
    redux: window.__REDUX_DEVTOOLS_EXTENSION__ ? window.store.getState() : null,
    vuex: window.__VUEX_DEVTOOLS_GLOBAL_HOOK__ ? window.$store.state : null,
    // Or extract directly from DOM
    domData: Array.from(document.querySelectorAll('.data-item')).map(item => ({
      id: item.dataset.id,
      title: item.querySelector('.title').textContent,
      value: item.querySelector('.value').textContent
    }))
  };
}")

echo "$APP_STATE" | jq '.' > app_state.json

echo "✓ Extracted application state to app_state.json"
```

### Monitor Real-Time Updates

```bash
#!/bin/bash
# monitor_realtime_updates.sh

echo "Monitoring real-time updates..."

# Open page with real-time data
node scripts/new_page.js --url https://example.com/live-feed

# Set up monitoring script
node scripts/evaluate_script.js --function "() => {
  window.updates = [];
  window.observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.classList && node.classList.contains('update-item')) {
            window.updates.push({
              timestamp: new Date().toISOString(),
              content: node.textContent,
              type: node.dataset.type
            });
          }
        });
      }
    });
  });

  const container = document.querySelector('.updates-container');
  window.observer.observe(container, { childList: true, subtree: true });

  return 'Monitoring started';
}"

# Wait for updates to accumulate
echo "Collecting updates for 60 seconds..."
sleep 60

# Retrieve collected updates
UPDATES=$(node scripts/evaluate_script.js --function "() => window.updates")

echo "$UPDATES" | jq '.' > realtime_updates.json

# Clean up
node scripts/evaluate_script.js --function "() => { window.observer.disconnect(); return 'Monitoring stopped'; }"

echo "✓ Collected updates saved to realtime_updates.json"
```

---

## Complex Workflow Orchestration

### Multi-User Simulation

```bash
#!/bin/bash
# simulate_multi_user.sh

echo "Simulating multi-user interactions..."

# User 1: Admin workflow
(
  echo "User 1: Admin actions"
  node scripts/new_page.js --url https://example.com/admin
  node scripts/wait_for.js --text "Admin Panel" --timeout 10000
  # ... admin actions ...
) &

# User 2: Customer workflow
(
  echo "User 2: Customer actions"
  node scripts/new_page.js --url https://example.com/shop
  node scripts/wait_for.js --text "Products" --timeout 10000
  # ... customer actions ...
) &

# Wait for both users to complete
wait

echo "✓ Multi-user simulation complete"
```

This advanced examples reference provides production-ready patterns for complex automation, testing, and data extraction workflows.
