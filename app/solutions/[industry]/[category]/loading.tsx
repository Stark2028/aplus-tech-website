export default function SolutionCategoryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white py-14">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="h-3 w-24 bg-blue-100 rounded-full mx-auto" />
          <div className="h-10 w-80 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-full max-w-lg bg-gray-100 rounded mx-auto" />
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-40 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-12 bg-blue-100 rounded-full" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded-xl mt-2" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ strip */}
      <div className="max-w-3xl mx-auto px-4 pb-16 space-y-3">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
