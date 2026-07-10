import type { ReactNode } from "react";

const SIZES = { md: "w-12 h-12", lg: "w-14 h-14" } as const;

/**
 * Keycap container for brand icons: white tile, hairline border,
 * soft shadow with inset top highlight. Pair with `group` on the
 * parent card — hover shifts the border to blue and the icon's
 * outline to blue-700 (icons use currentColor via text-current).
 */
export default function IconTile({
  size = "md",
  dark = false,
  className = "",
  children,
}: {
  size?: keyof typeof SIZES;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const surface = dark
    ? "bg-white/5 border-white/10 text-slate-200 group-hover:border-blue-400/40"
    : "bg-white border-slate-200 text-slate-800 shadow-[0_1px_2px_rgba(15,23,42,.06),inset_0_1px_0_#fff] group-hover:border-blue-200 group-hover:text-blue-700";
  return (
    <div
      className={`${SIZES[size]} rounded-xl border flex items-center justify-center transition-colors ${surface} ${className}`}
    >
      {children}
    </div>
  );
}
