import { CheckCircle2 } from "lucide-react";

const STEPS = [
  { id: 1, label: "Select Products" },
  { id: 2, label: "Review & Submit" },
  { id: 3, label: "Get Quote" },
];

export default function ProgressStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <div className="flex items-center gap-0 max-w-sm">
      {STEPS.map((step, i) => {
        const done = step.id < current;
        const active = step.id === current;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  done
                    ? "bg-green-500 text-white"
                    : active
                    ? "bg-blue-600 text-white ring-4 ring-blue-100"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done ? <CheckCircle2 size={15} strokeWidth={2.5} /> : step.id}
              </div>
              <span
                className={`text-[10px] mt-1.5 font-semibold whitespace-nowrap ${
                  active ? "text-blue-600" : done ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-12 sm:w-16 mx-1 mb-4 transition-colors ${
                  done ? "bg-green-400" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
