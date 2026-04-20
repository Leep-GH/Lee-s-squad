'use strict';
/**
 * routing-patterns.test.cjs
 *
 * Routing eval: verifies that routing patterns in squad.config.ts correctly match
 * the expected work type → agent assignments.
 *
 * These are golden input/expected-output tests. If routing rules change in a way
 * that breaks expected assignments, this test catches it before it affects users.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function readFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

/**
 * Extract routing rules from squad.config.ts source text.
 * Returns array of { pattern: string, agents: string[] }
 */
function extractRoutingRules(configContent) {
  const rules = [];
  // Match each routing rule block
  const ruleBlocks = [...configContent.matchAll(/\{\s*pattern:\s*['"]([^'"]+)['"],\s*agents:\s*\[([^\]]+)\]/g)];
  for (const block of ruleBlocks) {
    const pattern = block[1];
    const agents = [...block[2].matchAll(/'@([^']+)'|"@([^"]+)"/g)].map(m => m[1] || m[2]);
    rules.push({ pattern, agents });
  }
  return rules;
}

/**
 * Given a work type keyword, find which agents would handle it based on routing rules.
 * Returns agent names (without @) or ['architect'] as default.
 */
function routeKeyword(keyword, rules) {
  for (const rule of rules) {
    const regex = new RegExp(`\\b(${rule.pattern})\\b`, 'i');
    if (regex.test(keyword)) {
      return rule.agents;
    }
  }
  return ['architect']; // default
}

// ─── Load routing rules ────────────────────────────────────────────────────────

const configPath = path.join(ROOT, 'squad.config.ts');
const configContent = readFile(configPath);
const rules = configContent ? extractRoutingRules(configContent) : [];

// ─── Golden routing table ──────────────────────────────────────────────────────
//
// Format: { input: string, expectedAgents: string[] }
// expectedAgents must be a SUBSET of the actual agents returned (order independent)

const GOLDEN_ROUTES = [
  // PRD / planning work → architect
  { input: 'prd',            expectedAgents: ['architect'] },
  { input: 'plan',           expectedAgents: ['architect'] },
  { input: 'architecture',   expectedAgents: ['architect'] },
  { input: 'requirement',    expectedAgents: ['architect'] },
  { input: 'scope',          expectedAgents: ['architect'] },

  // Backend work → backend
  { input: 'api',            expectedAgents: ['backend'] },
  { input: 'endpoint',       expectedAgents: ['backend'] },
  { input: 'auth',           expectedAgents: ['backend'] },
  { input: 'server',         expectedAgents: ['backend'] },
  { input: 'webhook',        expectedAgents: ['backend'] },

  // Frontend / UI work → frontend or designer
  { input: 'component',      expectedAgents: ['frontend', 'designer'] },
  { input: 'page',           expectedAgents: ['frontend', 'designer'] },
  { input: 'css',            expectedAgents: ['frontend', 'designer'] },
  { input: 'wireframe',      expectedAgents: ['designer', 'frontend'] },

  // Data layer → data
  { input: 'database',       expectedAgents: ['data'] },
  { input: 'schema',         expectedAgents: ['data'] },
  { input: 'migration',      expectedAgents: ['data'] },
  { input: 'query',          expectedAgents: ['data'] },
  { input: 'orm',            expectedAgents: ['data'] },

  // Testing → qa
  { input: 'test',           expectedAgents: ['qa'] },
  { input: 'spec',           expectedAgents: ['qa'] },
  { input: 'coverage',       expectedAgents: ['qa'] },
  { input: 'e2e',            expectedAgents: ['qa'] },
  { input: 'regression',     expectedAgents: ['qa'] },

  // DevOps / infra → devops
  { input: 'docker',         expectedAgents: ['devops'] },
  { input: 'deploy',         expectedAgents: ['devops'] },
  { input: 'pipeline',       expectedAgents: ['devops'] },
  { input: 'ci',             expectedAgents: ['devops'] },
  { input: 'infra',          expectedAgents: ['devops'] },
  { input: 'kubernetes',     expectedAgents: ['devops'] },
  { input: 'monitoring',     expectedAgents: ['devops'] },
  { input: 'release',        expectedAgents: ['devops'] },
  { input: 'environment',    expectedAgents: ['devops'] },
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Routing pattern extraction', () => {
  test('squad.config.ts has routing rules defined', () => {
    assert.ok(rules.length > 0, 'No routing rules found in squad.config.ts');
  });

  test('squad.config.ts has at least 6 routing rules', () => {
    assert.ok(rules.length >= 6, `Expected ≥6 routing rules, found ${rules.length}`);
  });
});

describe('Golden routing table', () => {
  for (const { input, expectedAgents } of GOLDEN_ROUTES) {
    test(`"${input}" routes to [${expectedAgents.join(', ')}]`, () => {
      const actual = routeKeyword(input, rules);
      const matched = expectedAgents.some(expected => actual.includes(expected));
      assert.ok(
        matched,
        `Keyword "${input}" routed to [${actual.join(', ')}] but expected at least one of [${expectedAgents.join(', ')}]`
      );
    });
  }
});

describe('Routing coverage: all core agents are reachable', () => {
  const CORE_AGENTS = ['architect', 'backend', 'frontend', 'data', 'qa', 'devops'];

  for (const agent of CORE_AGENTS) {
    test(`@${agent} appears in at least one routing rule`, () => {
      const reachable = rules.some(r => r.agents.includes(agent));
      assert.ok(reachable, `Agent @${agent} is not reachable via any routing rule — it would never be auto-assigned`);
    });
  }
});
