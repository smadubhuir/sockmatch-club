// /lib/supabaseAdmin.js
import { createServerClient } from '@supabase/ssr';

export const createAdminClient = (req, res) =>
  createServerClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { req, res }
  );
