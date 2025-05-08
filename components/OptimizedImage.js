// components/OptimizedImage.js
import Image from "next/image";

export default function OptimizedImage({ src, alt, width, height, className }) {
  // Apply automatic optimization for Cloudinary images
  const optimizedSrc = src
    ? src.includes("res.cloudinary.com")
      ? `${src}?f_auto,q_auto:good`
      : src
    : "/default-avatar.png"; // Default fallback for missing images

  return (
    <Image
      src={optimizedSrc}
      alt={alt || "Image"}
      width={width || 128}
      height={height || 128}
      className={className || "object-cover rounded"}
      unoptimized={false} // Keep Next.js optimization for non-Cloudinary images
    />
  );
}

