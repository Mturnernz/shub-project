#!/usr/bin/env node
/**
 * run-migrations.js
 *
 * Applies every SQL file in supabase/migrations/ (in filename order) to the
 * database identified by the DATABASE_URL environment variable.
 *
 * Uses psql directly, which avoids the need for a custom exec_sql RPC and
 * handles multi-statement files (DO blocks, triggers, etc.) correctly.
 *
 * Usage (from the shub/ directory):
 *   npm run db:migrate          # loads .env automatically
 *   DATABASE_URL=<url> node scripts/run-migrations.js
 */

import { readFileSync, readdirSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

// ---------------------------------------------------------------------------
// Load .env so DATABASE_URL is available when run directly with node
// ---------------------------------------------------------------------------
try {
  const require = createRequire(import.meta.url);
  const { config } = require('dotenv');
  config({ path: resolve(process.cwd(), '.env') });
} catch {
  // dotenv not available — rely on env vars being set externally
}

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error(
    '❌  DATABASE_URL is not set.\n' +
    '    Copy .env.example to .env and fill in your database credentials,\n' +
    '    or set DATABASE_URL before running this script.'
  );
  process.exit(1);
}

async function runMigrations() {
  const migrationsDir = resolve(process.cwd(), 'supabase/migrations');
  let files;

  try {
    files = readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
  } catch {
    console.error(`❌  Migration directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  if (files.length === 0) {
    console.log('No migration files found — nothing to do.');
    return;
  }

  console.log(`\n🗄️  Running ${files.length} migration file(s) against:\n   ${DATABASE_URL.replace(/:\/\/.*@/, '://<credentials>@')}\n`);

  let passed = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = join(migrationsDir, file);
    console.log(`▶  ${file}`);

    try {
      execSync(`psql "${DATABASE_URL}" -f "${filePath}" --set ON_ERROR_STOP=1`, {
        stdio: 'pipe',
        encoding: 'utf8',
      });
      console.log(`   ✓ done\n`);
      passed++;
    } catch (err) {
      const output = (err.stdout || '') + (err.stderr || '');
      console.error(`   ✗ FAILED\n${output.trim()}\n`);
      failed++;
      // Stop on first failure so subsequent migrations don't run on a bad state
      break;
    }
  }

  if (failed === 0) {
    console.log(`✅  All ${passed} migration(s) applied successfully.`);
  } else {
    console.error(`\n❌  Migration stopped after failure. ${passed} passed, ${failed} failed.`);
    process.exit(1);
  }
}

runMigrations();
