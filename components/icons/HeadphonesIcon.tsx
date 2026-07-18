import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function HeadphonesIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={<path d="M3 14a9 9 0 0 1 18 0" />}
      accent={
        <>
          <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5Z" />
          <path d="M21 14v5a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3Z" />
        </>
      }
    />
  );
}
