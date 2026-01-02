#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2026-01-01
 * Tool: press_key
 *
 * Press a key or key combination.
 * Returns filtered snapshot if --context provided.
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('press_key')
  .description('Press a key or key combination. Use this when other input methods like fill() cannot be used (e.g., keyboard shortcuts, navigation keys, or special key combinations).')
  .option('--key <value>', 'A key or a combination (e.g., "Enter", "Control+A", "Control++", "Control+Shift+R"). Modifiers: Control, Shift, Alt, Meta (required)')
  .requiredOption('--context <query>', 'REQUIRED: Filter post-action snapshot (e.g., "find result"). Use "*" for full output.')
  .parse();

const options = program.opts();

// Validate required options
if (!options.key) {
  console.error('Error: --key is required');
  process.exit(1);
}

// Build arguments object
const args = {};
if (options.key !== undefined) {
  args['key'] = options.key;
}

// Call the tool with optional filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'press_key',
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
