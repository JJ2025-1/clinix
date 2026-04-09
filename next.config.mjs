/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  reactCompiler: true,
  output: 'export',
  // Only use the subpath in production (GitHub Pages)
  basePath: isProd ? '/clinix' : '',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
