/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",  // Forces static export
  distDir: "out",    // Ensures Vercel picks up the correct folder
  trailingSlash: true,  // Helps prevent 404 errors on static sites
};

module.exports = nextConfig;
