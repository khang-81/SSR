import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { cartApi } from '@/lib/api'
import CheckoutClient from '@/components/checkout/CheckoutClient'

/**
 * Checkout Page - Server-Side Rendered
 * 
 * Protected route: Requires authentication
 */
export default async function CheckoutPage() {
  // Check authentication (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const isAuthenticated = await requireAuth(cookiesString)
  if (!isAuthenticated) {
    redirect('/login?redirect=/checkout')
  }

  // Fetch cart to validate
  let cart
  try {
    cart = await cartApi.get()
    if (cart.items.length === 0) {
      redirect('/cart')
    }
  } catch (error) {
    redirect('/cart')
  }

  return <CheckoutClient />
}
