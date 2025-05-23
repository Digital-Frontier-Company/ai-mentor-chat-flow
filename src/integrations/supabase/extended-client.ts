
import { createClient } from '@supabase/supabase-js';
import type { ExtendedDatabase } from '@/types/supabase-extensions';

// Only use the anon key in client-side code
// The service role key should ONLY be used in server-side edge functions
export const extendedSupabase = createClient<ExtendedDatabase>(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
);
