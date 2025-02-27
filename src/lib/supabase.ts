import { createClient, Session } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const signInWithGitHub = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });

  if (error) throw error;
  return data;
};

export const handleAuthStateChange = (callback: (session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session);
  });
}; 