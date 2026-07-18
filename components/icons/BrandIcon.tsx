import type { ReactNode, SVGProps } from "react";

export interface BrandIconProps
  extends Omit<SVGProps<SVGSVGElement>, "children"> {
  size?: number;
  /** Color of the outline layer (inherits currentColor). */
  className?: string;
  /** Color of the accent layer. */
  accentClassName?: string;
  /** Paths drawn at outline weight (1.7). */
  outline: ReactNode;
  /** Paths drawn at accent weight (2.2) in the accent color. */
  accent: ReactNode;
  /** Accessible label; omitted = decorative (aria-hidden). */
  label?: string;
}

/**
 * Two-layer branded icon: slate outline + single blue accent element.
 * Both layers use currentColor so hover recoloring is pure CSS —
 * the outline reads the svg's text color, the accent reads the
 * accent <g>'s text color.
 */
export default function BrandIcon({
  size = 24,
  className = "text-slate-800",
  accentClassName = "text-blue-600",
  outline,
  accent,
  label,
  ...rest
}: BrandIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      {...rest}
    >
      {outline}
      <g className={accentClassName} stroke="currentColor" strokeWidth={2.2}>
        {accent}
      </g>
    </svg>
  );
}
