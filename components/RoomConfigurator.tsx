"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Monitor,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { products } from "@/data/products";
import { useQuote } from "@/context/QuoteContext";
import {
  BUNDLES,
  GOALS,
  ROOM_TYPES,
  type GoalId,
  type RoomTypeId,
} from "@/data/roomBundles";

type Step = 1 | 2 | "results";

export default function RoomConfigurator() {
  const router = useRouter();
  const { addItem } = useQuote();
  const [step, setStep] = useState<Step>(1);
  const [roomType, setRoomType] = useState<RoomTypeId | null>(null);
  const [goal, setGoal] = useState<GoalId | null>(null);

  const bundle = useMemo(() => {
    if (!roomType || !goal) return null;
    return BUNDLES[roomType][goal];
  }, [roomType, goal]);

  const bundleProducts = useMemo(() => {
    if (!bundle) return [];
    return bundle.items
      .map((item) => {
        const product = products.find((p) => p.id === item.productId);
        return product ? { ...item, product } : null;
      })
      .filter(Boolean) as Array<
        (typeof bundle.items)[number] & { product: (typeof products)[number] }
      >;
  }, [bundle]);

  const reset = () => {
    setStep(1);
    setRoomType(null);
    setGoal(null);
  };

  const handleAddBundleToQuote = () => {
    if (!bundle) return;
    bundleProducts.forEach((item) => addItem(item.product, 1));
    router.push("/quote");
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-4">
            <Sparkles size={12} /> Room Configurator
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Design Your Meeting Room AV
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            Tell us the room and the primary goal — we&apos;ll recommend the exact
            Samsung bundle Aplus would quote for that space.
          </p>
        </div>

        {/* Progress */}
        {step !== "results" && (
          <div className="flex items-center justify-center gap-3 mb-10">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold transition-all duration-300"
                  style={{
                    backgroundColor:
                      s <= (step as number) ? "#2563eb" : "#f3f4f6",
                    color: s <= (step as number) ? "#fff" : "#9ca3af",
                    boxShadow:
                      s === (step as number)
                        ? "0 0 0 4px rgba(37,99,235,0.15)"
                        : "none",
                  }}
                >
                  {s < (step as number) ? <CheckCircle2 size={16} /> : s}
                </div>
                {s < 2 && (
                  <div
                    className="w-16 h-0.5 rounded-full transition-all duration-300"
                    style={{
                      backgroundColor:
                        s < (step as number) ? "#2563eb" : "#e5e7eb",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {step !== "results" && (
          <p className="text-center text-lg font-semibold text-gray-800 mb-6">
            Step {step} of 2 —{" "}
            {step === 1 ? "Room Type" : "Primary Goal"}
          </p>
        )}

        {/* Step 1: Room Type */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ROOM_TYPES.map(({ id, label, capacity, description, Icon }) => (
              <button
                key={id}
                onClick={() => {
                  setRoomType(id);
                  setStep(2);
                }}
                className="group p-6 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <Icon
                  size={28}
                  className="mb-3 text-gray-400 group-hover:text-blue-500 transition-colors"
                />
                <div className="font-bold text-gray-900 text-sm">{label}</div>
                <div className="text-blue-600 text-xs font-semibold mt-1">
                  {capacity}
                </div>
                <div className="text-gray-400 text-xs mt-1">{description}</div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Goal */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GOALS.map(({ id, label, description }) => (
                <button
                  key={id}
                  onClick={() => {
                    setGoal(id);
                    setStep("results");
                  }}
                  className="group p-6 rounded-2xl border-2 border-gray-200 bg-white text-left hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="font-bold text-gray-900 text-sm">{label}</div>
                  <div className="text-gray-400 text-xs mt-1">{description}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setStep(1)}
              className="mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors block mx-auto"
            >
              ← Back
            </button>
          </>
        )}

        {/* Results */}
        {step === "results" && bundle && (
          <div>
            {/* Bundle header card */}
            <div className="relative overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-8 mb-8">
              <div className="flex items-start justify-between gap-6 flex-wrap">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-blue-600 bg-blue-100 px-3 py-1 rounded-full mb-3">
                    <Sparkles size={11} /> Recommended Bundle
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                    {bundle.title}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {bundle.summary}
                  </p>

                  <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">
                    <span>
                      <strong className="text-gray-700">Room:</strong>{" "}
                      {bundle.roomDimensions}
                    </span>
                    <span>
                      <strong className="text-gray-700">Attendees:</strong>{" "}
                      {bundle.attendees}
                    </span>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  <RotateCcw size={14} /> Start Over
                </button>
              </div>
            </div>

            {/* Bundle items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {bundleProducts.map(
                ({ product, role, recommendedSize, reason }) => (
                  <div
                    key={`${product.id}-${role}`}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col"
                  >
                    <div className="flex">
                      <div className="w-32 h-32 sm:w-40 sm:h-40 bg-gray-50 relative flex-shrink-0">
                        {product.images?.[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            sizes="160px"
                            className="object-contain p-3"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor size={32} className="text-gray-200" />
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex flex-col flex-1 min-w-0">
                        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full self-start mb-2">
                          {role}
                        </div>
                        <p className="font-bold text-gray-900 text-sm leading-snug mb-1 line-clamp-2">
                          {product.name}
                        </p>
                        <p className="text-blue-600 text-xs font-semibold mb-2">
                          {recommendedSize} · {product.series}
                        </p>
                        <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                          {reason}
                        </p>
                        <Link
                          href={`/products/${product.id}`}
                          className="mt-auto inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-blue-600 transition-colors pt-3"
                        >
                          View product details <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* CTA bar */}
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900 text-sm">
                  Ready to quote this room?
                </p>
                <p className="text-gray-500 text-xs mt-1">
                  Our team will price the full bundle including mounts,
                  cabling, and installation across India.
                </p>
              </div>
              <button
                onClick={handleAddBundleToQuote}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors"
              >
                Add Bundle to Quote <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
