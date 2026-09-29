import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://epxxnsixehxoggsjsckn.supabase.co';
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_PUBLISHABLE_KEY || '';

export let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log('✅ Supabase client initialized for URL:', supabaseUrl);
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
  }
} else {
  console.warn('⚠️ Missing SUPABASE_URL or SUPABASE_KEY in environment');
}

/**
 * Verifies if Supabase remote table is accessible
 */
export async function testSupabaseTable(tableName: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.from(tableName).select('count', { count: 'exact', head: true });
    if (error) {
      // 42P01 is relation does not exist in Postgres
      return false;
    }
    return true;
  } catch {
    return false;
  }
}
