import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSeller } from '@/lib/auth'
import { productsApi } from '@/lib/api'
import Link from 'next/link'
import ProductsClient from '@/components/seller/ProductsClient'

/**
 * Seller Products Management Page - Server-Side Rendered
 * 
 * Protected route: Requires Seller role
 */
export default async function SellerProductsPage() {
  // Check authentication and seller role (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const seller = await requireSeller(cookiesString)
  if (!seller) {
    redirect('/login?redirect=/seller/products')
  }

  // Fetch all products and filter to seller's products
  // Note: In production, backend should have GET /seller/products endpoint
  let allProducts: any[] = []
  try {
    const data = await productsApi.list({ limit: 1000 })
    allProducts = data.products.filter(p => p.seller_id === seller.id)
  } catch (error) {
    allProducts = []
  }

  return <ProductsClient initialProducts={allProducts} />
}
