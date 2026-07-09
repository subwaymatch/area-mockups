import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Compile the workspace package (and keep HMR working against its dist output).
  transpilePackages: ['area-mockups'],
}

export default nextConfig
