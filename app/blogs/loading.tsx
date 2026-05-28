export default function BlogsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <div className="h-3 w-20 bg-blue-100 rounded-full mx-auto" />
          <div className="h-8 w-64 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-80 bg-gray-100 rounded mx-auto" />
        </div>
      </div>

      {/* Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="h-44 bg-gray-100" />
            <div className="p-5 space-y-3">
              <div className="h-3 w-16 bg-blue-100 rounded-full" />
              <div className="h-5 bg-gray-200 rounded w-full" />
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-3.5 bg-gray-100 rounded w-full" />
              <div className="h-3.5 bg-gray-100 rounded w-5/6" />
              <div className="flex items-center gap-3 pt-1">
                <div className="h-3 w-20 bg-gray-100 rounded" />
                <div className="h-3 w-12 bg-gray-100 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
