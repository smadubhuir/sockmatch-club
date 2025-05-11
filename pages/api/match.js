// /pages/api/match.js
import { supabase } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { embedding, threshold = 0.7 } = req.body;

  if (!embedding || !Array.isArray(embedding)) {
    return res.status(400).json({ error: "Missing or invalid embedding" });
  }

  try {
    // Use Supabase RPC for fast, server-side matching
    const { data, error } = await supabase.rpc("match_socks", {
      query_embedding: embedding,
      threshold: parseFloat(threshold)
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      return res.status(500).json({ error: "Failed to match socks." });
    }

    // If no matches found, try a lower threshold
    if (data.length === 0) {
      const { data: fallbackData } = await supabase.rpc("match_socks", {
        query_embedding: embedding,
        threshold: 0.5
      });
      return res.status(200).json({ matches: fallbackData });
    }

    res.status(200).json({ matches: data });
  } catch (error) {
    console.error("Error processing match request:", error);
    return res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
}
