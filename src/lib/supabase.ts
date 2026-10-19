import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');
const supabaseRoleKey = getEnv('VITE_SUPABASE_ROLE_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not defined in environment variables');
}

if (supabaseRoleKey && !supabaseRoleKey.startsWith('eyJ')) {
  console.warn('VITE_SUPABASE_ROLE_KEY appears to be missing or invalid');
}

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const supabaseService = supabaseRoleKey
  ? createClient(supabaseUrl, supabaseRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        storage: dummyStorage,
      },
    })
  : null;
