"use client";

export type TabKey = "open" | "noreply" | "closed";

export default function InboxTabs({
  active,
  onChange,
  counts,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
  counts: { open: number; noreply: number; closed: number | null };
}) {
  const tabs: { key: TabKey; label: string; count: number | null }[] = [
    { key: "open", label: "Open", count: counts.open },
    { key: "noreply", label: "No reply", count: counts.noreply },
    { key: "closed", label: "Closed", count: counts.closed },
  ];

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 px-2 py-2">
      {tabs.map((t) => {
        const on = active === t.key;
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-colors active:scale-[0.97] ${
              on ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-100 active:bg-gray-200"
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span
                className={`rounded-full px-1.5 text-[10px] ${
                  on ? "bg-white/25 text-white" : "bg-gray-200 text-gray-600"
                }`}
              >
                {t.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
