// pages/api/get-profile.js
import { supabaseServer } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "Missing user_id" });
  }

  const supabase = supabaseServer();

  try {
    // Fetch the user's profile
    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user_id)
      .single();

    if (error) throw error;

    // If profile does not exist, create it
    if (!data) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ id: user_id, avatar_url: "/default-avatar.png" });

      if (insertError) throw insertError;

      return res.status(201).json({ message: "Profile created", profile: { id: user_id, avatar_url: "/default-avatar.png" } });
    }

    // If the profile exists, return it
    return res.status(200).json({ profile: data });
  } catch (err) {
    console.error("Error in get-profile API:", err);
    return res.status(500).json({ error: "Server error" });
  }
}
