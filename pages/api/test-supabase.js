import { supabase } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  const { data, error } = await supabase.from("socks").select("*").limit(1);
  if (error) {
    return res.status(500).json({ error });
  }
  res.status(200).json({ success: true, data });
}

