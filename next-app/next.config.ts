import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle in `.next/standalone` for lean Docker /
  // VPS images (see Dockerfile). Vercel ignores this and uses its own builder,
  // so it is safe to keep enabled everywhere.
  output: "standalone",
};

export default nextConfig;
