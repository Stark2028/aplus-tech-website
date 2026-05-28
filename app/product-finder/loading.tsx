export default function ProductFinderLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-2xl mx-auto px-4 text-center space-y-3">
          <div className="h-3 w-28 bg-blue-100 rounded-full mx-auto" />
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-80 bg-gray-100 rounded mx-auto" />
        </div>
      </div>

      {/* Step progress */}
      <div className="max-w-2xl mx-auto px-4 mt-10">
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              {i < 3 && <div className="h-0.5 w-10 sm:w-16 bg-gray-100" />}
            </div>
          ))}
        </div>

        {/* Question card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 space-y-6">
          <div className="h-6 w-72 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-100 rounded-xl" />
            ))}
          </div>
          <div className="h-12 bg-gray-900/10 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
