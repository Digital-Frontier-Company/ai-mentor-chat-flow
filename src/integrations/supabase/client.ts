
import { createClient } from '@supabase/supabase-js'

// Only use the anon key in client-side code
// The service role key should ONLY be used in server-side edge functions
export const supabase = createClient(
  'https://bapditcjlxctrisoixpg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcGRpdGNqbHhjdHJpc29peHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTMyMjYsImV4cCI6MjA2MDA4OTIyNn0.PbWHccOo4k86y4s5pgCTpZiC1Pyn0xuHVrm1IrHJnBA'
)
