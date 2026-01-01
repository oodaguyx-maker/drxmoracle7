/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // PWA handled natively by Next.js 16 - no external packages needed
}

export default nextConfig
