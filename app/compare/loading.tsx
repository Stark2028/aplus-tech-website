export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-100 py-5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-4 w-20 bg-gray-200 rounded" />
            <div className="h-4 w-36 bg-gray-200 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-9 w-20 bg-gray-100 rounded-xl" />
            <div className="h-9 w-24 bg-gray-100 rounded-xl" />
            <div className="h-9 w-28 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>

      {/* Table skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Product header row */}
          <div className="grid grid-cols-4 border-b border-gray-100">
            <div className="p-5 bg-gray-50 border-r border-gray-100" />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 border-r border-gray-100 flex flex-col items-center gap-3">
                <div className="w-28 h-28 bg-gray-100 rounded-xl" />
                <div className="h-4 w-20 bg-blue-100 rounded-full" />
                <div className="h-4 w-36 bg-gray-200 rounded" />
                <div className="h-9 w-28 bg-gray-100 rounded-lg" />
              </div>
            ))}
          </div>
          {/* Spec rows */}
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={`grid grid-cols-4 border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/60"}`}>
              <div className="px-5 py-4 border-r border-gray-100">
                <div className="h-3.5 w-24 bg-gray-200 rounded" />
              </div>
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="px-5 py-4 border-r border-gray-100 flex justify-center">
                  <div className="h-3.5 w-28 bg-gray-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
