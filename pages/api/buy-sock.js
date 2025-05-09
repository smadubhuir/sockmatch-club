// /pages/api/buy-sock.js
import { supabaseServer } from "@/lib/supabaseClient";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { sockId, buyerId } = req.body;

  if (!sockId || !buyerId) {
    return res.status(400).json({ error: "Missing sockId or buyerId" });
  }

  try {
    // Start a transaction
    const { data: sock, error: sockError } = await supabaseServer
      .from("socks")
      .select("*")
      .eq("id", sockId)
      .single();

    if (sockError) {
      throw sockError;
    }

    // Security: Prevent buyers from buying their own sock
    if (sock.uploader_id === buyerId) {
      return res.status(400).json({ error: "You cannot buy your own sock." });
    }

    // Check if already sold
    if (sock.sold) {
      return res.status(400).json({ error: "This sock has already been sold." });
    }

    // Check if sock is for sale
    if (!sock.price_sell) {
      return res.status(400).json({ error: "This sock is not for sale." });
    }

    // Start the transaction
    const { error: saleError } = await supabaseServer.rpc("perform_sale", {
      sock_id: sockId,
      buyer_id: buyerId,
      seller_id: sock.uploader_id,
      sale_price: sock.price_sell,
    });

    if (saleError) {
      throw saleError;
    }

    // Notify the seller
    await supabaseServer
      .from("notifications")
      .insert([
        {
          user_id: sock.uploader_id,
          message: `Your sock has been purchased for $${sock.price_sell}.`,
          type: "sale",
          link: `/socks/${sockId}`,
          created_at: new Date().toISOString(),
        },
      ]);

    return res.status(200).json({ success: true, message: "Sock purchased successfully." });

  } catch (error) {
    console.error("Error purchasing sock:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
}
