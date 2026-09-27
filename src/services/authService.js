import { supabase, hasSupabaseConfig } from '../lib/supabase';

export async function signInWithEmail(email, password) {
  if (!hasSupabaseConfig || !supabase) {
    return { user: null, error: new Error('PYLO is not configured correctly.') };
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data?.user ?? null, error };
  } catch (err) {
    console.error('PYLO Web: signInWithPassword request failed', err);
    return { user: null, error: err };
  }
}

export async function signOut() {
  if (!hasSupabaseConfig || !supabase) return;
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('PYLO Web: signOut error', error.message);
    }
  } catch (err) {
    console.error('PYLO Web: signOut request failed', err);
  }
}

export async function getCurrentUser() {
  if (!hasSupabaseConfig || !supabase) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  } catch {
    return null;
  }
}