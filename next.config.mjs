import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Ensure Next.js uses the correct project root for module resolution (fixes path-with-space parent resolution)
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    // Force resolution from project root so tailwindcss and other deps resolve correctly when parent path has spaces
    config.resolve = config.resolve || {};
    config.resolve.modules = [path.resolve(__dirname, 'node_modules'), ...(config.resolve.modules || ['node_modules'])];
    config.resolve.alias = {
      ...config.resolve.alias,
      // Pin tailwindcss resolution to this project's node_modules
      tailwindcss: path.resolve(__dirname, 'node_modules/tailwindcss'),
    };
    return config;
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

export default nextConfig
