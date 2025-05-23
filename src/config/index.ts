/**
 * Centralized configuration for the application
 * This file contains all configuration values that can be shared across
 * both client-side code and edge functions
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: 'https://bapditcjlxctrisoixpg.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhcGRpdGNqbHhjdHJpc29peHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1MTMyMjYsImV4cCI6MjA2MDA4OTIyNn0.PbWHccOo4k86y4s5pgCTpZiC1Pyn0xuHVrm1IrHJnBA'
};

/**
 * In a production environment, you might want to retrieve these values from environment variables
 * if they're properly configured:
 * 
 * export const SUPABASE_CONFIG = {
 *   url: import.meta.env.VITE_SUPABASE_URL || fallbackUrl,
 *   anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || fallbackAnonKey
 * };
 */

// Other API configurations can be added here
export const API_CONFIG = {
  // Add other API configurations here as needed
};
