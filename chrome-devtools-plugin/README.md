# Chrome DevTools Plugin

Browser automation and DevTools control. Navigate pages, interact with elements, inspect network/console, analyze performance, and capture screenshots for web testing and automation tasks.

## Overview

This plugin provides comprehensive browser automation capabilities through the chrome-devtools MCP server integration. Control Chrome browser programmatically using the Chrome DevTools Protocol with 26 specialized tools for web automation, testing, scraping, and performance analysis.

**Generated from MCP server:** chrome-devtools-mcp@0.10.2

## Key Features

- **Browser Automation:** Automate form filling, button clicks, navigation, and complex user workflows
- **Web Scraping:** Extract data from websites with element snapshots and JavaScript evaluation
- **E2E Testing:** Build comprehensive end-to-end tests with built-in verification steps
- **Performance Analysis:** Measure Core Web Vitals (LCP, FID, CLS) and generate performance insights
- **Debugging Tools:** Inspect console logs, monitor network requests, and capture screenshots
- **Multi-Tab Management:** Handle multiple browser pages and switch contexts seamlessly

## Prerequisites

- **Claude Code** installed
- **Node.js** >= 18.0.0
- **Chrome/Chromium** browser installed

### Optional: LLM Output Filtering

For optimized context usage (~90% reduction), add an OpenRouter API key:

1. Get a key from [openrouter.ai](https://openrouter.ai)
2. Add to `~/.claude/.env`:
   ```
   OPENROUTER_API_KEY=your_key_here
   ```

**Without the key:** Plugin works normally but returns full verbose output instead of filtered results. Cost savings: ~$0.13/call when filtering is active.

The plugin automatically configures the chrome-devtools MCP server when installed.

## Installation

### From Marketplace

```bash
# Add the marketplace (if not already added)
/plugin marketplace add ulasbilgen/mcp-skills-plugins

# Install this plugin
/plugin install chrome-devtools-plugin@mcp-skills-plugins
```

Restart Claude Code to activate the plugin.

### Local Development

```bash
# Clone the marketplace repository
git clone https://github.com/ulasbilgen/mcp-skills-plugins.git

# Add as local marketplace
/plugin marketplace add ./mcp-skills-plugins

# Install the plugin
/plugin install chrome-devtools-plugin@mcp-skills-plugins
```

## Quick Start

After installation, you can start automating browser tasks immediately:

### Basic Browser Automation

```
> Use chrome-devtools to open https://example.com and take a screenshot
```

The agent will:
1. Open a new browser page
2. Navigate to the URL
3. Wait for the page to load
4. Capture a screenshot

### Automated Form Filling

```
> Use chrome-devtools to fill out the login form at https://example.com/login
> Email: test@example.com, Password: mypassword
```

The agent will:
1. Open the login page
2. Take a snapshot to identify form elements
3. Fill in the email and password fields
4. Submit the form
5. Verify successful login

### Web Scraping

```
> Use chrome-devtools to extract all product titles from https://example.com/products
```

The agent will:
1. Navigate to the products page
2. Wait for content to load
3. Use JavaScript to extract product titles
4. Return the structured data

### Performance Testing

```
> Use chrome-devtools to analyze the performance of https://example.com
```

The agent will:
1. Start a performance trace
2. Load the page with reload
3. Stop the trace and extract Core Web Vitals
4. Provide performance insights and recommendations

## Available Capabilities

### 1. Page Management (6 tools)
- Create new browser pages/tabs
- Navigate between pages (forward, back, reload)
- Switch between multiple tabs
- Resize browser window for responsive testing
- Close specific pages

### 2. Element Interaction (7 tools)
- Click on buttons, links, and other elements
- Fill text inputs and select dropdown options
- Fill multiple form fields at once
- Hover over elements to trigger tooltips/menus
- Drag and drop elements
- Upload files through file inputs
- Press keyboard keys and shortcuts

### 3. Inspection & Debugging (6 tools)
- Take text snapshots of page structure with element UIDs
- Capture visual screenshots (full page or specific elements)
- List and inspect console messages (logs, warnings, errors)
- Monitor network requests and responses
- Debug frontend issues with detailed inspection

### 4. Performance Analysis (7 tools)
- Execute custom JavaScript in page context
- Wait for specific text to appear (dynamic content)
- Handle browser dialogs (alert, confirm, prompt)
- Emulate network conditions (3G, 4G, throttling)
- Record performance traces with Core Web Vitals
- Analyze specific performance insights
- Test under various CPU and network constraints

## Using the Agent

After installation, the `chrome-devtools` agent will be available automatically.

### Explicit Invocation

```
> Use the chrome-devtools agent to automate a checkout flow
```

### Automatic Invocation

Claude will automatically use this agent when you request browser automation tasks:

```
> Fill out the registration form at https://example.com/signup
> Test the login flow on my website
> Extract all article titles from this news site
> Measure the performance of my landing page
```

## Documentation

Complete skill documentation is available in the plugin directory:

- **`skills/mcp-chrome-devtools/SKILL.md`** - Main documentation and tool reference

### Workflow Guides

- **`workflows/page-management.md`** - Browser window and tab operations
- **`workflows/element-interaction.md`** - User input simulation and form filling
- **`workflows/inspection-debugging.md`** - Monitoring, debugging, and data extraction
- **`workflows/performance-analysis.md`** - Performance testing and optimization

### Reference Documentation

- **`reference/all-tools.md`** - Complete alphabetical listing of all 26 tools
- **`reference/troubleshooting.md`** - Common issues and solutions
- **`reference/advanced-examples.md`** - Production-ready patterns and CI/CD integration

## Example Use Cases

### E2E Testing
```
> Test the complete user registration flow:
> 1. Fill registration form
> 2. Verify email validation
> 3. Submit and check for success message
> 4. Capture screenshots at each step
```

### Web Scraping
```
> Scrape the following data from https://example.com/listings:
> - Product names
> - Prices
> - Availability status
> Save to JSON file
```

### Performance Monitoring
```
> Run performance tests on https://example.com under:
> - Fast 4G network
> - Slow 3G network
> Compare Core Web Vitals and identify bottlenecks
```

### Visual Regression Testing
```
> Capture screenshots of https://example.com at:
> - Desktop (1920x1080)
> - Tablet (768x1024)
> - Mobile (375x667)
```

### Debugging Frontend Issues
```
> Debug the form submission at https://example.com/contact:
> - Check console for errors
> - Monitor network requests
> - Verify API responses
> - Capture error screenshots
```

## Troubleshooting

### MCP Server Not Running

If you see errors about the chrome-devtools server not being available:

1. The plugin automatically configures the MCP server via `plugin.json`
2. Restart Claude Code to ensure the server is loaded
3. Check the Claude Code logs for any startup errors

### Chrome Browser Not Found

The chrome-devtools MCP server requires Chrome or Chromium installed:

- **macOS:** Install Chrome from https://www.google.com/chrome/
- **Linux:** `sudo apt install chromium-browser` or install Chrome
- **Windows:** Install Chrome from https://www.google.com/chrome/

### Script Execution Issues

If scripts fail to execute:

1. **Check Node.js version** (need 18+):
   ```bash
   node --version
   ```

2. **Install dependencies** (already done during plugin installation):
   ```bash
   cd ~/.claude/plugins/chrome-devtools-plugin/skills/mcp-chrome-devtools/scripts
   npm install
   ```

3. **Verify file paths** use forward slashes (not backslashes)

### Element UIDs Not Found

Element UIDs regenerate on each snapshot. Always:
1. Take a fresh snapshot before interaction
2. Immediately use the UIDs from that snapshot
3. Never reuse UIDs from previous snapshots

### Common Error Messages

**"Cannot connect to Chrome"**
- Ensure Chrome/Chromium is installed
- Check if another Chrome DevTools session is active
- Restart Claude Code to reinitialize the MCP server

**"Navigation timeout"**
- Increase timeout value in commands
- Check network connectivity
- Verify the URL is correct and accessible

**"Screenshot is blank"**
- Wait for page to fully render before capturing
- Use `--fullPage true` for full page screenshots
- Verify page loaded correctly with a snapshot first

For more troubleshooting help, see `skills/mcp-chrome-devtools/reference/troubleshooting.md`.

## Best Practices

1. **Always take snapshots before interaction** - Element UIDs change each time
2. **Use wait_for for dynamic content** - Don't assume instant page loads
3. **Capture evidence** - Take screenshots and snapshots for verification
4. **Check console and network** - Debug issues with inspection tools
5. **Handle state properly** - Browser instance persists between commands
6. **Use absolute file paths** - Always use forward slashes in paths

## Contributing

Found an issue or have improvements? Please:
1. Check existing issues: https://github.com/ulasbilgen/mcp-skills-plugins/issues
2. Submit bug reports with reproduction steps
3. Propose enhancements via pull requests

## Version Information

- **Plugin version:** 0.5.1
- **MCP server:** chrome-devtools-mcp@0.10.2
- **Generated with:** [mcp2skill-tools](https://github.com/ulasbilgen/mcp2skill-tools)
- **MCP server configuration:** Bundled in plugin.json

## Architecture

This plugin follows the mcp-skills-plugins architecture:

```
chrome-devtools-plugin/
├── .claude-plugin/
│   └── plugin.json          # Plugin manifest with MCP server config
├── agents/
│   └── chrome-devtools.md   # Agent specialized in browser automation
├── skills/
│   └── mcp-chrome-devtools/ # Generated skill with 26 tools
│       ├── SKILL.md         # Main skill documentation
│       ├── scripts/         # JavaScript tools (26 scripts)
│       ├── workflows/       # Detailed workflow guides
│       └── reference/       # Complete tool reference
└── README.md                # This file
```

The MCP server (chrome-devtools-mcp) is automatically started by Claude Code using the configuration in `plugin.json`. No manual mcp2rest setup required.

## License

MIT License - See repository for details.

## Support

For questions and support:
- **Documentation:** See `skills/mcp-chrome-devtools/SKILL.md`
- **Issues:** https://github.com/ulasbilgen/mcp-skills-plugins/issues
- **MCP Server:** https://github.com/modelcontextprotocol/servers/tree/main/src/chrome-devtools

## Acknowledgments

- Built with [mcp2skill-tools](https://github.com/ulasbilgen/mcp2skill-tools)
- Powered by [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/)
- Part of the [Model Context Protocol](https://modelcontextprotocol.io) ecosystem
