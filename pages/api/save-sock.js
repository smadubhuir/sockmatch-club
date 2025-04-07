import { supabase } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, embedding } = req.body;

  if (!imageUrl || !embedding) {
    return res.status(400).json({ error: "Missing imageUrl or embedding" });
  }

  const { data, error } = await supabase
    .from("socks")
    .insert([
      {
        image_url: imageUrl,
        embedding: embedding,
        created_at: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error("❌ Supabase insert error:", error);
    return res.status(500).json({ error: "Failed to save to Supabase" });
  }

  res.status(200).json({ success: true, data });
}

