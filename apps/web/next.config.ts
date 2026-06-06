import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/api-client",
    "@workspace/app",
    "@workspace/ui",
    "@workspace/web-ui",
  ],
}

export default nextConfig
