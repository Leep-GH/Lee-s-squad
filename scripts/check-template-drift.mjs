#!/usr/bin/env node
/**
 * check-template-drift.mjs
 *
 * Detects drift between template files across the four locations where they must stay in sync:
 *   1. templates/                         ← source of truth
 *   2. packages/squad-cli/templates/      ← CLI-bundled templates
 *
 * Also validates structural invariants:
 *   - All agents defined in squad.config.ts have a matching .squad/agents/{name}/charter.md
 *   - All SKILL.md files referenced in .github/copilot-instructions.md exist on disk
 *
 * Exit code 0 = no drift. Exit code 1 = drift detected (CI fails).
 *
 * Usage: node scripts/check-template-drift.mjs
 */

import { createHash } from 'node:crypto';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolve(__dirname, '..');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function hash(filePath) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex');
}

function collectFiles(dir, base = dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...collectFiles(full, base));
    } else {
      results.push(relative(base, full).replace(/\\/g, '/'));
    }
  }
  return results;
}

let failures = 0;

function fail(msg) {
  console.error(`  ❌ ${msg}`);
  failures++;
}

function ok(msg) {
  console.log(`  ✅ ${msg}`);
}

// ─── Check 1: Template Drift ──────────────────────────────────────────────────

console.log('\n📁 Template drift check');
console.log('   Source of truth: templates/');
console.log('   Comparing against: packages/squad-cli/templates/\n');

const sourceDir = join(ROOT, 'templates');
const cliDir    = join(ROOT, 'packages', 'squad-cli', 'templates');

const sourceFiles = new Set(collectFiles(sourceDir));
const cliFiles    = new Set(collectFiles(cliDir));

// Files that should be identical across both locations
// (Some files like squad.agent.md.template may legitimately differ — add exceptions here)
const EXCEPTIONS = new Set([
  // Add files that are intentionally different:
  // 'some-file.md',
]);

for (const file of sourceFiles) {
  if (EXCEPTIONS.has(file)) continue;
  if (!cliFiles.has(file)) {
    fail(`templates/${file} exists in root templates/ but is MISSING from packages/squad-cli/templates/`);
    continue;
  }
  const srcHash = hash(join(sourceDir, file));
  const cliHash = hash(join(cliDir, file));
  if (srcHash !== cliHash) {
    fail(`templates/${file} has DRIFTED between root templates/ and packages/squad-cli/templates/`);
  } else {
    ok(`templates/${file} — in sync`);
  }
}

for (const file of cliFiles) {
  if (EXCEPTIONS.has(file)) continue;
  if (!sourceFiles.has(file)) {
    fail(`packages/squad-cli/templates/${file} exists but is MISSING from root templates/ (source of truth)`);
  }
}

// ─── Check 2: Agent Charter Existence ─────────────────────────────────────────

console.log('\n👥 Agent charter existence check\n');

// Parse agent names from squad.config.ts (simple regex — no need for full TS parsing)
const configPath = join(ROOT, 'squad.config.ts');
if (existsSync(configPath)) {
  const configContent = readFileSync(configPath, 'utf8');
  const agentNames = [...configContent.matchAll(/name:\s*['"]([a-z-]+)['"]/g)]
    .map(m => m[1])
    .filter(name => name !== 'lee\'s-squad' && name !== 'lee'); // exclude team name

  const agentsDir = join(ROOT, '.squad', 'agents');
  for (const name of agentNames) {
    const charterPath = join(agentsDir, name, 'charter.md');
    if (!existsSync(charterPath)) {
      fail(`Agent '${name}' is defined in squad.config.ts but has no .squad/agents/${name}/charter.md`);
    } else {
      ok(`.squad/agents/${name}/charter.md — exists`);
    }

    // Also check .github/agents/{name}.agent.md exists (for non-internal agents)
    const INTERNAL_AGENTS = new Set(['scribe', 'ralph']);
    if (!INTERNAL_AGENTS.has(name)) {
      const agentMdPath = join(ROOT, '.github', 'agents', `${name}.agent.md`);
      if (!existsSync(agentMdPath)) {
        fail(`.github/agents/${name}.agent.md is MISSING — agent cannot be invoked from GitHub Copilot`);
      } else {
        ok(`.github/agents/${name}.agent.md — exists`);
      }
    }
  }
} else {
  fail('squad.config.ts not found at repo root');
}

// ─── Check 3: Referenced Skills Exist ─────────────────────────────────────────

console.log('\n📚 Referenced skills existence check\n');

const instructionsPath = join(ROOT, '.github', 'copilot-instructions.md');
if (existsSync(instructionsPath)) {
  const instructionsContent = readFileSync(instructionsPath, 'utf8');
  const skillRefs = [...instructionsContent.matchAll(/`(\.copilot\/skills\/[^`]+\.md)`/g)].map(m => m[1]);

  for (const ref of skillRefs) {
    const skillPath = join(ROOT, ref);
    if (!existsSync(skillPath)) {
      fail(`${ref} is referenced in .github/copilot-instructions.md but does NOT exist`);
    } else {
      ok(`${ref} — exists`);
    }
  }
} else {
  console.log('  ⚠️  .github/copilot-instructions.md not found — skipping skill reference check');
}

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log('\n' + '─'.repeat(60));
if (failures === 0) {
  console.log('✅ No template drift or structural issues detected.\n');
  process.exit(0);
} else {
  console.error(`\n❌ ${failures} issue(s) detected. Fix the above before merging.\n`);
  process.exit(1);
}
