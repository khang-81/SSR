import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { cartApi, CartResponse } from '@/lib/api'
import CartClient from '@/components/cart/CartClient'

/**
 * Cart Page - Server-Side Rendered
 * 
 * Protected route: Requires authentication
 */
export default async function CartPage() {
  // Check authentication (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const isAuthenticated = await requireAuth(cookiesString)
  if (!isAuthenticated) {
    redirect('/login?redirect=/cart')
  }

  // Fetch cart data
  let cart: CartResponse
  try {
    cart = await cartApi.get()
  } catch (error) {
    cart = { items: [], total_items: 0 }
  }

  return <CartClient initialCart={cart} />
}
