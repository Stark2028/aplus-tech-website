export default function ContactLoading() {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-pulse">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-3">
          <div className="h-3 w-20 bg-blue-100 rounded-full mx-auto" />
          <div className="h-8 w-48 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-72 bg-gray-100 rounded mx-auto" />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid lg:grid-cols-5 gap-8">
        {/* Contact info sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
              <div className="space-y-1.5 flex-1">
                <div className="h-4 w-24 bg-gray-200 rounded" />
                <div className="h-3.5 bg-gray-100 rounded w-full" />
              </div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
          <div className="h-6 w-36 bg-gray-200 rounded" />
          <div className="grid sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="h-3 w-20 bg-gray-200 rounded" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-20 bg-gray-200 rounded" />
            <div className="h-28 bg-gray-100 rounded-xl" />
          </div>
          <div className="h-12 bg-blue-100 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
