/**
 * Centralized configuration for the application
 * This file contains all configuration values that can be shared across
 * both client-side code and edge functions
 */

// Supabase Configuration - using environment variables when available
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://bapditcjlxctrisoixpg.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcGRpdGNqbHhjdHJpc29peHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTMyMjYsImV4cCI6MjA2MDA4OTIyNn0.PbWHccOo4k86y4s5pgCTpZiC1Pyn0xuHVrm1IrHJnBA'
};

// Other API configurations can be added here
export const API_CONFIG = {
  // Add other API configurations here as needed
};
