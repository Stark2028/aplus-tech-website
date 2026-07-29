import type { NextConfig } from 'next';

// React's dev server (Turbopack/HMR) needs eval() for debugging features.
// Production React never uses eval(), so 'unsafe-eval' is added in development
// ONLY — the production CSP stays strict (no unsafe-eval).
const isDev = process.env.NODE_ENV !== 'production';
const scriptSrc = [
  "script-src 'self' 'unsafe-inline'",
  isDev ? "'unsafe-eval'" : '',
  'https://www.googletagmanager.com',
]
  .filter(Boolean)
  .join(' ');

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
      // so the inline XSS vector is minimal. 'unsafe-eval' is dev-only (see above) —
      // production stays strict; gtag operates without it.
      scriptSrc,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Firebase: Firestore streams over *.googleapis.com; auth uses
      // identitytoolkit + securetoken; Storage serves attachments. FCM is
      // listed now so Phase 2 does not need a CSP change of its own.
      // www.google.com / www.google.co.in: gtag's connectivity + Google Signals
      // pixels (images/cleardot.gif, /ads/ga-audiences) — image beacons only,
      // deliberately NOT added to script-src or connect-src.
      "img-src 'self' data: blob: https://images.unsplash.com https://plus.unsplash.com https://www.aplustechsol.com https://www.google-analytics.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.google.com https://www.google.co.in https://firebasestorage.googleapis.com",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://*.googleapis.com https://firestore.googleapis.com https://fcm.googleapis.com https://firebaseinstallations.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebasestorage.googleapis.com https://*.gstatic.com",
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
  // proxy.ts owns trailing-slash normalisation so legacy redirects resolve in
  // ONE hop (Next's own strip-slash 308 would otherwise run first). See the
  // trailing-slash block in proxy.ts before changing this.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    // Cache optimised images for 7 days on the CDN edge —
    // avoids re-optimisation on every cold start and reduces TTFB for images.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    // Trimmed to only sizes we actually request via `sizes` props —
    // fewer size entries = less work for the image optimizer on first hit.
    imageSizes: [48, 96, 256, 384, 512],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com',   pathname: '/**' },
      { protocol: 'https', hostname: 'plus.unsplash.com',     pathname: '/**' },
      { protocol: 'https', hostname: 'www.aplustechsol.com',  pathname: '/**' },
    ],
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
