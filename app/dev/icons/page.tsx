// TEMPORARY dev gallery — deleted before this branch ships.
import * as Icons from "@/components/icons";
import IconTile from "@/components/icons/IconTile";

type IconComp = React.ComponentType<{
  size?: number;
  className?: string;
  accentClassName?: string;
}>;

const entries = Object.entries(Icons).filter(
  ([name]) => name.endsWith("Icon") && name !== "BrandIcon"
) as [string, IconComp][];

export default function IconGallery() {
  return (
    <main className="max-w-5xl mx-auto p-8 space-y-10">
      <h1 className="text-2xl font-bold text-gray-900">
        Brand icon gallery (dev)
      </h1>

      <section className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {entries.map(([name, Comp]) => (
          <div
            key={name}
            className="group flex flex-col items-center gap-3 border border-gray-100 rounded-xl p-4"
          >
            <div className="flex items-end gap-2">
              <Comp size={16} />
              <Comp size={24} />
              <Comp size={32} />
            </div>
            <IconTile>
              <Comp size={26} className="text-current" />
            </IconTile>
            <span className="text-[10px] text-gray-500">{name}</span>
          </div>
        ))}
      </section>

      <section className="bg-slate-900 rounded-2xl p-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-6">
        {entries.map(([name, Comp]) => (
          <div key={name} className="group flex justify-center">
            <IconTile dark>
              <Comp
                size={26}
                className="text-current"
                accentClassName="text-blue-400"
              />
            </IconTile>
          </div>
        ))}
      </section>
    </main>
  );
}
