import { supabase } from '../lib/supabase';

/**
 * Test Supabase connection and configuration
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> => {
  try {
    // Test basic connection
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      return {
        success: false,
        message: 'Failed to connect to Supabase',
        details: error
      };
    }

    // Test database connectivity by checking if users table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('users')
      .select('count')
      .limit(0);

    if (tableError) {
      return {
        success: false,
        message: 'Database connection failed - tables may not exist',
        details: tableError
      };
    }

    return {
      success: true,
      message: 'Supabase connection successful',
      details: {
        session: data.session ? 'Active session found' : 'No active session',
        database: 'Database tables accessible'
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Unexpected error during connection test',
      details: error
    };
  }
};

/**
 * Validate environment configuration
 */
export const validateEnvironment = (): {
  valid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];

  // Check required environment variables
  if (!import.meta.env.VITE_SUPABASE_URL) {
    issues.push('VITE_SUPABASE_URL is not set');
  }

  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
    issues.push('VITE_SUPABASE_ANON_KEY is not set');
  }

  // Validate URL format
  try {
    if (import.meta.env.VITE_SUPABASE_URL) {
      new URL(import.meta.env.VITE_SUPABASE_URL);
    }
  } catch {
    issues.push('VITE_SUPABASE_URL is not a valid URL');
  }

  return {
    valid: issues.length === 0,
    issues
  };
};