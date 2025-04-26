import { createSupabaseServerClient } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  const supabase = createSupabaseServerClient(req, res);

  try {
    const { data, error } = await supabase
      .from("socks")
      .select("*")
      .limit(1);

    if (error) {
      console.error("❌ Supabase test fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch socks" });
    }

    return res.status(200).json({ message: "Supabase connection OK", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
