#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2026-01-01
 * Tool: fill_form
 *
 * Fill out multiple form elements at once.
 * Returns filtered snapshot if --context provided.
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('fill_form')
  .description('Fill out multiple form elements at once')
  .option('--elements <items...>', 'Elements from snapshot to fill out. (required)')
  .requiredOption('--context <query>', 'REQUIRED: Filter post-action snapshot (e.g., "find form state"). Use "*" for full output.')
  .parse();

const options = program.opts();

// Validate required options
if (!options.elements) {
  console.error('Error: --elements is required');
  process.exit(1);
}

// Build arguments object
const args = {};
if (options.elements !== undefined) {
  args['elements'] = options.elements;
}

// Call the tool with optional filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'fill_form',
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
