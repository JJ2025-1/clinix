import path from 'path';

/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS || false;

const nextConfig = {
  reactCompiler: true,
  output: 'export',
  // On GitHub Pages, we need the subpath. On Vercel, we use the root.
  basePath: isGithubActions ? '/clinix' : '',
  assetPrefix: isGithubActions ? '/clinix' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  turbopack: {
    root: path.resolve('.'),
  },
};

export default nextConfig;
