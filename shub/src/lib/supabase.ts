import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('VITE_SUPABASE_ANON_KEY');

  throw new Error(
    `Missing required Supabase environment variables: ${missingVars.join(', ')}\n` +
    'Please copy .env.example to .env and configure your Supabase credentials.'
  );
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch {
  throw new Error('VITE_SUPABASE_URL must be a valid URL');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types aligned with MVP requirements
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          display_name: string;
          email: string;
          role: 'worker' | 'client' | 'admin';
          is_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          display_name: string;
          email: string;
          role: 'worker' | 'client' | 'admin';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          email?: string;
          role?: 'worker' | 'client' | 'admin';
          is_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      worker_profiles: {
        Row: {
          id: string;
          user_id: string;
          bio?: string;
          services: string[];
          region: string;
          availability: string[];
          hourly_rate_text?: string;
          photo_album: string[];
          condoms_mandatory: boolean;
          published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          bio?: string;
          services?: string[];
          region: string;
          availability?: string[];
          hourly_rate_text?: string;
          photo_album?: string[];
          condoms_mandatory?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          bio?: string;
          services?: string[];
          region?: string;
          availability?: string[];
          hourly_rate_text?: string;
          photo_album?: string[];
          condoms_mandatory?: boolean;
          published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      verification_docs: {
        Row: {
          id: string;
          user_id: string;
          role: 'worker' | 'client';
          selfie_url: string;
          id_front_url: string;
          status: 'pending' | 'approved' | 'rejected';
          reviewer_id?: string;
          reviewed_at?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          role: 'worker' | 'client';
          selfie_url: string;
          id_front_url: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewer_id?: string;
          reviewed_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          role?: 'worker' | 'client';
          selfie_url?: string;
          id_front_url?: string;
          status?: 'pending' | 'approved' | 'rejected';
          reviewer_id?: string;
          reviewed_at?: string;
          notes?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          worker_id: string;
          client_id: string;
          start_time: string;
          end_time: string;
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          worker_id: string;
          client_id: string;
          start_time: string;
          end_time: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          worker_id?: string;
          client_id?: string;
          start_time?: string;
          end_time?: string;
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          sender_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          sender_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          target_type: 'user' | 'booking' | 'message';
          target_id: string;
          reason: string;
          description?: string;
          status: 'open' | 'in_review' | 'resolved' | 'dismissed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          target_type: 'user' | 'booking' | 'message';
          target_id: string;
          reason: string;
          description?: string;
          status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          target_type?: 'user' | 'booking' | 'message';
          target_id?: string;
          reason?: string;
          description?: string;
          status?: 'open' | 'in_review' | 'resolved' | 'dismissed';
          created_at?: string;
          updated_at?: string;
        };
      };
      safe_buddy_tokens: {
        Row: {
          id: string;
          booking_id: string;
          token: string;
          expires_at: string;
          used: boolean;
          used_at?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          booking_id: string;
          token: string;
          expires_at: string;
          used?: boolean;
          used_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          booking_id?: string;
          token?: string;
          expires_at?: string;
          used?: boolean;
          used_at?: string;
          created_at?: string;
        };
      };
      admin_audit: {
        Row: {
          id: string;
          admin_id: string;
          action: string;
          target_type?: string;
          target_id?: string;
          details?: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id: string;
          action: string;
          target_type?: string;
          target_id?: string;
          details?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action?: string;
          target_type?: string;
          target_id?: string;
          details?: Record<string, any>;
          created_at?: string;
        };
      };
    };
  };
}