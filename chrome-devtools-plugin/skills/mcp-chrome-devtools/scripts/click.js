#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2026-01-01
 * Tool: click
 *
 * Clicks on the provided element. Returns filtered snapshot if --context provided.
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('click')
  .description('Clicks on the provided element')
  .option('--uid <value>', 'The uid of an element on the page from the page content snapshot (required)')
  .option('--dblClick', 'Set to true for double clicks. Default is false.')
  .option('--context <query>', 'Filter post-action snapshot (e.g., "find result message"). Use "*" for full output.')
  .parse();

const options = program.opts();

// Validate required options
if (!options.uid) {
  console.error('Error: --uid is required');
  process.exit(1);
}

// Build arguments object
const args = {};
if (options.uid !== undefined) {
  args['uid'] = options.uid;
}
if (options.dblClick) {
  args['dblClick'] = true;
}

// Call the tool with optional filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'click',
    args,
    options.context || '*',  // Default to full output if no context
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
