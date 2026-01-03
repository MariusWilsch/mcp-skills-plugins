#!/usr/bin/env node
/**
 * MCP Server: chrome-devtools
 * Server Version: 0.10.2
 * Generated: 2025-11-23
 * Tool: get_console_message
 *
 * Gets a console message by its ID. You can get all messages by calling list_console_messages.
 */

import { program } from 'commander';
import { callTool } from './mcp_client.js';

program
  .name('get_console_message')
  .description('Gets a console message by its ID. You can get all messages by calling list_console_messages.')
  .option('--msgid <value>', 'The msgid of a console message on the page from the listed console messages (required)')
  .addHelpText('after', '  Note: --msgid is required')
  .parse();

const options = program.opts();

  // Validate required options
  if (!options.msgid) {
    console.error('Error: --msgid is required');
    process.exit(1);
  }

  // Build arguments object
  const args = {};
  if (options.msgid !== undefined) {
    const parsed = parseInt(options.msgid, 10);
    if (isNaN(parsed)) {
      console.error(`Error: --msgid must be a number, got "${options.msgid}". Use the numeric ID from list_console_messages output (e.g., 7 not "msg_007").`);
      process.exit(1);
    }
    args['msgid'] = parsed;
  }

// Call the tool
try {
  const result = await callTool('chrome-devtools', 'get_console_message', args);
  console.log(result);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
