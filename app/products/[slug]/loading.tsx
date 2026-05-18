export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Top CTA bar */}
      <div className="h-10 bg-blue-600" />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <div className="h-3.5 w-10 bg-gray-200 rounded" />
          <div className="h-3.5 w-3 bg-gray-100 rounded" />
          <div className="h-3.5 w-20 bg-gray-200 rounded" />
          <div className="h-3.5 w-3 bg-gray-100 rounded" />
          <div className="h-3.5 w-36 bg-gray-200 rounded" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Image gallery */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="h-72 bg-gray-100 rounded-xl mb-4" />
              <div className="flex gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-14 h-14 bg-gray-100 rounded-lg shrink-0" />
                ))}
              </div>
            </div>

            {/* Key highlights */}
            <div className="bg-white rounded-2xl border border-gray-100 p-7">
              <div className="h-5 w-36 bg-gray-200 rounded mb-5" />
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-100 rounded" />
                ))}
              </div>
            </div>

            {/* Specs */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-7 py-5 border-b border-gray-100">
                <div className="h-5 w-52 bg-gray-200 rounded" />
              </div>
              <div className="divide-y divide-gray-50">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex px-7 py-3.5 gap-4">
                    <div className="h-4 w-28 bg-gray-100 rounded shrink-0" />
                    <div className="h-4 w-36 bg-gray-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-7 space-y-4">
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
              <div className="h-8 w-full bg-gray-200 rounded" />
              <div className="h-8 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-5/6 bg-gray-100 rounded" />
              <div className="grid grid-cols-2 gap-3 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                ))}
              </div>
              <div className="h-12 bg-gray-900 rounded-xl mt-4" />
              <div className="flex gap-2">
                <div className="h-12 flex-1 bg-green-100 rounded-xl" />
                <div className="h-12 flex-1 bg-gray-100 rounded-xl" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
