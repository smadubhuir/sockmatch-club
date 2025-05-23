export function createSupabaseServerClient(ctx) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return ctx.req.cookies[name];
        },
        set(name, value, options) {
          ctx.res.setHeader("Set-Cookie", `${name}=${value}; Path=/; HttpOnly`);
        },
      },
    }
  );
}
