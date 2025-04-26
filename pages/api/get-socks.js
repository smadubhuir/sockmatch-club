import { createSupabaseServerClient } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = createSupabaseServerClient(req, res);

  try {
    const { data: socks, error } = await supabase
      .from("socks")
      .select("image_url, name, color, pattern, price, created_at")
      .order("created_at", { ascending: false })
      .limit(30); // adjust if needed

    if (error) {
      console.error("❌ Supabase fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch socks from Supabase" });
    }

    res.status(200).json({ socks });
  } catch (err) {
    console.error("❌ API Error:", err);
    res.status(500).json({ error: "Unexpected server error" });
  }
}
