import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://buksyxugzvutdvkaelno.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ1a3N5eHVnenZ1dGR2a2FlbG5vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3NzM4OTUsImV4cCI6MjA2MTM0OTg5NX0.PPHw-3giIUYjNS7dIB4myUb12ZxKjSIfGsALKTgTnx8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
}); 