import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: ['@koda/shared', '@koda/db', '@koda/gamification'],
}

export default nextConfig
