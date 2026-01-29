import Link from 'next/link'
import { productsApi, Product } from '@/lib/api'

/**
 * Home Page - Server-Side Rendered
 * 
 * This page is rendered on the server (SSR) using Next.js App Router.
 * Data is fetched from FastAPI backend during server-side rendering.
 * 
 * Benefits:
 * - SEO friendly (search engines can index the content)
 * - Fast initial page load (HTML is pre-rendered)
 * - Better performance (data fetching happens on server)
 */
export default async function HomePage() {
  // Fetch products on the server
  // This runs on the server, not in the browser
  const data = await productsApi.list({ page: 1, limit: 12 })

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chào Mừng Đến Với E-Commerce
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Khám phá hàng ngàn sản phẩm chất lượng cao
          </p>
          <Link
            href="/products"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
          >
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Sản Phẩm Nổi Bật</h2>
          <Link
            href="/products"
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {/* Products Grid */}
        {data.products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Chưa có sản phẩm nào</p>
          </div>
        )}

        {/* Pagination Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>
            Hiển thị {data.products.length} / {data.total} sản phẩm
          </p>
        </div>
      </section>
    </div>
  )
}

/**
 * Product Card Component
 */
function ProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <Link href={`/products/${product.id}`}>
      <div className="card h-full flex flex-col">
        {/* Product Image Placeholder */}
        <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400 text-4xl">🖼️</span>
        </div>

        {/* Product Info */}
        <div className="p-4 flex-grow flex flex-col">
          <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          {product.description && (
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="mt-auto">
            <p className="text-primary-600 font-bold text-xl mb-2">
              {formatPrice(product.price)}
            </p>
            <p className="text-sm text-gray-500">
              Còn lại: {product.stock} sản phẩm
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}
