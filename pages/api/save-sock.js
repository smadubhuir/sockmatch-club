import { supabaseAdmin } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, embedding, userId, price, offer } = req.body;

  if (!imageUrl || !embedding || !price || !offer) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("socks")
      .insert([
        {
          image_url: imageUrl,
          embedding,
          user_id: userId || null,   // ✅ allow anonymous
          price: price,
          offer: offer,
        },
      ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save sock" });
    }

    return res.status(200).json({ message: "Sock saved successfully", data });
  } catch (err) {
    console.error("Unexpected API Error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
}
