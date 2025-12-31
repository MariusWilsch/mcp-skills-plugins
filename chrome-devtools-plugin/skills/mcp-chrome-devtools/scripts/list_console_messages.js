#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Modified: 2025-12-31
 * Tool: list_console_messages
 *
 * List all console messages for the currently selected page since the last navigation.
 * Uses LLM filtering via callToolFiltered() to return only relevant messages.
 *
 * Design Context:
 * - --context is REQUIRED to force intentional filtering
 * - Use --context "*" to get full output (escape hatch)
 * - Reduces context window usage by ~90%
 */

import { program } from 'commander';
import { callToolFiltered } from './mcp_client.js';

program
  .name('list_console_messages')
  .description('List all console messages for the currently selected page since the last navigation.')
  .requiredOption('--context <query>', 'REQUIRED: What to look for (e.g., "find errors", "RLS policy"). Use "*" for full output.')
  .option('--pageSize <value>', 'Maximum number of messages to return. When omitted, returns all requests.', (val) => parseInt(val, 10))
  .option('--pageIdx <value>', 'Page number to return (0-based). When omitted, returns the first page.', (val) => parseInt(val, 10))
  .option('--types <items...>', 'Filter messages to only return messages of the specified resource types. When omitted or empty, returns all messages.')
  .option('--includePreservedMessages', 'Set to true to return the preserved messages over the last 3 navigations.')
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
if (options.types !== undefined) {
  args['types'] = options.types;
}
if (options.includePreservedMessages) {
  args['includePreservedMessages'] = true;
}

// Call the tool with filtering
try {
  const { result, ids, fallback, full } = await callToolFiltered(
    'chrome-devtools',
    'list_console_messages',
    args,
    options.context,
    'console'
  );

  if (full) {
    if (fallback) {
      console.log('⚠️ LLM filter unavailable, showing full output:\n');
    }
    console.log(result);
  } else {
    console.log(`🎯 Found ${ids.length} matching message(s) for: "${options.context}"\n`);
    console.log(result);
  }
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
