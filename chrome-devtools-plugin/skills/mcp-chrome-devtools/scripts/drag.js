#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2026-01-01
 * Tool: drag
 *
 * Drag an element onto another element.
 * Returns filtered snapshot if --context provided.
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('drag')
  .description('Drag an element onto another element')
  .option('--from-uid <value>', 'The uid of the element to drag (required)')
  .option('--to-uid <value>', 'The uid of the element to drop into (required)')
  .requiredOption('--context <query>', 'REQUIRED: Filter post-action snapshot (e.g., "find drop zone"). Use "*" for full output.')
  .parse();

const options = program.opts();

// Validate required options
if (!options.fromUid) {
  console.error('Error: --from-uid is required');
  process.exit(1);
}
if (!options.toUid) {
  console.error('Error: --to-uid is required');
  process.exit(1);
}

// Build arguments object
const args = {};
if (options.fromUid !== undefined) {
  args['from_uid'] = options.fromUid;
}
if (options.toUid !== undefined) {
  args['to_uid'] = options.toUid;
}

// Call the tool with optional filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'drag',
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
