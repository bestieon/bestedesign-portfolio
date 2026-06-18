import { createBrowserClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kbrvvuauvqfsfyjxtihr.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_m0JnIGtBZUs84jMIwtYN3A_Hg5AicDf';

export function getSupabaseBrowser() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export function getSupabasePublic() {
  return createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}

export function getPublicStorageUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${supabaseUrl}/storage/v1/object/public/portfolio/${path}`;
}
