import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /**
   * The book is fully client rendered and the page images ship pre-optimized as WebP,
   * so the site can be served as plain static files (Vercel, S3, GitHub Pages, ...).
   * Remove `output` if you ever need a Node server.
   */
  output: 'export',
  images: {
    // No optimizer available in a static export; page images are already WebP.
    unoptimized: true,
  },
};

export default nextConfig;
