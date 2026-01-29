import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSeller } from '@/lib/auth'
import { sellerApi, productsApi } from '@/lib/api'
import Link from 'next/link'

/**
 * Seller Dashboard - Server-Side Rendered
 * 
 * Protected route: Requires Seller role
 */
export default async function SellerDashboardPage() {
  // Check authentication and seller role (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const seller = await requireSeller(cookiesString)
  if (!seller) {
    redirect('/login?redirect=/seller/dashboard')
  }

  // Fetch seller's products
  let products: any[] = []
  try {
    const allProducts = await productsApi.list({ limit: 100 })
    // Filter to only seller's products
    products = allProducts.products.filter(p => p.seller_id === seller.id)
  } catch (error) {
    products = []
  }

  // Calculate statistics
  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Người Bán</h1>
        <p className="text-gray-600 mt-2">Quản lý sản phẩm và đơn hàng của bạn</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Sản Phẩm</p>
              <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>
            <div className="text-4xl">📦</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Tồn Kho</p>
              <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tổng Giá Trị</p>
              <p className="text-2xl font-bold text-primary-600">{formatPrice(totalValue)}</p>
            </div>
            <div className="text-4xl">💰</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Link href="/seller/products" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">🛍️</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Quản Lý Sản Phẩm</h3>
              <p className="text-gray-600">Xem, thêm, sửa, xóa sản phẩm</p>
            </div>
          </div>
        </Link>

        <Link href="/seller/orders" className="card p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center space-x-4">
            <div className="text-4xl">📋</div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">Đơn Hàng</h3>
              <p className="text-gray-600">Xem đơn hàng liên quan đến sản phẩm của bạn</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Products */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Sản Phẩm Gần Đây</h2>
          <Link href="/seller/products" className="text-primary-600 hover:text-primary-700 font-medium">
            Xem tất cả →
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên Sản Phẩm</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tồn Kho</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.slice(0, 5).map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link href={`/products/${product.id}`} className="text-sm font-medium text-gray-900 hover:text-primary-600">
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link href={`/seller/products/${product.id}/edit`} className="text-primary-600 hover:text-primary-900 mr-4">
                        Sửa
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">Chưa có sản phẩm nào</p>
            <Link href="/seller/products/new" className="btn-primary inline-block">
              Tạo Sản Phẩm Đầu Tiên
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
