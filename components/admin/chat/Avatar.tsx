import { initials, colorFor } from "@/lib/chat/avatar";

/** Initials circle with a stable per-customer color and optional online status badge. */
export default function Avatar({
  name,
  seed,
  size = 36,
  online,
}: {
  name: string;
  seed?: string;
  size?: number;
  online?: boolean;
}) {
  const label = name?.trim() || "Visitor";
  const badgeSize = Math.max(8, Math.round(size * 0.28));

  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFor(
          seed || label
        )}`}
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
        aria-hidden="true"
      >
        {initials(label)}
      </span>
      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 rounded-full ring-2 ring-white ${
            online ? "bg-emerald-500" : "bg-gray-300"
          }`}
          style={{ width: badgeSize, height: badgeSize }}
          title={online ? "Online" : "Offline"}
          aria-label={online ? "Online" : "Offline"}
        />
      )}
    </span>
  );
}
