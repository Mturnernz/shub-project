import 'dotenv/config';
import { supabase } from '../src/lib/supabase-node.js';

async function validateFilters() {
  try {
    console.log('🔍 Validating all filter functionality...\n');
    
    // Test 1: Check all hosts and their statuses
    console.log('=== HOST STATUS VALIDATION ===');
    const { data: hosts, error: hostError } = await supabase
      .from('users')
      .select('name, status, location, verified, created_at, is_published')
      .eq('type', 'host')
      .eq('is_published', true);

    if (hostError) {
      console.error('❌ Error fetching hosts:', hostError);
      return;
    }

    console.log('📋 Available hosts:');
    hosts.forEach(host => {
      console.log(`   • ${host.name} - Status: ${host.status || 'null'} - Location: ${host.location} - Verified: ${host.verified} - Created: ${new Date(host.created_at).toDateString()}`);
    });

    // Group hosts by status
    const statusGroups = hosts.reduce((groups, host) => {
      const status = host.status || 'unknown';
      if (!groups[status]) groups[status] = [];
      groups[status].push(host.name);
      return groups;
    }, {});

    console.log('\n📊 Hosts by status:');
    Object.entries(statusGroups).forEach(([status, names]) => {
      console.log(`   ${status}: ${names.join(', ')}`);
    });

    // Test 2: Check all services and their data
    console.log('\n=== SERVICE DATA VALIDATION ===');
    const { data: services, error: serviceError } = await supabase
      .from('services')
      .select(`
        title,
        host_name,
        location,
        category,
        rating,
        verified,
        available,
        created_at,
        host:users!inner (
          status,
          created_at,
          is_published
        )
      `)
      .eq('available', true)
      .eq('host.is_published', true);

    if (serviceError) {
      console.error('❌ Error fetching services:', serviceError);
      return;
    }

    console.log(`📋 Available services (${services.length} total):`);
    services.forEach(service => {
      console.log(`   • ${service.title} by ${service.host_name}`);
      console.log(`     Location: ${service.location} | Category: ${service.category} | Rating: ${service.rating}`);
      console.log(`     Host Status: ${service.host?.status} | Verified: ${service.verified}`);
      console.log(`     Service Created: ${new Date(service.created_at).toDateString()}`);
      console.log(`     Host Created: ${new Date(service.host?.created_at).toDateString()}`);
      console.log('');
    });

    // Test 3: Test availability filter
    console.log('=== AVAILABILITY FILTER TEST ===');
    const statuses = ['available', 'busy', 'away'];
    
    for (const status of statuses) {
      const { data: filteredServices, error } = await supabase
        .from('services')
        .select(`
          title,
          host_name,
          host:users!inner (
            status,
            is_published
          )
        `)
        .eq('available', true)
        .eq('host.is_published', true)
        .eq('host.status', status);

      if (error) {
        console.error(`❌ Error filtering by status '${status}':`, error);
      } else {
        console.log(`🔍 Status '${status}': ${filteredServices.length} services`);
        filteredServices.forEach(service => {
          console.log(`   • ${service.title} by ${service.host_name} (host status: ${service.host?.status})`);
        });
      }
    }

    // Test 4: Test location filter
    console.log('\n=== LOCATION FILTER TEST ===');
    const locations = ['Auckland', 'Wellington', 'Christchurch'];
    
    for (const location of locations) {
      const { data: filteredServices, error } = await supabase
        .from('services')
        .select('title, host_name, location')
        .eq('available', true)
        .eq('location', location);

      if (error) {
        console.error(`❌ Error filtering by location '${location}':`, error);
      } else {
        console.log(`🔍 Location '${location}': ${filteredServices.length} services`);
        filteredServices.forEach(service => {
          console.log(`   • ${service.title} by ${service.host_name}`);
        });
      }
    }

    // Test 5: Test rating filter
    console.log('\n=== RATING FILTER TEST ===');
    const { data: ratingServices, error: ratingError } = await supabase
      .from('services')
      .select('title, host_name, rating')
      .eq('available', true)
      .gte('rating', 4.0);

    if (ratingError) {
      console.error('❌ Error filtering by rating:', ratingError);
    } else {
      console.log(`🔍 Rating 4.0+: ${ratingServices.length} services`);
      ratingServices.forEach(service => {
        console.log(`   • ${service.title} by ${service.host_name} (${service.rating}★)`);
      });
    }

    // Test 6: Test verified filter
    console.log('\n=== VERIFIED FILTER TEST ===');
    const { data: verifiedServices, error: verifiedError } = await supabase
      .from('services')
      .select('title, host_name, verified')
      .eq('available', true)
      .eq('verified', true);

    if (verifiedError) {
      console.error('❌ Error filtering by verified:', verifiedError);
    } else {
      console.log(`🔍 Verified services: ${verifiedServices.length} services`);
      verifiedServices.forEach(service => {
        console.log(`   • ${service.title} by ${service.host_name} (verified: ${service.verified})`);
      });
    }

    console.log('\n✅ Filter validation completed!');
    
  } catch (error) {
    console.error('❌ Validation error:', error);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateFilters();
}

export { validateFilters };