import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const supabase = createSupabaseServerClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const { id } = req.body;
  const { error } = await supabase
    .from("socks")
    .delete()
    .eq("id", id)
    .eq("user_id", session.user.id);

  if (error) return res.status(500).json({ error: "Failed to delete" });

  res.status(200).json({ message: "Deleted" });
}
