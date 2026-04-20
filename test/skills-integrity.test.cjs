'use strict';
/**
 * skills-integrity.test.cjs
 *
 * Skill integrity eval: verifies that all SKILL.md files are well-formed,
 * referenced skills exist, and skill frontmatter is valid.
 *
 * This prevents the "skill referenced but missing" failure mode where agents
 * are told to read a skill that doesn't exist, causing silent degradation.
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

function collectSkillFiles(dir) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      const skillPath = path.join(dir, entry.name, 'SKILL.md');
      if (fs.existsSync(skillPath)) {
        results.push({ name: entry.name, path: skillPath });
      }
    }
  }
  return results;
}

// ─── Collect all skill files ───────────────────────────────────────────────────

const copilotSkills = collectSkillFiles(path.join(ROOT, '.copilot', 'skills'));
const squadSkills   = collectSkillFiles(path.join(ROOT, '.squad', 'skills'));
const allSkills     = [...copilotSkills, ...squadSkills];

// ─── Required .copilot/skills/ ────────────────────────────────────────────────

const REQUIRED_COPILOT_SKILLS = [
  'reviewer-protocol',
  'architectural-review',
  'security-review',
  'agent-collaboration',
  'pr-lifecycle',
  'git-workflow',
];

const REQUIRED_SQUAD_SKILLS = [
  'prd-intake',
  'session-recovery',
  'ralph-two-pass-scan',
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Required .copilot/skills/ exist', () => {
  for (const skillName of REQUIRED_COPILOT_SKILLS) {
    test(`.copilot/skills/${skillName}/SKILL.md exists`, () => {
      const skillPath = path.join(ROOT, '.copilot', 'skills', skillName, 'SKILL.md');
      assert.ok(
        fs.existsSync(skillPath),
        `Missing required skill: .copilot/skills/${skillName}/SKILL.md`
      );
    });
  }
});

describe('Required .squad/skills/ exist', () => {
  for (const skillName of REQUIRED_SQUAD_SKILLS) {
    test(`.squad/skills/${skillName}/SKILL.md exists`, () => {
      const skillPath = path.join(ROOT, '.squad', 'skills', skillName, 'SKILL.md');
      assert.ok(
        fs.existsSync(skillPath),
        `Missing required skill: .squad/skills/${skillName}/SKILL.md`
      );
    });
  }
});

describe('SKILL.md frontmatter validity', () => {
  for (const { name, path: skillPath } of allSkills) {
    test(`${name}/SKILL.md has YAML frontmatter with name field`, () => {
      const content = readFile(skillPath);
      assert.ok(content?.startsWith('---'), `${name}/SKILL.md must start with YAML frontmatter (---)`);
      assert.ok(content?.includes('name:'), `${name}/SKILL.md frontmatter missing 'name:' field`);
      assert.ok(content?.includes('description:'), `${name}/SKILL.md frontmatter missing 'description:' field`);
    });

    test(`${name}/SKILL.md has ## Patterns or ## Context section`, () => {
      const content = readFile(skillPath);
      const hasPatterns = content?.includes('## Patterns') || content?.includes('## Pattern');
      const hasContext = content?.includes('## Context');
      assert.ok(
        hasPatterns || hasContext,
        `${name}/SKILL.md missing ## Patterns or ## Context section — add instructional content`
      );
    });

    test(`${name}/SKILL.md is not a placeholder (>200 chars)`, () => {
      const content = readFile(skillPath);
      assert.ok(
        (content?.length ?? 0) > 200,
        `${name}/SKILL.md looks like a placeholder (${content?.length} chars) — needs real content`
      );
    });
  }
});

describe('Skills referenced in copilot-instructions.md exist', () => {
  const instructionsPath = path.join(ROOT, '.github', 'copilot-instructions.md');
  const content = readFile(instructionsPath);

  if (!content) {
    test('.github/copilot-instructions.md exists', () => {
      assert.ok(false, '.github/copilot-instructions.md not found');
    });
  } else {
    const skillRefs = [...content.matchAll(/`(\.copilot\/skills\/[^`]+\.md)`/g)].map(m => m[1]);
    for (const ref of skillRefs) {
      test(`Referenced skill exists: ${ref}`, () => {
        const skillPath = path.join(ROOT, ref);
        assert.ok(
          fs.existsSync(skillPath),
          `${ref} is referenced in copilot-instructions.md but the file does NOT exist`
        );
      });
    }
  }
});
