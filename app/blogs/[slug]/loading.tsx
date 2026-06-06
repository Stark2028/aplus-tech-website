export default function BlogPostLoading() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Progress bar placeholder */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-gray-100 z-50" />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <div className="h-3 w-10 bg-gray-200 rounded" />
          <div className="h-3 w-3 bg-gray-100 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded" />
        </div>

        {/* Category tag */}
        <div className="h-5 w-20 bg-blue-100 rounded-full mb-4" />

        {/* Title */}
        <div className="space-y-3 mb-4">
          <div className="h-8 bg-gray-200 rounded w-full" />
          <div className="h-8 bg-gray-200 rounded w-4/5" />
        </div>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-3.5 w-24 bg-gray-100 rounded" />
          <div className="h-3.5 w-16 bg-gray-100 rounded" />
        </div>

        {/* Hero image */}
        <div className="h-64 sm:h-80 bg-gray-100 rounded-2xl mb-10" />

        {/* Body paragraphs — deterministic widths (85–99%) keep render pure */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${85 + ((i * 13) % 15)}%` }} />
          ))}
        </div>

        {/* Section break */}
        <div className="h-6 w-48 bg-gray-200 rounded mt-10 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-100 rounded" style={{ width: `${70 + ((i * 17) % 25)}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
