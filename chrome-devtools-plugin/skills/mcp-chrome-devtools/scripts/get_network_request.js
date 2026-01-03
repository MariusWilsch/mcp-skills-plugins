#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Generated: 2025-11-23
 * Tool: get_network_request
 *
 * Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel.
 */

import { program } from 'commander';
import { callTool } from './mcp_client.js';

program
  .name('get_network_request')
  .description('Gets a network request by an optional reqid, if omitted returns the currently selected request in the DevTools Network panel.')
  .option('--reqid <value>', 'The reqid of the network request. If omitted returns the currently selected request in the DevTools Network panel.')
  .parse();

const options = program.opts();

  // Build arguments object
  const args = {};
  if (options.reqid !== undefined) {
    const parsed = parseInt(options.reqid, 10);
    if (isNaN(parsed)) {
      console.error(`Error: --reqid must be a number, got "${options.reqid}". Use the numeric ID from list_network_requests output (e.g., 7 not "req_007").`);
      process.exit(1);
    }
    args['reqid'] = parsed;
  }

// Call the tool
try {
  const result = await callTool('chrome-devtools', 'get_network_request', args);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
