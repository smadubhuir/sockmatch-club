import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // or whatever latest
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price, sockImageUrl } = req.body;

  if (!price || !sockImageUrl) {
    return res.status(400).json({ error: "Missing price or image URL" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "SockMatch - Single Sock",
              images: [sockImageUrl],
            },
            unit_amount: Math.round(price * 100), // cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${req.headers.origin}/success`,
      cancel_url: `${req.headers.origin}/browse`,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
}

