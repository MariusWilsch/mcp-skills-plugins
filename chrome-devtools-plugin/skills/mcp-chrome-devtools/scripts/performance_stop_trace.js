#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Generated: 2025-11-23
 * Tool: performance_stop_trace
 *
 * Stops the active performance trace recording on the selected page.
 */

import { program } from 'commander';
import { callTool } from './mcp_client.js';

program
  .name('performance_stop_trace')
  .description('Stops the active performance trace recording on the selected page.')
  // No options required
  .parse();

const options = program.opts();

  const args = {};

// Call the tool
try {
  const result = await callTool('chrome-devtools', 'performance_stop_trace', args);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
