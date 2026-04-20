'use strict';
/**
 * agent-structure.test.cjs
 *
 * Structural eval: verifies every registered agent has the required files
 * and that those files contain the expected sections.
 *
 * These are "golden structure" tests — if an agent is added to squad.config.ts
 * without the required files, this test fails immediately in CI rather than
 * silently producing broken behavior at runtime.
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

function extractAgentNames(configContent) {
  const matches = [...configContent.matchAll(/name:\s*['"]([a-z][a-z-]*)['"],/g)];
  // Filter out team name and non-agent names
  return matches
    .map(m => m[1])
    .filter(name => !['lee', 'lee\'s-squad'].includes(name));
}

// ─── Load squad.config.ts (as text — no TS execution) ─────────────────────────

const configPath = path.join(ROOT, 'squad.config.ts');
const configContent = readFile(configPath);

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('squad.config.ts', () => {
  test('squad.config.ts exists at repo root', () => {
    assert.ok(fs.existsSync(configPath), 'squad.config.ts not found');
  });

  test('squad.config.ts defines at least 5 agents', () => {
    const agents = extractAgentNames(configContent);
    assert.ok(agents.length >= 5, `Expected ≥5 agents, found ${agents.length}: ${agents.join(', ')}`);
  });

  test('squad.config.ts includes required roles: architect, backend, qa, devops, scribe', () => {
    const required = ['architect', 'backend', 'qa', 'devops', 'scribe'];
    for (const name of required) {
      assert.ok(
        configContent.includes(`name: '${name}'`) || configContent.includes(`name: "${name}"`),
        `Agent '${name}' is missing from squad.config.ts`
      );
    }
  });
});

describe('Agent charter files', () => {
  const agentsDir = path.join(ROOT, '.squad', 'agents');

  // Core agents that must always have charters
  const REQUIRED_AGENTS = ['architect', 'backend', 'frontend', 'designer', 'data', 'qa', 'devops', 'scribe', 'ralph'];

  for (const name of REQUIRED_AGENTS) {
    test(`${name}: .squad/agents/${name}/charter.md exists`, () => {
      const charterPath = path.join(agentsDir, name, 'charter.md');
      assert.ok(fs.existsSync(charterPath), `Missing charter: .squad/agents/${name}/charter.md`);
    });

    test(`${name}: charter.md has required sections`, () => {
      const charterPath = path.join(agentsDir, name, 'charter.md');
      if (!fs.existsSync(charterPath)) return; // sibling test will catch this
      const content = readFile(charterPath);
      assert.ok(content.includes('## Identity'), `${name}/charter.md missing ## Identity section`);
      assert.ok(content.includes('## Boundaries'), `${name}/charter.md missing ## Boundaries section`);
      assert.ok(content.length > 200, `${name}/charter.md looks like a placeholder (too short: ${content.length} chars)`);
    });

    test(`${name}: charter.md has explicit Model preference`, () => {
      const charterPath = path.join(agentsDir, name, 'charter.md');
      if (!fs.existsSync(charterPath)) return;
      const content = readFile(charterPath);
      assert.ok(
        content.includes('## Model'),
        `${name}/charter.md missing ## Model section — add explicit model preference`
      );
    });
  }
});

describe('.github/agents files', () => {
  // Agents that need GitHub Copilot agent files (internal-only agents are excluded)
  const GITHUB_REQUIRED = ['architect', 'backend', 'frontend', 'designer', 'data', 'qa', 'devops'];

  for (const name of GITHUB_REQUIRED) {
    test(`${name}: .github/agents/${name}.agent.md exists`, () => {
      const agentMdPath = path.join(ROOT, '.github', 'agents', `${name}.agent.md`);
      assert.ok(
        fs.existsSync(agentMdPath),
        `.github/agents/${name}.agent.md is missing — agent cannot be invoked from GitHub Copilot`
      );
    });
  }
});

describe('.squad/team.md structure', () => {
  const teamPath = path.join(ROOT, '.squad', 'team.md');
  const teamContent = readFile(teamPath);

  test('.squad/team.md exists', () => {
    assert.ok(fs.existsSync(teamPath), '.squad/team.md not found');
  });

  test('.squad/team.md has ## Members section (required by GitHub workflows)', () => {
    assert.ok(teamContent?.includes('## Members'), '.squad/team.md missing ## Members section — label automation will break');
  });

  test('.squad/team.md lists devops agent', () => {
    assert.ok(teamContent?.includes('DevOps') || teamContent?.includes('devops'), '.squad/team.md is missing DevOps agent');
  });

  test('.squad/team.md lists Coding Agent (@copilot) section', () => {
    assert.ok(teamContent?.includes('Coding Agent') || teamContent?.includes('@copilot'), '.squad/team.md missing Copilot Coding Agent section');
  });
});

describe('.squad/routing.md structure', () => {
  const routingPath = path.join(ROOT, '.squad', 'routing.md');
  const routingContent = readFile(routingPath);

  test('.squad/routing.md exists', () => {
    assert.ok(fs.existsSync(routingPath), '.squad/routing.md not found');
  });

  test('.squad/routing.md has a routing entry for devops', () => {
    assert.ok(
      routingContent?.toLowerCase().includes('devops') || routingContent?.toLowerCase().includes('infrastructure'),
      '.squad/routing.md missing DevOps routing entry'
    );
  });

  test('.squad/routing.md defines a default agent', () => {
    assert.ok(routingContent?.includes('@architect'), '.squad/routing.md missing default agent (@architect)');
  });
});
