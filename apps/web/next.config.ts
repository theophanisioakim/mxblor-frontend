import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: [
    "@workspace/api-client",
    "@workspace/app",
    "@workspace/i18n",
    "@workspace/ui",
    "@workspace/web-ui",
  ],
}

export default nextConfig
