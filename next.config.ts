import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  // 0 = disable the legacy XSS auditor (it could be abused to *introduce*
  // XSS in old browsers); modern browsers rely on CSP instead.
  { key: 'X-XSS-Protection',          value: '0' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // 'unsafe-inline' is retained only for inline JSON-LD <script type="application/ld+json">
      // blocks, which must be inline for SEO crawlers and cannot be hashed across
      // statically-generated pages. No executable inline JS is emitted by app code
      // (gtag init runs from an external bundle), and JSON-LD is "</script>"-escaped,
      // so the inline XSS vector is minimal. 'unsafe-eval' has been removed — gtag
      // and PostHog operate without it.
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://us-assets.i.posthog.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://www.aplustechsol.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://us.i.posthog.com https://us-assets.i.posthog.com",
      "worker-src 'self' blob:",
      "frame-src https://www.google.com https://maps.google.com",
      // Clickjacking defense (modern equivalent of X-Frame-Options, honored by
      // browsers that ignore the legacy header).
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com',   pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com',     pathname: '/**' },
      { protocol: 'https', hostname: 'www.aplustechsol.com',  pathname: '/**' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
