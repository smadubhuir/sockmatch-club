import formidable from "formidable";
import fs from "fs";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";  // Import Firebase from our config
import { collection, addDoc } from "firebase/firestore";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Form parsing failed" });

    const { name, price, color, pattern, description } = fields;
    const image = files.image;

    if (!image) return res.status(400).json({ error: "No image provided" });

    try {
      // Read file buffer
      const fileBuffer = await fs.promises.readFile(image.filepath);

      // Upload image to Firebase Storage
      const storageRef = ref(storage, `socks/${image.originalFilename}`);
      await uploadBytes(storageRef, fileBuffer);

      // Get image URL from Firebase Storage
      const imageUrl = await getDownloadURL(storageRef);

      // Save sock data to Firestore
      await addDoc(collection(db, "socks"), {
        name, price, color, pattern, description, imageUrl,
        createdAt: new Date(),
      });

      res.status(200).json({ message: "Sock uploaded!", imageUrl });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: "Upload failed" });
    }
  });
}
