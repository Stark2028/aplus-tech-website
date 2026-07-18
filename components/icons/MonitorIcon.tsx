import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function MonitorIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<rect width="20" height="14" x="2" y="3" rx="2" />}
      accent={
        <>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
        </>
      }
    />
  );
}
