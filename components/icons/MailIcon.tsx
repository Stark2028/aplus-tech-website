import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function MailIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<rect x="2" y="4" width="20" height="16" rx="2" />}
      accent={<path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" />}
    />
  );
}
