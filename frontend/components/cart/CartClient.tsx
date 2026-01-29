'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { cartApi, CartItem } from '@/lib/api'

interface CartClientProps {
  initialCart: {
    items: CartItem[]
    total_items: number
  }
}

export default function CartClient({ initialCart }: CartClientProps) {
  const router = useRouter()
  const [cart, setCart] = useState(initialCart)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price)
  }

  const calculateTotal = () => {
    return cart.items.reduce((total, item) => {
      const price = item.product?.price || 0
      return total + price * item.quantity
    }, 0)
  }

  const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return

    setLoading(true)
    setError('')

    try {
      await cartApi.update(itemId, newQuantity)
      // Refresh cart
      const updatedCart = await cartApi.get()
      setCart(updatedCart)
    } catch (err: any) {
      setError(err.message || 'Cập nhật thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (itemId: number) => {
    setLoading(true)
    setError('')

    try {
      await cartApi.remove(itemId)
      // Refresh cart
      const updatedCart = await cartApi.get()
      setCart(updatedCart)
    } catch (err: any) {
      setError(err.message || 'Xóa thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckout = () => {
    router.push('/checkout')
  }

  if (cart.items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng trống</h2>
          <p className="text-gray-600 mb-8">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
          <Link href="/products" className="btn-primary inline-block">
            Tiếp Tục Mua Sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ Hàng</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="card p-6">
              <div className="flex items-start space-x-4">
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-400 text-2xl">🖼️</span>
                </div>

                {/* Product Info */}
                <div className="flex-grow">
                  <Link href={`/products/${item.product_id}`}>
                    <h3 className="font-semibold text-lg text-gray-900 hover:text-primary-600 mb-2">
                      {item.product?.name || 'Product'}
                    </h3>
                  </Link>
                  <p className="text-primary-600 font-bold text-xl mb-4">
                    {item.product?.price ? formatPrice(item.product.price) : 'N/A'}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-4">
                    <label className="text-sm text-gray-600">Số lượng:</label>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                        disabled={loading || item.quantity <= 1}
                        className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                        disabled={loading}
                        className="w-8 h-8 rounded border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => handleRemove(item.id)}
                      disabled={loading}
                      className="ml-auto text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-20">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Tóm Tắt Đơn Hàng</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Số lượng sản phẩm:</span>
                <span className="font-medium">{cart.total_items}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tổng tiền:</span>
                <span className="font-bold text-primary-600 text-xl">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Thanh Toán
            </button>

            <Link
              href="/products"
              className="block text-center text-primary-600 hover:text-primary-700 mt-4 font-medium"
            >
              Tiếp Tục Mua Sắm
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
