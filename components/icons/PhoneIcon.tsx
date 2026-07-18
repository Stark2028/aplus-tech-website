import BrandIcon, { type BrandIconProps } from "./BrandIcon";

type Props = Omit<BrandIconProps, "outline" | "accent">;

export default function PhoneIcon(props: Props) {
  return (
    <BrandIcon
      {...props}
      outline={
        <path d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384" />
      }
      accent={
        <>
          <path d="M14.05 6A5 5 0 0 1 18 9.95" />
          <path d="M14.05 2a9 9 0 0 1 8 7.94" />
        </>
      }
    />
  );
}
