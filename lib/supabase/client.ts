// Look at how this uses createBrowserClient instead of the generic createClient
import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: any = null;

export function createClient() {
  if (supabaseInstance) return supabaseInstance;

  // createBrowserClient automatically handles cookies via the browser context
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return supabaseInstance;
}