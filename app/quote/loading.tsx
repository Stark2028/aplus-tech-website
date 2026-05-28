export default function QuoteLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-8 px-4 sm:px-8">
        <div className="max-w-5xl mx-auto space-y-2">
          <div className="h-3 w-20 bg-blue-100 rounded-full" />
          <div className="h-7 w-48 bg-gray-200 rounded" />
          <div className="h-4 w-64 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid lg:grid-cols-3 gap-8">
        {/* Items list */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3.5 bg-gray-100 rounded w-1/2" />
                <div className="flex items-center gap-3 mt-3">
                  <div className="h-8 w-24 bg-gray-100 rounded-lg" />
                  <div className="h-3.5 w-16 bg-gray-100 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + form */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-3">
            <div className="h-5 w-28 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-100 rounded" />
            <div className="h-4 bg-gray-100 rounded w-3/4" />
            <div className="h-10 bg-blue-100 rounded-xl mt-2" />
          </div>
          {/* Form skeleton */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
            <div className="h-12 bg-gray-900/10 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
