
import { createClient } from '@supabase/supabase-js';
import type { ExtendedDatabase } from '@/types/supabase-extensions';

const SUPABASE_URL = "https://bapditcjlxctrisoixpg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcGRpdGNqbHhjdHJpc29peHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTMyMjYsImV4cCI6MjA2MDA4OTIyNn0.PbWHccOo4k86y4s5pgCTpZiC1Pyn0xuHVrm1IrHJnBA";

// Create an extended Supabase client with our extended Database type
export const extendedSupabase = createClient<ExtendedDatabase>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
