#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2025-12-31
 * Tool: take_snapshot
 *
 * Take a text snapshot of the currently selected page based on the a11y tree.
 * Uses LLM filtering via callToolFiltered() to return only relevant UIDs.
 *
 * Design Context:
 * - --context is REQUIRED to force intentional filtering
 * - Use --context "*" to get full output (escape hatch)
 * - Reduces context window usage by ~90% (~$0.12 saved per call)
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('take_snapshot')
  .description('Take a text snapshot of the currently selected page based on the a11y tree. The snapshot lists page elements along with a unique\nidentifier (uid). Always use the latest snapshot. Prefer taking a snapshot over taking a screenshot. The snapshot indicates the element selected\nin the DevTools Elements panel (if any).')
  .requiredOption('--context <query>', 'REQUIRED: What to look for (e.g., "find login button"). Use "*" for full output.')
  .option('--verbose', 'Whether to include all possible information available in the full a11y tree. Default is false.')
  .option('--filePath <value>', 'The absolute path, or a path relative to the current working directory, to save the snapshot to instead of attaching it to the response.')
  .parse();

const options = program.opts();

// Build arguments object
const args = {};
if (options.verbose) {
  args['verbose'] = true;
}
if (options.filePath !== undefined) {
  args['filePath'] = options.filePath;
}

// Call the tool with filtering
try {
  const { result, uids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'take_snapshot',
    args,
    options.context
  );

  if (full) {
    if (fallback) {
      console.log('⚠️ LLM filter unavailable, showing full output:\n');
    }
    console.log(result);
  } else {
    console.log(`🎯 Found ${uids.length} matching element(s) for: "${options.context}"\n`);
    console.log(result);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
