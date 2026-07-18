import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function LayoutGridIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <>
          <rect width="7" height="7" x="3" y="3" rx="1" />
          <rect width="7" height="7" x="14" y="3" rx="1" />
          <rect width="7" height="7" x="3" y="14" rx="1" />
        </>
      }
      accent={<rect width="7" height="7" x="14" y="14" rx="1" />}
    />
  );
}
