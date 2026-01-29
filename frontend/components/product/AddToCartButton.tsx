'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cartApi } from '@/lib/api'

interface AddToCartButtonProps {
  productId: number
  stock: number
}

export default function AddToCartButton({ productId, stock }: AddToCartButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleAddToCart = async () => {
    if (stock === 0) {
      setError('Sản phẩm đã hết hàng')
      return
    }

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      await cartApi.add(productId, 1)
      setSuccess(true)
      setTimeout(() => {
        router.push('/cart')
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Thêm vào giỏ hàng thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleBuyNow = async () => {
    if (stock === 0) {
      setError('Sản phẩm đã hết hàng')
      return
    }

    setLoading(true)
    setError('')

    try {
      await cartApi.add(productId, 1)
      router.push('/checkout')
    } catch (err: any) {
      setError(err.message || 'Thêm vào giỏ hàng thất bại')
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          ✅ Đã thêm vào giỏ hàng! Đang chuyển hướng...
        </div>
      )}

      <button
        onClick={handleAddToCart}
        disabled={loading || stock === 0}
        className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xử lý...' : stock === 0 ? 'Hết Hàng' : 'Thêm Vào Giỏ Hàng'}
      </button>
      <button
        onClick={handleBuyNow}
        disabled={loading || stock === 0}
        className="btn-secondary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Đang xử lý...' : 'Mua Ngay'}
      </button>
    </div>
  )
}
