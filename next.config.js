/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",  // Forces static export mode
  trailingSlash: true  // Ensures Next.js generates files correctly
};

module.exports = nextConfig;
