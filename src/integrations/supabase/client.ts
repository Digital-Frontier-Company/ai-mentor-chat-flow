
import { createClient } from '@supabase/supabase-js'

// Only use the anon key in client-side code
// The service role key should ONLY be used in server-side edge functions
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.VITE_SUPABASE_ANON_KEY || '',
)
