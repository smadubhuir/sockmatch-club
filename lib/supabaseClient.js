// lib/supabaseClient.js
import { createBrowserClient, createServerClient } from "@supabase/ssr";

// Client-Side Supabase Client (Browser)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-Side Supabase Client (for API routes or SSR)
export const supabaseServer = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY
  );
};
