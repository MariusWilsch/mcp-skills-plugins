# Element Interaction Workflows

User input simulation for clicking, typing, form filling, and drag & drop operations.

## Tools in This Group

### click
Clicks on an element identified by its UID.

**Required:** `--uid UID`
**Optional:** `--dblClick [true|false]`

```bash
# Single click
node scripts/click.js --uid button_submit_abc123

# Double click
node scripts/click.js --uid file_icon_xyz789 --dblClick true
```

### fill
Types text into inputs, textareas, or selects options in dropdown menus.

**Required:** `--uid UID --value VALUE`

```bash
# Fill text input
node scripts/fill.js --uid input_username_abc --value john.doe

# Fill textarea
node scripts/fill.js --uid textarea_comment_def --value "This is a comment"

# Select dropdown option
node scripts/fill.js --uid select_country_ghi --value "United States"
```

### fill_form
Fills multiple form fields at once using a JSON array.

**Required:** `--elements JSON_ARRAY`

```bash
node scripts/fill_form.js --elements '[{"uid":"input_email","value":"test@example.com"},{"uid":"input_password","value":"secret123"}]'
```

### hover
Hovers the mouse over an element.

**Required:** `--uid UID`

```bash
node scripts/hover.js --uid tooltip_trigger_abc
```

### drag
Drags one element onto another element.

**Required:** `--from-uid FROM_UID --to-uid TO_UID`

```bash
node scripts/drag.js --from-uid draggable_item_abc --to-uid dropzone_xyz
```

### upload_file
Uploads a file through a file input element.

**Required:** `--uid UID --filePath FILEPATH`

```bash
node scripts/upload_file.js --uid input_file_upload --filePath /Users/username/documents/resume.pdf
```

### press_key
Presses a key or key combination (for keyboard shortcuts, navigation, special keys).

**Required:** `--key KEY`

```bash
# Single key
node scripts/press_key.js --key Enter

# Key combination
node scripts/press_key.js --key "Control+S"

# Navigation
node scripts/press_key.js --key ArrowDown
```

## Workflows

### Workflow: Login Form Automation

Complete login process with validation:

- [ ] Open login page: `node scripts/new_page.js --url https://example.com/login`
- [ ] Wait for form: `node scripts/wait_for.js --text "Sign In" --timeout 5000`
- [ ] Get element UIDs: `node scripts/take_snapshot.js`
- [ ] Fill username: `node scripts/fill.js --uid input_username_a1b2 --value testuser`
- [ ] Fill password: `node scripts/fill.js --uid input_password_c3d4 --value mypassword123`
- [ ] Submit form: `node scripts/click.js --uid button_submit_e5f6`
- [ ] Wait for redirect: `node scripts/wait_for.js --text "Dashboard" --timeout 10000`
- [ ] Verify login: `node scripts/take_screenshot.js --filePath logged_in.png`

**Input Example:**
```
Username field UID: input_username_a1b2
Password field UID: input_password_c3d4
Submit button UID: button_submit_e5f6
```

**Expected Output:**
User logged in successfully, redirected to dashboard.

### Workflow: Multi-Field Form with Dropdowns

Fill complex form with various input types:

- [ ] Navigate to form: `node scripts/new_page.js --url https://example.com/signup`
- [ ] Get structure: `node scripts/take_snapshot.js`
- [ ] Fill first name: `node scripts/fill.js --uid input_firstname --value John`
- [ ] Fill last name: `node scripts/fill.js --uid input_lastname --value Doe`
- [ ] Fill email: `node scripts/fill.js --uid input_email --value john.doe@example.com`
- [ ] Select country: `node scripts/fill.js --uid select_country --value "United States"`
- [ ] Select state: `node scripts/fill.js --uid select_state --value California`
- [ ] Fill textarea: `node scripts/fill.js --uid textarea_bio --value "Software engineer with 5 years experience"`
- [ ] Submit: `node scripts/click.js --uid button_register`
- [ ] Verify: `node scripts/wait_for.js --text "Registration successful" --timeout 10000`

**Expected Output:**
All form fields filled correctly, registration completed.

### Workflow: Bulk Form Filling

Use fill_form for efficient multi-field updates:

- [ ] Open form: `node scripts/new_page.js --url https://example.com/profile`
- [ ] Identify UIDs: `node scripts/take_snapshot.js`
- [ ] Fill all fields at once:
```bash
node scripts/fill_form.js --elements '[
  {"uid":"input_name","value":"John Doe"},
  {"uid":"input_email","value":"john@example.com"},
  {"uid":"input_phone","value":"555-1234"},
  {"uid":"select_timezone","value":"America/Los_Angeles"}
]'
```
- [ ] Review changes: `node scripts/take_snapshot.js`
- [ ] Save: `node scripts/click.js --uid button_save`
- [ ] Verify: `node scripts/wait_for.js --text "Profile updated" --timeout 5000`

**Expected Output:**
All fields updated in single operation, profile saved successfully.

### Workflow: File Upload with Validation

Upload a file and verify success:

- [ ] Navigate to upload page: `node scripts/new_page.js --url https://example.com/upload`
- [ ] Get file input UID: `node scripts/take_snapshot.js`
- [ ] Select file: `node scripts/upload_file.js --uid input_file_abc123 --filePath /Users/username/documents/report.pdf`
- [ ] Wait for preview: `node scripts/wait_for.js --text "report.pdf" --timeout 5000`
- [ ] Verify file name appears: `node scripts/take_snapshot.js`
- [ ] Click upload button: `node scripts/click.js --uid button_upload_xyz`
- [ ] Wait for completion: `node scripts/wait_for.js --text "Upload successful" --timeout 30000`
- [ ] Capture confirmation: `node scripts/take_screenshot.js --filePath upload_complete.png`

**Input Example:**
File path: `/Users/username/documents/report.pdf`
File input UID: `input_file_abc123`

**Expected Output:**
File uploaded successfully, confirmation message displayed.

### Workflow: Drag and Drop Interface

Interact with drag-and-drop components:

- [ ] Open drag interface: `node scripts/new_page.js --url https://example.com/kanban`
- [ ] Get board structure: `node scripts/take_snapshot.js`
- [ ] Drag task 1: `node scripts/drag.js --from-uid task_item_1 --to-uid column_in_progress`
- [ ] Wait for update: `node scripts/wait_for.js --text "Task moved" --timeout 3000`
- [ ] Drag task 2: `node scripts/drag.js --from-uid task_item_2 --to-uid column_done`
- [ ] Verify final state: `node scripts/take_snapshot.js`
- [ ] Save changes: `node scripts/click.js --uid button_save_board`

**Expected Output:**
Tasks moved between columns, board state updated and saved.

### Workflow: Keyboard Navigation

Use keyboard shortcuts and navigation keys:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/editor`
- [ ] Focus text area: `node scripts/click.js --uid textarea_editor_abc`
- [ ] Type content: `node scripts/fill.js --uid textarea_editor_abc --value "Hello world"`
- [ ] Select all: `node scripts/press_key.js --key "Control+A"`
- [ ] Copy: `node scripts/press_key.js --key "Control+C"`
- [ ] Navigate down: `node scripts/press_key.js --key ArrowDown`
- [ ] Paste: `node scripts/press_key.js --key "Control+V"`
- [ ] Save: `node scripts/press_key.js --key "Control+S"`
- [ ] Verify save: `node scripts/wait_for.js --text "Saved" --timeout 5000`

**Expected Output:**
Keyboard shortcuts execute correctly, content manipulated and saved.

### Workflow: Hover Tooltips and Menus

Interact with hover-triggered UI elements:

- [ ] Open page: `node scripts/new_page.js --url https://example.com/dashboard`
- [ ] Get elements: `node scripts/take_snapshot.js`
- [ ] Hover over help icon: `node scripts/hover.js --uid icon_help_abc`
- [ ] Wait for tooltip: `node scripts/wait_for.js --text "Click for help" --timeout 2000`
- [ ] Capture tooltip: `node scripts/take_screenshot.js --filePath tooltip.png`
- [ ] Hover over menu: `node scripts/hover.js --uid menu_trigger_xyz`
- [ ] Wait for dropdown: `node scripts/wait_for.js --text "Settings" --timeout 2000`
- [ ] Click menu item: `node scripts/click.js --uid menu_item_settings`

**Expected Output:**
Tooltips and dropdowns appear on hover, menu items clickable.

## Common Patterns

### Pattern: Always Snapshot Before Interaction

Get fresh UIDs for every interaction:

```bash
# 1. Navigate to page
node scripts/new_page.js --url https://example.com/form

# 2. Wait for page load
node scripts/wait_for.js --text "Submit" --timeout 5000

# 3. Get current element UIDs
node scripts/take_snapshot.js

# 4. Use UIDs from snapshot output
node scripts/fill.js --uid <uid-from-snapshot> --value "data"
```

### Pattern: Form Validation Handling

Handle form validation errors:

```bash
# 1. Fill form
node scripts/fill.js --uid input_email --value "invalid-email"

# 2. Submit
node scripts/click.js --uid button_submit

# 3. Check for error message
node scripts/wait_for.js --text "Invalid email" --timeout 3000

# 4. Correct the input
node scripts/fill.js --uid input_email --value "valid@example.com"

# 5. Resubmit
node scripts/click.js --uid button_submit
```

### Pattern: Wait After Each Interaction

Ensure UI updates before next action:

```bash
# 1. Click button
node scripts/click.js --uid button_load_more

# 2. Wait for new content
node scripts/wait_for.js --text "Showing 20 items" --timeout 5000

# 3. Now interact with new elements
node scripts/take_snapshot.js
```

## Troubleshooting

**Problem:** Element UID not found

**Solution:** UIDs are dynamic. Always take a fresh snapshot before interaction. Don't reuse old UIDs.

**Problem:** Click doesn't trigger action

**Solution:**
- Ensure element is visible and clickable (not hidden)
- Try waiting for page to fully load first with `wait_for.js`
- Check if element requires hover first: use `hover.js` then `click.js`

**Problem:** Fill doesn't work on input

**Solution:**
- Verify the element is an input/textarea/select
- For some custom components, use `click.js` to focus, then `press_key.js` to type
- Check if page has JavaScript that prevents fill

**Problem:** File upload fails

**Solution:**
- Use absolute file paths (not relative)
- Verify file exists at the specified path
- Use forward slashes in paths: `/Users/username/file.pdf`

**Problem:** Drag and drop doesn't work

**Solution:**
- Ensure both UIDs are valid and current
- Some drag implementations require specific timing - add `wait_for.js` between actions
- Verify dropzone accepts the dragged element type
