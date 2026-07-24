import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Auth Helpers
export const signUpUser = async ({ email, password, fullName, storeName }) => {
  if (!isSupabaseConfigured) {
    // Demo Mode fallback
    const demoUser = { id: `demo-user-${Date.now()}`, email, user_metadata: { full_name: fullName, store_name: storeName } };
    localStorage.setItem('diecast_demo_user', JSON.stringify(demoUser));
    return { data: { user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        store_name: storeName,
      },
    },
  });

  return { data, error };
};

export const signInUser = async ({ email, password }) => {
  if (!isSupabaseConfigured) {
    // Demo Mode login fallback
    const demoUser = { id: 'demo-user-123', email, user_metadata: { full_name: 'Colecionador Lojista', store_name: 'Diecast Pre-Orders Store' } };
    localStorage.setItem('diecast_demo_user', JSON.stringify(demoUser));
    return { data: { user: demoUser }, error: null };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
};

export const signOutUser = async () => {
  if (!isSupabaseConfigured) {
    localStorage.removeItem('diecast_demo_user');
    return { error: null };
  }

  const { error } = await supabase.auth.signOut();
  return { error };
};

export const resetUserPassword = async (email) => {
  if (!isSupabaseConfigured) {
    return { error: null };
  }

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  return { data, error };
};
