#!/usr/bin/env node
/**
 * check-squad-config-sync.mjs
 *
 * Detects drift between squad.config.ts (source of truth) and the generated
 * .squad/*.md files, GitHub Copilot agent files, and routing definitions.
 *
 * CI gate: exits with code 1 if any drift is detected.
 *
 * What it checks:
 *  1. Every agent defined in squad.config.ts has a charter at .squad/agents/{name}/charter.md
 *  2. Every agent defined in squad.config.ts has a GitHub agent file at .github/agents/{name}.agent.md
 *     (only for non-background agents — scribe and ralph get a bypass)
 *  3. Every agent name appears in .squad/team.md ## Members table
 *  4. Every agent name appears at least once in .squad/routing.md
 *  5. .squad/routing.md has a "Default agent" or "defaultAgent" declaration
 *  6. Every charter has all four required sections: ## Identity, ## Boundaries, ## Model, ## Collaboration
 *
 * — zero external dependencies (node: built-ins only)
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

// Background agents that don't need a .github/agents/{name}.agent.md
// (they are invoked programmatically, not directly by users in GitHub UI)
const BACKGROUND_AGENTS = new Set(['scribe']);

let failures = 0;

function fail(msg) {
  console.error(`  ✗ ${msg}`);
  failures++;
}

function pass(msg) {
  console.log(`  ✓ ${msg}`);
}

// ─── 1. Extract agent names from squad.config.ts ─────────────────────────────

const configPath = join(ROOT, 'squad.config.ts');
if (!existsSync(configPath)) {
  console.error('FATAL: squad.config.ts not found at root.');
  process.exit(1);
}

const configSrc = readFileSync(configPath, 'utf8');

// Extract names from defineAgent({ name: 'foo', ...})
const agentNameMatches = [...configSrc.matchAll(/defineAgent\s*\(\s*\{\s*name:\s*['"]([^'"]+)['"]/g)];
const configAgents = agentNameMatches.map((m) => m[1]);

if (configAgents.length === 0) {
  console.error('FATAL: No agents found in squad.config.ts. Is the file parseable?');
  process.exit(1);
}

console.log(`\nConfig drift check — ${configAgents.length} agents defined in squad.config.ts`);
console.log(`  Agents: ${configAgents.join(', ')}\n`);

// ─── 2. Charter files ─────────────────────────────────────────────────────────

console.log('── Charter files (.squad/agents/{name}/charter.md)');

const REQUIRED_CHARTER_SECTIONS = ['## Identity', '## Boundaries', '## Model', '## Collaboration'];

for (const agent of configAgents) {
  const charterPath = join(ROOT, '.squad', 'agents', agent, 'charter.md');
  if (!existsSync(charterPath)) {
    fail(`${agent}: charter.md missing at .squad/agents/${agent}/charter.md`);
    continue;
  }

  const charterSrc = readFileSync(charterPath, 'utf8');
  let charterOk = true;

  for (const section of REQUIRED_CHARTER_SECTIONS) {
    if (!charterSrc.includes(section)) {
      fail(`${agent}: charter.md missing section "${section}"`);
      charterOk = false;
    }
  }

  // Verify ## Model section has an actual model preference (not just empty)
  const modelSectionMatch = charterSrc.match(/## Model\s*\n([\s\S]*?)(?:\n## |\n---|\s*$)/);
  if (modelSectionMatch) {
    const modelBody = modelSectionMatch[1].trim();
    if (!modelBody || modelBody.length < 5) {
      fail(`${agent}: ## Model section exists but is empty or too short`);
      charterOk = false;
    }
  }

  if (charterOk) {
    pass(`${agent}: charter.md exists with all required sections`);
  }
}

// ─── 3. GitHub Copilot agent files ───────────────────────────────────────────

console.log('\n── GitHub agent files (.github/agents/{name}.agent.md)');

for (const agent of configAgents) {
  if (BACKGROUND_AGENTS.has(agent)) {
    pass(`${agent}: background agent — .github/agents file not required`);
    continue;
  }

  const agentFilePath = join(ROOT, '.github', 'agents', `${agent}.agent.md`);
  if (!existsSync(agentFilePath)) {
    fail(`${agent}: .github/agents/${agent}.agent.md missing`);
  } else {
    pass(`${agent}: .github/agents/${agent}.agent.md exists`);
  }
}

// ─── 4. team.md membership ───────────────────────────────────────────────────

console.log('\n── team.md membership (.squad/team.md)');

const teamPath = join(ROOT, '.squad', 'team.md');
if (!existsSync(teamPath)) {
  fail('team.md missing at .squad/team.md');
} else {
  const teamSrc = readFileSync(teamPath, 'utf8');

  if (!teamSrc.includes('## Members')) {
    fail('team.md missing ## Members section');
  } else {
    pass('team.md has ## Members section');
  }

  for (const agent of configAgents) {
    // Check if the agent name appears in the Members table (case-insensitive)
    const agentRegex = new RegExp(`\\|\\s*${agent}\\s*\\|`, 'i');
    if (!agentRegex.test(teamSrc)) {
      fail(`${agent}: not found in .squad/team.md ## Members table`);
    } else {
      pass(`${agent}: found in team.md`);
    }
  }
}

// ─── 5. routing.md coverage ──────────────────────────────────────────────────

console.log('\n── routing.md coverage (.squad/routing.md)');

const routingPath = join(ROOT, '.squad', 'routing.md');
if (!existsSync(routingPath)) {
  fail('routing.md missing at .squad/routing.md');
} else {
  const routingSrc = readFileSync(routingPath, 'utf8');

  // Check default agent is declared
  if (!/default\s*agent/i.test(routingSrc)) {
    fail('routing.md missing a "Default agent" declaration');
  } else {
    pass('routing.md has a default agent declaration');
  }

  // Background agents and the coordinator itself don't need routing rules
  const ROUTING_EXEMPT = new Set(['scribe', 'ralph']);

  for (const agent of configAgents) {
    if (ROUTING_EXEMPT.has(agent)) {
      pass(`${agent}: routing-exempt agent — no routing rule required`);
      continue;
    }

    // Look for the agent name anywhere in the routing table (case-insensitive)
    // Routing table may include emojis or extra text after the agent name in the cell
    const routingRegex = new RegExp(agent, 'i');
    const atMentionRegex = new RegExp(`@${agent}`, 'i');

    if (!routingRegex.test(routingSrc) && !atMentionRegex.test(routingSrc)) {
      fail(`${agent}: not found in .squad/routing.md routing table`);
    } else {
      pass(`${agent}: found in routing.md`);
    }
  }
}

// ─── 6. Report ───────────────────────────────────────────────────────────────

console.log('\n────────────────────────────────────────────────');

if (failures > 0) {
  console.error(`\n✗ Config drift detected — ${failures} problem(s) found.`);
  console.error(
    'Run `squad build` to regenerate .squad/ files from squad.config.ts, then fix any remaining gaps manually.\n',
  );
  process.exit(1);
} else {
  console.log('\n✓ No config drift detected. All agents are in sync.\n');
  process.exit(0);
}
