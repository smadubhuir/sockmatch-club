import { createServerClient } from '@supabase/ssr';

export function createSupabaseServerClient(req, res) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies[name];
        },
        set(name, value, options) {
          res.cookie(name, value, options);
        },
        remove(name, options) {
          res.clearCookie(name, options);
        },
      },
    }
  );
}
