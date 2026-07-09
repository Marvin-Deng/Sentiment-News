import type { NextConfig } from "next";

// "standalone" output is only needed for the self-hosted Docker/Cloud Run build.
// Vercel's build system doesn't support this output mode and returns 404s on
// every route if it's set, so it must be skipped there.
const nextConfig: NextConfig = {
  ...(process.env.VERCEL ? {} : { output: "standalone" }),
};

export default nextConfig;
