export default function SolutionIndustryLoading() {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
          <div className="h-3 w-28 bg-blue-100 rounded-full mx-auto" />
          <div className="h-10 w-72 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-96 bg-gray-100 rounded mx-auto" />
          <div className="h-4 w-80 bg-gray-100 rounded mx-auto" />
        </div>
      </div>

      {/* Category cards */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
              <div className="w-12 h-12 bg-gray-100 rounded-xl" />
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-3.5 bg-gray-100 rounded w-full" />
              <div className="h-3.5 bg-gray-100 rounded w-4/5" />
            </div>
          ))}
        </div>
      </div>

      {/* Products strip */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="h-6 w-48 bg-gray-200 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="h-36 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-12 bg-blue-100 rounded-full" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
