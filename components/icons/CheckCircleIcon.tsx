import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function CheckCircleIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<path d="M21.801 10A10 10 0 1 1 17 3.335" />}
      accent={<path d="m9 11 3 3L22 4" />}
    />
  );
}
