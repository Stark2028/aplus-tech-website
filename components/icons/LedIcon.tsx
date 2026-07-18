import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

/** CPU glyph — used for LED signage. */
export default function LedIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <>
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M12 20v2" />
          <path d="M12 2v2" />
          <path d="M17 20v2" />
          <path d="M17 2v2" />
          <path d="M2 12h2" />
          <path d="M2 17h2" />
          <path d="M2 7h2" />
          <path d="M20 12h2" />
          <path d="M20 17h2" />
          <path d="M20 7h2" />
          <path d="M7 20v2" />
          <path d="M7 2v2" />
        </>
      }
      accent={<rect x="8" y="8" width="8" height="8" rx="1" />}
    />
  );
}
