#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2026-01-01
 * Tool: fill
 *
 * Type text into a input, text area or select an option from a <select> element.
 * Returns filtered snapshot if --context provided.
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('fill')
  .description('Type text into a input, text area or select an option from a <select> element.')
  .option('--uid <value>', 'The uid of an element on the page from the page content snapshot (required)')
  .option('--value <value>', 'The value to fill in (required)')
  .requiredOption('--context <query>', 'REQUIRED: Filter post-action snapshot (e.g., "find form state"). Use "*" for full output.')
  .parse();

const options = program.opts();

// Validate required options
if (!options.uid) {
  console.error('Error: --uid is required');
  process.exit(1);
}
if (!options.value) {
  console.error('Error: --value is required');
  process.exit(1);
}

// Build arguments object
const args = {};
if (options.uid !== undefined) {
  args['uid'] = options.uid;
}
if (options.value !== undefined) {
  args['value'] = options.value;
}

// Call the tool with optional filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'fill',
    args,
    options.context || '*',
    'snapshot'
  );

  if (options.context && options.context !== '*' && !full) {
    console.log(`🎯 Found ${ids.length} matching element(s) for: "${options.context}"\n`);
  }
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
