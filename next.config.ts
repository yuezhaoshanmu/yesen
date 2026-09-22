import type { NextConfig } from 'next';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
const nextConfig = (phase: string): NextConfig => ({
  // A build must never replace chunks used by a running development server.
  distDir: process.env.NEXT_BUILD_DIR || (phase === PHASE_DEVELOPMENT_SERVER ? '.next-dev' : '.next'),
  poweredByHeader: false,
  images: { formats: ['image/avif', 'image/webp'], qualities: [75, 85, 90] },
});
export default nextConfig;
