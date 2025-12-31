#!/usr/bin/env node
/**
 * LLM Filter for Chrome DevTools Snapshots
 *
 * Filters accessibility tree snapshots using Gemini 2.5 Flash-Lite via OpenRouter.
 * Returns only UIDs matching the context query, reducing context window usage by ~90%.
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

const FILTER_SYSTEM_PROMPT = `You are a UI element filter for Chrome DevTools accessibility tree snapshots.

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
Query: "find nonexistent element" → []`;

/**
 * Call OpenRouter API to filter snapshot.
 *
 * @param {string} snapshot - Full accessibility tree snapshot
 * @param {string} context - Query describing what to find
 * @param {string} apiKey - OpenRouter API key
 * @returns {Promise<string[]>} Array of matching UIDs
 */
async function callOpenRouter(snapshot, context, apiKey) {
  const response = await axios.post(
    OPENROUTER_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: FILTER_SYSTEM_PROMPT },
        { role: 'user', content: `Context: "${context}"\n\nSnapshot:\n${snapshot}` }
      ],
      temperature: 0,
      max_tokens: 1000
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
 * Filter snapshot to only include matching UIDs.
 * Strict filtering: only lines containing matched UIDs.
 *
 * @param {string} snapshot - Full accessibility tree snapshot
 * @param {string[]} uids - Array of UIDs to keep
 * @returns {string} Filtered snapshot text
 */
function filterSnapshotByUIDs(snapshot, uids) {
  if (uids.length === 0) {
    return 'No matching elements found.';
  }

  const lines = snapshot.split('\n');
  const filteredLines = [];

  for (const line of lines) {
    // Only include lines that contain a matching UID
    const hasUID = uids.some(uid => line.includes(`uid=${uid}`) || line.includes(`uid="${uid}"`));
    if (hasUID) {
      filteredLines.push(line.trim());
    }
  }

  if (filteredLines.length === 0) {
    // Fallback: just list the UIDs
    return `Matching UIDs:\n${uids.map(uid => `- ${uid}`).join('\n')}`;
  }

  return filteredLines.join('\n');
}

// Pricing for gemini-2.5-flash-lite-preview-09-2025 (per token)
const PROMPT_COST_PER_TOKEN = 0.0000001;   // $0.10/1M tokens
const COMPLETION_COST_PER_TOKEN = 0.0000004; // $0.40/1M tokens

/**
 * Filter accessibility snapshot using LLM with retry logic.
 * Includes benchmarking for cost and latency.
 *
 * @param {string} snapshot - Full accessibility tree snapshot
 * @param {string} context - Query describing what to find
 * @returns {Promise<{filtered: string, uids: string[], fallback: boolean, benchmark?: object}>}
 */
export async function filterSnapshot(snapshot, context) {
  let apiKey;
  try {
    apiKey = loadApiKey();
  } catch (error) {
    console.error(`Warning: ${error.message}. Returning full snapshot.`);
    return { filtered: snapshot, uids: [], fallback: true };
  }

  let lastError;
  const startTime = Date.now();

  // Retry once on failure
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const uids = await callOpenRouter(snapshot, context, apiKey);
      const filtered = filterSnapshotByUIDs(snapshot, uids);

      // Calculate benchmark metrics
      const latencyMs = Date.now() - startTime;
      const inputTokens = Math.ceil((snapshot.length + context.length) / 4); // rough estimate
      const outputTokens = Math.ceil(JSON.stringify(uids).length / 4);
      const cost = (inputTokens * PROMPT_COST_PER_TOKEN) + (outputTokens * COMPLETION_COST_PER_TOKEN);

      const benchmark = {
        latencyMs,
        inputTokens,
        outputTokens,
        estimatedCost: `$${cost.toFixed(6)}`,
        model: MODEL
      };

      // Log benchmark to stderr (doesn't pollute stdout)
      console.error(`📊 LLM Filter: ${latencyMs}ms | ~${inputTokens} in / ~${outputTokens} out | ${benchmark.estimatedCost}`);

      return { filtered, uids, fallback: false, benchmark };
    } catch (error) {
      lastError = error;
      if (attempt === 1) {
        console.error(`LLM filter attempt ${attempt} failed: ${error.message}. Retrying...`);
      }
    }
  }

  // Fallback to full output after retry fails
  console.error(`LLM filter failed after retry: ${lastError.message}. Returning full snapshot.`);
  return { filtered: snapshot, uids: [], fallback: true };
}
