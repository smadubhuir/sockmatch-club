import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "dilhl61st",
  api_key: process.env.CLOUDINARY_API_KEY || "369811978667215",
  api_secret: process.env.CLOUDINARY_API_SECRET || "bX0nw-F2j_Yj0HdzWF3zXwq-MQM",
});

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const response = await cloudinary.search
      .expression("folder:sockmatch")
      .sort_by("created_at", "desc")
      .max_results(6)
      .execute();

    if (!response || !response.resources) {
      console.error("Invalid Cloudinary response:", response);
      return res.status(500).json({ error: "Cloudinary returned an invalid response" });
    }

    // Debugging log
    console.log("Cloudinary API Response:", JSON.stringify(response, null, 2));

    // Properly format the API response
    const socks = response.resources.map((sock) => ({
      imageUrl: sock.secure_url.replace("/upload/", "/upload/w_300,h_300,c_fill,q_auto,f_auto/"),
      name: sock.public_id.split("/").pop().replace(/\.[^/.]+$/, ""), // Extract name without file extension
    }));

    res.status(200).json({ socks });
  } catch (error) {
    console.error("Error fetching socks from Cloudinary:", error);
    res.status(500).json({ error: "Failed to fetch socks" });
  }
}
