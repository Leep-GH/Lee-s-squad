'use strict';
/**
 * bootstrap-safety.test.cjs
 *
 * Zero-dependency regression test: verifies that protected CLI bootstrap files
 * do NOT import any non-built-in modules.
 *
 * These files run BEFORE the Squad SDK is loaded. Any external import breaks
 * the CLI at startup with no helpful error message.
 *
 * See .github/copilot-instructions.md → "Protected Files" section for the
 * authoritative list and rationale.
 */

const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

// ─── Protected file list (must match .github/copilot-instructions.md) ─────────

const PROTECTED_FILES = [
  'packages/squad-cli/src/cli/core/detect-squad-dir.ts',
  'packages/squad-cli/src/cli/core/errors.ts',
  'packages/squad-cli/src/cli/core/gh-cli.ts',
  'packages/squad-cli/src/cli/core/output.ts',
  'packages/squad-cli/src/cli/core/history-split.ts',
];

// Patterns that indicate an external (non-built-in) import
const EXTERNAL_IMPORT_PATTERNS = [
  // npm package imports (not starting with 'node:')
  /^import .+ from ['"](?!node:)[^.\/][^'"]*['"]/m,
  // require() calls (not starting with 'node:')
  /require\(['"](?!node:)[^.\/][^'"]*['"]\)/m,
  // relative imports that cross into the SDK
  /from ['"].*squad-sdk['"]/m,
  /from ['"].*@bradygaster['"]/m,
];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Protected bootstrap files — zero external dependencies', () => {
  for (const relPath of PROTECTED_FILES) {
    const absPath = path.join(ROOT, relPath);

    test(`${relPath} exists`, () => {
      assert.ok(
        fs.existsSync(absPath),
        `Protected file missing: ${relPath} — if it was renamed, update PROTECTED_FILES in this test AND in .github/copilot-instructions.md`
      );
    });

    test(`${relPath} has no external imports`, () => {
      if (!fs.existsSync(absPath)) return; // sibling test catches the missing file

      const content = fs.readFileSync(absPath, 'utf8');

      for (const pattern of EXTERNAL_IMPORT_PATTERNS) {
        const match = content.match(pattern);
        assert.ok(
          !match,
          `${relPath} contains a forbidden external import: "${match?.[0]?.trim()}"\n` +
          `This file MUST only use node:* built-in modules. See .github/copilot-instructions.md → Protected Files.`
        );
      }
    });

    test(`${relPath} has the zero-dependencies marker comment`, () => {
      if (!fs.existsSync(absPath)) return;
      const content = fs.readFileSync(absPath, 'utf8');
      // Check for the marker in the first 20 lines
      const header = content.split('\n').slice(0, 20).join('\n');
      assert.ok(
        header.includes('zero dependencies') || header.includes('zero-dependencies') || header.includes('no external'),
        `${relPath} is missing the "zero dependencies" marker comment in its file header.\n` +
        `Add a comment like: // — zero dependencies — uses only node:* built-ins`
      );
    });
  }
});

describe('Protected file list completeness', () => {
  test('.github/copilot-instructions.md mentions all protected files', () => {
    const instructionsPath = path.join(ROOT, '.github', 'copilot-instructions.md');
    if (!fs.existsSync(instructionsPath)) {
      assert.ok(false, '.github/copilot-instructions.md not found');
      return;
    }
    const content = fs.readFileSync(instructionsPath, 'utf8');
    for (const relPath of PROTECTED_FILES) {
      const fileName = path.basename(relPath);
      assert.ok(
        content.includes(fileName),
        `Protected file '${fileName}' (${relPath}) is in the test list but NOT mentioned in .github/copilot-instructions.md — update the Protected Files table`
      );
    }
  });
});
