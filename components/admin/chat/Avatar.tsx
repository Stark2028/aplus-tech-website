import { initials, colorFor } from "@/lib/chat/avatar";

/** Initials circle with a stable per-customer color. */
export default function Avatar({
  name,
  seed,
  size = 36,
}: {
  name: string;
  seed?: string;
  size?: number;
}) {
  const label = name?.trim() || "Visitor";
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(
        seed || label
      )}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden="true"
    >
      {initials(label)}
    </span>
  );
}
