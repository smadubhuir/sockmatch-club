import { supabase } from "../../lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed, use POST" });
  }

  const { embedding } = req.body;

  if (!embedding || !Array.isArray(embedding) || embedding.length !== 1024) {
    return res.status(400).json({ error: "Invalid or missing embedding" });
  }

  try {
    const { data, error } = await supabase.rpc("match_socks", {
      query_embedding: embedding,
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ matches: data });
  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ error: "Unexpected error: " + err.message });
  }
}
