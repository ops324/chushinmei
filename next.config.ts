import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const supabaseHostname = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: supabaseHostname
      ? [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ]
      : [],
  },
};

// Sentry のビルド時設定。SENTRY_AUTH_TOKEN が無い環境（ローカル/CI）では
// ソースマップのアップロードを無効化し、ビルドが失敗しないようにする。
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});
