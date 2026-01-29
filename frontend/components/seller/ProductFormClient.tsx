'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { sellerApi, ProductDetail } from '@/lib/api'

interface ProductFormClientProps {
  product?: ProductDetail
}

export default function ProductFormClient({ product }: ProductFormClientProps) {
  const router = useRouter()
  const isEdit = !!product

  const [name, setName] = useState(product?.name || '')
  const [description, setDescription] = useState(product?.description || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [stock, setStock] = useState(product?.stock?.toString() || '0')
  const [categoryId, setCategoryId] = useState(product?.category_id?.toString() || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // TODO: Fetch categories from backend
  const categories = [
    { id: 1, name: 'Electronics' },
    { id: 2, name: 'Clothing' },
    { id: 3, name: 'Books' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const productData = {
        name,
        description: description || undefined,
        price: parseFloat(price),
        stock: parseInt(stock),
        category_id: parseInt(categoryId),
      }

      if (isEdit && product) {
        await sellerApi.updateProduct(product.id, productData)
      } else {
        await sellerApi.createProduct(productData)
      }

      router.push('/seller/products')
    } catch (err: any) {
      setError(err.message || 'Lưu sản phẩm thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEdit ? 'Sửa Sản Phẩm' : 'Tạo Sản Phẩm Mới'}
        </h1>
        <p className="text-gray-600 mt-2">
          {isEdit ? 'Cập nhật thông tin sản phẩm' : 'Thêm sản phẩm mới vào cửa hàng của bạn'}
        </p>
      </div>

      <div className="card p-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Tên Sản Phẩm <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Nhập tên sản phẩm"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô Tả
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field"
              placeholder="Mô tả sản phẩm..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Giá (VND) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>

            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-2">
                Tồn Kho <span className="text-red-500">*</span>
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="input-field"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
              Danh Mục <span className="text-red-500">*</span>
            </label>
            <select
              id="category"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              <option value="">Chọn danh mục</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang lưu...' : isEdit ? 'Cập Nhật' : 'Tạo Sản Phẩm'}
            </button>
            <Link
              href="/seller/products"
              className="btn-secondary flex-1 text-center"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
