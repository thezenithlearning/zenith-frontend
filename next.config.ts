import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // /faq was renamed to /qna.
      { source: "/faq", destination: "/qna", permanent: true },
      // NOTE: do not add an apex -> www redirect here. Vercel's domain settings
      // already canonicalise between thezenithlearning.com and www.thezenithlearning.com; a rule in
      // this file pointing the other way produces an infinite redirect loop.
      {
        // Legacy course URLs (/course/<category>/<course>) from before the
        // route flattening; excludes /course/category/*, which is a real route.
        source: "/course/:category((?!category/)[^/]+)/:slug",
        destination: "/course/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    // Keep the existing custom CDN loader.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
};

export default nextConfig;
