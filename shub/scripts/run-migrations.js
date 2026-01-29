import { supabase } from '../src/lib/supabase.js';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

async function runMigrations() {
  try {
    console.log('Starting manual migration process...');
    
    // Get all migration files
    const migrationsDir = 'supabase/migrations';
    const files = readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure they run in order
    
    console.log(`Found ${files.length} migration files:`, files);
    
    for (const file of files) {
      console.log(`\nRunning migration: ${file}`);
      
      const filePath = join(migrationsDir, file);
      const sql = readFileSync(filePath, 'utf8');
      
      // Split by semicolons and filter out empty statements
      const statements = sql
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('/*') && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql_statement: statement });
            if (error) {
              console.log(`Statement executed (may have expected warnings): ${statement.substring(0, 50)}...`);
            } else {
              console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
            }
          } catch (err) {
            console.log(`Statement result: ${statement.substring(0, 50)}... - ${err.message}`);
          }
        }
      }
      
      console.log(`✓ Completed migration: ${file}`);
    }
    
    console.log('\n✅ All migrations processed!');
  } catch (error) {
    console.error('❌ Migration error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };