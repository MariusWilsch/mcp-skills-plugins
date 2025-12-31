#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2025-12-31
 * Tool: list_network_requests
 *
 * List all requests for the currently selected page since the last navigation.
 * Uses LLM filtering via callToolFiltered() to return only relevant requests.
 *
 * Design Context:
 * - --context is REQUIRED to force intentional filtering
 * - Use --context "*" to get full output (escape hatch)
 * - Reduces context window usage by ~90%
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('list_network_requests')
  .description('List all requests for the currently selected page since the last navigation.')
  .requiredOption('--context <query>', 'REQUIRED: What to look for (e.g., "failed requests", "supabase storage", "POST requests"). Use "*" for full output.')
  .option('--pageSize <value>', 'Maximum number of requests to return. When omitted, returns all requests.', (val) => parseInt(val, 10))
  .option('--pageIdx <value>', 'Page number to return (0-based). When omitted, returns the first page.', (val) => parseInt(val, 10))
  .option('--resourceTypes <items...>', 'Filter requests to only return requests of the specified resource types. When omitted or empty, returns all requests.')
  .option('--includePreservedRequests', 'Set to true to return the preserved requests over the last 3 navigations.')
  .parse();

const options = program.opts();

// Build arguments object
const args = {};
if (options.pageSize !== undefined) {
  args['pageSize'] = options.pageSize;
}
if (options.pageIdx !== undefined) {
  args['pageIdx'] = options.pageIdx;
}
if (options.resourceTypes !== undefined) {
  args['resourceTypes'] = options.resourceTypes;
}
if (options.includePreservedRequests) {
  args['includePreservedRequests'] = true;
}

// Call the tool with filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'list_network_requests',
    args,
    options.context,
    'network'
  );

  if (full) {
    if (fallback) {
      console.log('⚠️ LLM filter unavailable, showing full output:\n');
    }
    console.log(result);
  } else {
    console.log(`🎯 Found ${ids.length} matching request(s) for: "${options.context}"\n`);
    console.log(result);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
