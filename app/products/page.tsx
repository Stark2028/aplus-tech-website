import ProductCard from "@/components/ProductCard";
import { products } from "@/data/products";
import { productCategories, getCategoryByName } from "@/data/categories";

export const metadata = {
  title: "Products | Aplus Technology Solutions",
  description:
    "Browse Samsung Smart Signage, Video Walls, Interactive Displays, Business TVs, and Hospitality TVs distributed by Aplus Technology Solutions.",
};

export default function ProductsListingPage() {
  const productsByCategory = productCategories.map((category) => ({
    category,
    items: products.filter((product) => product.category === category.name),
  }));

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Samsung Commercial Display Portfolio
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our curated range of Samsung Smart Signage, Business TVs,
            Video Walls, and Interactive Displays for enterprise, retail, and
            hospitality environments.
          </p>
        </header>

        {/* Simple legend for categories */}
        <section className="mb-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          {productCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <h2 className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
                {category.navLabel}
              </h2>
              <p className="text-sm text-gray-600">{category.description}</p>
            </div>
          ))}
        </section>

        {/* Products grouped by category */}
        <div className="space-y-12">
          {productsByCategory
            .filter((group) => group.items.length > 0)
            .map(({ category, items }) => (
              <section key={category.id}>
                <div className="flex items-baseline justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {category.name}
                  </h2>
                  <a
                    href={`/categories/${category.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View all {category.name} solutions
                  </a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </section>
            ))}
        </div>
      </div>
    </div>
  );
}

