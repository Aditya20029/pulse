import type { NextConfig } from "next";

// Content-Security-Policy tuned for this app:
// - script/style 'unsafe-inline' + 'unsafe-eval': required by Next's runtime
//   and some WebGL paths. (Strict nonce CSP would need middleware and is
//   fragile with react-three-fiber.)
// - img/connect: self + data/blob (canvas textures) + jsDelivr (world-atlas) +
//   https (news favicons etc.)
// - frame-src youtube: the embedded live channels.
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://cdn.jsdelivr.net https://earthquake.usgs.gov",
  "worker-src 'self' blob:",
  "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
];

const baseSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "geolocation=(), camera=(), payment=(), usb=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  devIndicators: false,
  async headers() {
    return [
      {
        // Everything except /embed: lock framing to same origin (anti-clickjacking)
        source: "/((?!embed).*)",
        headers: [
          ...baseSecurityHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Content-Security-Policy",
            value: [...cspDirectives, "frame-ancestors 'self'"].join("; "),
          },
        ],
      },
      {
        // /embed widget: intentionally framable by any site
        source: "/embed",
        headers: [
          ...baseSecurityHeaders,
          {
            key: "Content-Security-Policy",
            value: [...cspDirectives, "frame-ancestors *"].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
