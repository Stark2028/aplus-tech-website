/**
 * Origin-chip labels for the chat widget.
 *
 * The site title template is `%s | Aplus Technology Solutions` (app/layout.tsx),
 * so most page titles read "Page Name | Aplus Technology Solutions". The home
 * default is "Aplus Technology Solutions | Authorized …" — brand at the FRONT —
 * so we split on the separator and take the first segment rather than stripping a
 * trailing suffix (which would mangle the home title).
 */
const BRAND = "Aplus Technology Solutions";

/** Label from a page <title>, or "" when only the brand (or nothing) remains. */
export function cleanTitle(title: string): string {
  const first = (title ?? "").split(" | ")[0]?.trim() ?? "";
  const withoutCode = first.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (!withoutCode || withoutCode === BRAND) return "";
  return withoutCode;
}

/** Label from a URL path: last segment, hyphens → spaces, title-cased. */
export function labelFromPath(path: string): string {
  const clean = (path ?? "").split("?")[0].split("#")[0];
  const seg = clean.split("/").filter(Boolean).pop() ?? "";
  if (!seg) return "";
  return seg.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** The chip label: cleaned title → path-derived → "our website". Never empty. */
export function resolvePageLabel({ pageTitle, page }: { pageTitle?: string; page?: string }): string {
  const fromTitle = cleanTitle(pageTitle ?? "");
  if (fromTitle) return fromTitle;
  const fromPath = labelFromPath(page ?? "");
  if (fromPath) return fromPath;
  return "our website";
}
