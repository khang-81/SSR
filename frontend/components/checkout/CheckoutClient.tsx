'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ordersApi } from '@/lib/api'

export default function CheckoutClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handlePlaceOrder = async () => {
    setLoading(true)
    setError('')

    try {
      const order = await ordersApi.create()
      // Redirect to orders page
      router.push(`/orders?success=true&orderId=${order.id}`)
    } catch (err: any) {
      setError(err.message || 'Đặt hàng thất bại')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Thanh Toán</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="card p-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Xác Nhận Đơn Hàng</h2>
          <p className="text-gray-600">
            Đơn hàng sẽ được tạo từ giỏ hàng của bạn. Sau khi đặt hàng, giỏ hàng sẽ được xóa.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Lưu ý: Đây là demo, chưa có tích hợp thanh toán. Đơn hàng sẽ được tạo với trạng thái PENDING.
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading}
            className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Đang xử lý...' : 'Xác Nhận Đặt Hàng'}
          </button>

          <button
            onClick={() => router.back()}
            disabled={loading}
            className="btn-secondary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Quay Lại
          </button>
        </div>
      </div>
    </div>
  )
}
