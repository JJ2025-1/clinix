/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Removed basePath and assetPrefix for Vercel deployment to avoid 404s at the root.
  // If you need GitHub Pages support, consider using an environment variable like process.env.GITHUB_ACTIONS.
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
