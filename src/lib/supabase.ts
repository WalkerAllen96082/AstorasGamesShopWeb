import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

// Log warning if using placeholder values
if (supabaseUrl === 'https://placeholder.supabase.co' || supabaseKey === 'placeholder-key') {
  console.warn('Using placeholder Supabase credentials. Please update .env file with your actual Supabase project details.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);