import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function TvIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<rect width="20" height="15" x="2" y="7" rx="2" />}
      accent={<path d="m17 2-5 5-5-5" />}
    />
  );
}
