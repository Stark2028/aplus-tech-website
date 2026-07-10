import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function PackageIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <>
          <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
          <polyline points="3.29 7 12 12 20.71 7" />
        </>
      }
      accent={
        <>
          <path d="M12 22V12" />
          <path d="m7.5 4.27 9 5.15" />
        </>
      }
    />
  );
}
