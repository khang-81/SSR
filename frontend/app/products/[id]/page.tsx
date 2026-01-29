import { notFound } from 'next/navigation'
import { productsApi, ProductDetail } from '@/lib/api'
import Link from 'next/link'

/**
 * Product Detail Page - Server-Side Rendered
 * 
 * Fetches product details from FastAPI backend during SSR.
 */
export default async function ProductDetailPage({
  params,
}: {
  params: { id: string }
}) {
  let product: ProductDetail

  try {
    product = await productsApi.getById(Number(params.id))
  } catch (error) {
    notFound()
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <Link href="/" className="hover:text-primary-600">
              Trang Chủ
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" className="hover:text-primary-600">
              Sản Phẩm
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{product.name}</li>
        </ol>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-8xl">🖼️</span>
          </div>
        </div>

        {/* Product Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {product.name}
          </h1>

          {product.category && (
            <div className="mb-4">
              <span className="inline-block bg-primary-100 text-primary-800 px-3 py-1 rounded-full text-sm font-medium">
                {product.category.name}
              </span>
            </div>
          )}

          <div className="mb-6">
            <p className="text-4xl font-bold text-primary-600 mb-2">
              {formatPrice(product.price)}
            </p>
            <p className="text-gray-600">
              Còn lại: <span className="font-semibold">{product.stock}</span> sản phẩm
            </p>
          </div>

          {product.description && (
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">Mô Tả</h2>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {product.seller && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Người bán</p>
              <p className="font-medium">{product.seller.email}</p>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="space-y-4">
            <button className="btn-primary w-full py-3 text-lg">
              Thêm Vào Giỏ Hàng
            </button>
            <button className="btn-secondary w-full py-3 text-lg">
              Mua Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
