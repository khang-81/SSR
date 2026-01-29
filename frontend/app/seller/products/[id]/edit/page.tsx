import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { requireSeller } from '@/lib/auth'
import { productsApi } from '@/lib/api'
import ProductFormClient from '@/components/seller/ProductFormClient'

/**
 * Edit Product Page - Server-Side Rendered
 * 
 * Protected route: Requires Seller role
 */
export default async function EditProductPage({
  params,
}: {
  params: { id: string }
}) {
  // Check authentication and seller role (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const seller = await requireSeller(cookiesString)
  if (!seller) {
    redirect('/login?redirect=/seller/products')
  }

  // Fetch product
  let product
  try {
    product = await productsApi.getById(Number(params.id))
    
    // Verify seller owns this product
    if (product.seller_id !== seller.id) {
      redirect('/seller/products')
    }
  } catch (error) {
    notFound()
  }

  return <ProductFormClient product={product} />
}
