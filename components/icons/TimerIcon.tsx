import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function TimerIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<circle cx="12" cy="14" r="8" />}
      accent={
        <>
          <path d="M10 2h4" />
          <path d="m12 14 3-3" />
        </>
      }
    />
  );
}
