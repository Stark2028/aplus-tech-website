import type { Metadata } from "next";

/**
 * The console is a private tool, not a page. /admin/ is already disallowed in
 * app/robots.ts; this adds the meta-level noindex so a leaked link cannot be
 * indexed either.
 */
export const metadata: Metadata = {
  title: "Sales console",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
