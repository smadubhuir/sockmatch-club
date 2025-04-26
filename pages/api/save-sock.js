import { supabase } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { imageUrl, embedding, userId } = req.body;

  if (!imageUrl || !embedding || !userId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const { data, error } = await supabase
      .from("socks") // your socks table
      .insert([
        {
          image_url: imageUrl,
          embedding: embedding,
          user_id: userId,
        },
      ]);

    if (error) {
      console.error(error);
      return res.status(500).json({ error: "Failed to save sock" });
    }

    return res.status(200).json({ message: "Sock saved successfully", data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
