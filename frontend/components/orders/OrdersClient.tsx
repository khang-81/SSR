'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Order } from '@/lib/api'

interface OrdersClientProps {
  initialOrders: {
    orders: Order[]
    total: number
  }
}

export default function OrdersClient({ initialOrders }: OrdersClientProps) {
  const searchParams = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(false)
  const [orderId, setOrderId] = useState<number | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const id = searchParams.get('orderId')
    if (success === 'true' && id) {
      setShowSuccess(true)
      setOrderId(Number(id))
      // Remove query params from URL
      window.history.replaceState({}, '', '/orders')
    }
  }, [searchParams])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      PROCESSING: 'bg-blue-100 text-blue-800',
      SHIPPED: 'bg-purple-100 text-purple-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDING: 'Chờ Xử Lý',
      PROCESSING: 'Đang Xử Lý',
      SHIPPED: 'Đã Giao Hàng',
      DELIVERED: 'Đã Nhận Hàng',
      CANCELLED: 'Đã Hủy',
    }
    return texts[status] || status
  }

  if (initialOrders.orders.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showSuccess && orderId && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            ✅ Đặt hàng thành công! Mã đơn hàng: #{orderId}
          </div>
        )}

        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng</h2>
          <p className="text-gray-600 mb-8">Bạn chưa có đơn hàng nào</p>
          <Link href="/products" className="btn-primary inline-block">
            Mua Sắm Ngay
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Đơn Hàng Của Tôi</h1>

      {showSuccess && orderId && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          ✅ Đặt hàng thành công! Mã đơn hàng: #{orderId}
        </div>
      )}

      <div className="space-y-6">
        {initialOrders.orders.map((order) => (
          <div key={order.id} className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Đơn Hàng #{order.id}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Ngày đặt: {formatDate(order.created_at)}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <p className="text-primary-600 font-bold text-xl mt-2">
                  {formatPrice(order.total_price)}
                </p>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">Sản Phẩm:</h4>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.product?.name || 'Product'} x {item.quantity}
                      </span>
                      <span className="text-gray-600">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
