#!/usr/bin/env node
/**
 * LLM Filter for Chrome DevTools Output
 *
 * Filters tool output using Gemini 2.5 Flash-Lite via OpenRouter.
 * Supports multiple domains: snapshots (uid), console messages (msgid), network requests (reqid).
 * Returns only matching identifiers, reducing context window usage by ~90%.
 *
 * Design Context:
 * - Cost: ~$0.0003/call vs ~$0.13 saved context = 25x ROI
 * - Latency: ~500ms-1s acceptable tradeoff for context savings
 * - Retry: Once on failure, then fallback to full output
 */

import axios from 'axios';
import { readFileSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

// Load API key from ~/.claude/.env
function loadApiKey() {
  try {
    const envPath = join(homedir(), '.claude', '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/OPENROUTER_API_KEY=(.+)/);
    if (match) {
      return match[1].trim();
    }
    throw new Error('OPENROUTER_API_KEY not found in ~/.claude/.env');
  } catch (error) {
    throw new Error(`Failed to load API key: ${error.message}`);
  }
}

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'google/gemini-2.5-flash-lite-preview-09-2025';

// Domain-specific system prompts
const FILTER_PROMPTS = {
  snapshot: `You are a UI element filter for Chrome DevTools accessibility tree snapshots.

TASK: Given an accessibility tree snapshot and a context query, return ONLY the UIDs of elements that match the query.

RULES:
- ONLY return UIDs that exist in the provided snapshot
- NEVER invent, guess, or fabricate UIDs
- If no elements match, return empty array: []
- Return UIDs exactly as they appear in the snapshot
- Be inclusive: include elements that partially match or are semantically related

OUTPUT: JSON array of UID strings. Nothing else.

EXAMPLES:
Query: "find play buttons" → ["162_38", "162_44", "162_50"]
Query: "locate form inputs" → ["input_email_abc", "input_password_def"]
Query: "find nonexistent element" → []`,

  console: `You are a console message filter for Chrome DevTools.

TASK: Given a list of console messages and a context query, return ONLY the message IDs (msgid) that match the query.

RULES:
- ONLY return msgids that exist in the provided output
- NEVER invent, guess, or fabricate IDs
- If no messages match, return empty array: []
- Return msgids exactly as they appear in the output
- Match by: message content, error type, log level, or semantic relevance

OUTPUT: JSON array of msgid strings. Nothing else.

EXAMPLES:
Query: "find errors" → ["msg_001", "msg_005", "msg_012"]
Query: "RLS policy" → ["msg_003"]
Query: "deprecation warnings" → ["msg_007", "msg_008"]`,

  network: `You are a network request filter for Chrome DevTools.

TASK: Given a list of network requests and a context query, return ONLY the request IDs (reqid) that match the query.

RULES:
- ONLY return reqids that exist in the provided output
- NEVER invent, guess, or fabricate IDs
- If no requests match, return empty array: []
- Return reqids exactly as they appear in the output
- Match by: URL pattern, HTTP method, status code, resource type, or semantic relevance

OUTPUT: JSON array of reqid strings. Nothing else.

EXAMPLES:
Query: "failed requests" → ["req_005", "req_012"]
Query: "supabase storage" → ["req_003", "req_007"]
Query: "POST requests" → ["req_001", "req_004", "req_009"]`
};

// ID patterns for each domain
const ID_PATTERNS = {
  snapshot: { prefix: 'uid', regex: /uid=["']?([^"'\s\]]+)["']?/ },
  console: { prefix: 'msgid', regex: /msgid=["']?([^"'\s\]]+)["']?|Message ID:\s*(\S+)/ },
  network: { prefix: 'reqid', regex: /reqid=["']?([^"'\s\]]+)["']?|Request ID:\s*(\S+)/ }
};

// Legacy alias for backward compatibility
const FILTER_SYSTEM_PROMPT = FILTER_PROMPTS.snapshot;

/**
 * Call OpenRouter API to filter output.
 *
 * @param {string} output - Full tool output
 * @param {string} context - Query describing what to find
 * @param {string} apiKey - OpenRouter API key
 * @param {string} domain - Filter domain: 'snapshot', 'console', or 'network'
 * @returns {Promise<string[]>} Array of matching IDs
 */
async function callOpenRouter(output, context, apiKey, domain = 'snapshot') {
  const systemPrompt = FILTER_PROMPTS[domain] || FILTER_PROMPTS.snapshot;
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: "${context}"\n\nOutput:\n${output}` }
      ],
      temperature: 0,
      max_tokens: 2000
    },
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/MariusWilsch/mcp-skills-plugins',
        'X-Title': 'Chrome DevTools Filter'
      },
      timeout: 15000
    }
  );

  const content = response.data.choices[0]?.message?.content || '[]';

  // Parse JSON array from response
  try {
    const parsed = JSON.parse(content.trim());
    if (Array.isArray(parsed)) {
      return parsed;
    }
    // If not array, try to extract array from response
    const arrayMatch = content.match(/\[.*\]/s);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }
    return [];
  } catch {
    // Try to extract array from malformed response
    const arrayMatch = content.match(/\[.*\]/s);
    if (arrayMatch) {
      try {
        return JSON.parse(arrayMatch[0]);
      } catch {
        return [];
      }
    }
    return [];
  }
}

/**
 * Filter output to only include matching IDs.
 * Strict filtering: only lines containing matched IDs.
 *
 * @param {string} output - Full tool output
 * @param {string[]} ids - Array of IDs to keep
 * @param {string} domain - Filter domain: 'snapshot', 'console', or 'network'
 * @returns {string} Filtered output text
 */
function filterOutputByIDs(output, ids, domain = 'snapshot') {
  if (ids.length === 0) {
    return 'No matching elements found.';
  }

  const pattern = ID_PATTERNS[domain] || ID_PATTERNS.snapshot;
  const lines = output.split('\n');
  const filteredLines = [];

  for (const line of lines) {
    // Check if line contains any matching ID using domain-specific patterns
    const hasID = ids.some(id => {
      // Exact match with various formats
      const exactPatterns = [
        `${pattern.prefix}=${id}`,
        `${pattern.prefix}="${id}"`,
        `${pattern.prefix}='${id}'`,
        `ID: ${id}`,
        `ID:${id}`
      ];
      return exactPatterns.some(p => line.includes(p)) ||
             new RegExp(`${pattern.prefix}=${id}(?:\\s|"|$)`).test(line);
    });
    if (hasID) {
      filteredLines.push(line.trim());
    }
  }

  if (filteredLines.length === 0) {
    // Fallback: just list the IDs
    const label = domain === 'console' ? 'Message IDs' : domain === 'network' ? 'Request IDs' : 'UIDs';
    return `Matching ${label}:\n${ids.map(id => `- ${id}`).join('\n')}`;
  }

  return filteredLines.join('\n');
}

// Legacy alias for backward compatibility
function filterSnapshotByUIDs(snapshot, uids) {
  return filterOutputByIDs(snapshot, uids, 'snapshot');
}

// Pricing for gemini-2.5-flash-lite-preview-09-2025 (per token)
const PROMPT_COST_PER_TOKEN = 0.0000001;   // $0.10/1M tokens
const COMPLETION_COST_PER_TOKEN = 0.0000004; // $0.40/1M tokens

/**
 * Filter tool output using LLM with retry logic.
 * Includes benchmarking for cost and latency.
 *
 * @param {string} output - Full tool output
 * @param {string} context - Query describing what to find
 * @param {string} domain - Filter domain: 'snapshot', 'console', or 'network'
 * @returns {Promise<{filtered: string, ids: string[], fallback: boolean, benchmark?: object}>}
 */
export async function filterOutput(output, context, domain = 'snapshot') {
  let apiKey;
  try {
    apiKey = loadApiKey();
  } catch (error) {
    console.error(`Warning: ${error.message}. Returning full output.`);
    return { filtered: output, ids: [], fallback: true };
  }

  let lastError;
  const startTime = Date.now();

  // Retry once on failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const ids = await callOpenRouter(output, context, apiKey, domain);
      const filtered = filterOutputByIDs(output, ids, domain);

      // Calculate benchmark metrics
      const latencyMs = Date.now() - startTime;
      const inputTokens = Math.ceil((output.length + context.length) / 4); // rough estimate
      const outputTokens = Math.ceil(JSON.stringify(ids).length / 4);
      const cost = (inputTokens * PROMPT_COST_PER_TOKEN) + (outputTokens * COMPLETION_COST_PER_TOKEN);

      const benchmark = {
        latencyMs,
        inputTokens,
        outputTokens,
        estimatedCost: `$${cost.toFixed(6)}`,
        model: MODEL
      };

      // Log benchmark to stderr (doesn't pollute stdout)
      console.error(`📊 LLM Filter [${domain}]: ${latencyMs}ms | ~${inputTokens} in / ~${outputTokens} out | ${benchmark.estimatedCost}`);

      return { filtered, ids, fallback: false, benchmark };
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        console.error(`LLM filter attempt ${attempt} failed: ${error.message}. Retrying...`);
      }
    }
  }

  // Fallback to full output after retry fails
  console.error(`LLM filter failed after retry: ${lastError.message}. Returning full output.`);
  return { filtered: output, ids: [], fallback: true };
}

/**
 * Filter accessibility snapshot using LLM (legacy wrapper).
 * @deprecated Use filterOutput(output, context, 'snapshot') instead
 */
export async function filterSnapshot(snapshot, context) {
  const { filtered, ids, fallback, benchmark } = await filterOutput(snapshot, context, 'snapshot');
  return { filtered, uids: ids, fallback, benchmark };
}
