import supabase from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, embedding, userId, price, buyOffer } = req.body;

  // Only require imageUrl and embedding
  if (!imageUrl || !embedding || !Array.isArray(embedding)) {
    return res.status(400).json({ error: "Missing or invalid imageUrl or embedding" });
  }

  try {
    const { data, error } = await supabase
      .from("socks")
      .insert([
        {
          image_url: imageUrl,
          embedding,
          user_id: userId || null,
          price: price !== undefined ? parseFloat(price) : null,
          buy_offer: buyOffer !== undefined ? parseFloat(buyOffer) : null,
        },
      ]);

    if (error) {
      console.error("❌ Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to save sock", details: error.message });
    }

    return res.status(200).json({ message: "Sock saved successfully", data });
  } catch (err) {
    console.error("❌ Unexpected API Error:", err);
    return res.status(500).json({ error: "Unexpected server error", details: err.message });
  }
}
