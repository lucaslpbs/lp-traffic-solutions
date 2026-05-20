import { createClient } from '@supabase/supabase-js';

const SUPABASE_GESTAO_URL = import.meta.env.VITE_SUPABASE_GESTAO_URL;
const SUPABASE_GESTAO_KEY = import.meta.env.VITE_SUPABASE_GESTAO_KEY;

export const supabaseGestao = createClient(SUPABASE_GESTAO_URL, SUPABASE_GESTAO_KEY, {
  global: {
    headers: {
      apikey: SUPABASE_GESTAO_KEY,
      Authorization: `Bearer ${SUPABASE_GESTAO_KEY}`,
    }
  },
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});
