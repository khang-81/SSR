import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSeller } from '@/lib/auth'
import ProductFormClient from '@/components/seller/ProductFormClient'

/**
 * Create Product Page - Server-Side Rendered
 * 
 * Protected route: Requires Seller role
 */
export default async function CreateProductPage() {
  // Check authentication and seller role (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const seller = await requireSeller(cookiesString)
  if (!seller) {
    redirect('/login?redirect=/seller/products/new')
  }

  return <ProductFormClient />
}
