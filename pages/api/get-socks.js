import { createSupabaseServerClient } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data: socks, error } = await supabaseAdmin
      .from("socks")
      .select("id, image_url, created_at, price, price_buy, price_sell, user_id")
      .order("created_at", { ascending: false })
      .limit(30);

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
