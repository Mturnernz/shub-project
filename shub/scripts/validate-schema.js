import { supabase } from '../src/lib/supabase-node.js';

async function validateSchema() {
  try {
    console.log('🔍 Validating database schema...\n');
    
    // Check if required tables exist
    const tables = ['users', 'services', 'bookings'];
    
    for (const table of tables) {
      console.log(`Checking table: ${table}`);
      
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ Table ${table} issue:`, error.message);
      } else {
        console.log(`✅ Table ${table} exists and is accessible`);
      }
    }
    
    // Check RLS policies
    console.log('\n🔒 Checking Row Level Security...');
    
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies')
      .catch(() => ({ data: null, error: 'Cannot check policies' }));
    
    if (policyError) {
      console.log('⚠️  Cannot verify RLS policies:', policyError);
    } else {
      console.log('✅ RLS policies check completed');
    }
    
    // Test basic operations
    console.log('\n🧪 Testing basic operations...');
    
    // Test reading services (should work for anon users)
    const { data: services, error: servicesError } = await supabase
      .from('services')
      .select('id, title')
      .limit(1);
    
    if (servicesError) {
      console.log('❌ Services read test failed:', servicesError.message);
    } else {
      console.log(`✅ Services read test passed (${services?.length || 0} records)`);
    }
    
    console.log('\n✅ Schema validation completed!');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateSchema();
}

export { validateSchema };