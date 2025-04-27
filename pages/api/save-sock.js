import { createSupabaseServerClient } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, embedding, userId } = req.body;

  if (!imageUrl || !embedding || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("socks")
      .insert([
        {
          image_url: imageUrl,
          embedding: embedding,
          user_id: userId,
        }
      ]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save sock" });
    }

    return res.status(200).json({ message: "Sock saved successfully", data });
  } catch (err) {
    console.error("❌ API Error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
