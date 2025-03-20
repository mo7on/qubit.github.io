import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with the anonymous key for client-side requests
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create a Supabase admin client with the service role key for server-side requests
// This has admin privileges and should only be used in secure server contexts
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to get user by ID
export async function getUserById(userId: string) {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

// Helper function to check if a user exists
export async function userExists(userId: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();
  
  return !!data && !error;
}