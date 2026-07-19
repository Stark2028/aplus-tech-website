import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

/** Cloud glyph — used for the Software Solutions category (VXT, LYNK Cloud). */
export default function CloudIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <path d="M17.5 19a4.5 4.5 0 0 0 .5-8.972A6 6 0 0 0 6.34 9.02 4 4 0 0 0 7 19h10.5Z" />
      }
      accent={<path d="M9.5 13.5 11 15l3.5-3.5" />}
    />
  );
}
