import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { ordersApi, OrdersResponse } from '@/lib/api'
import OrdersClient from '@/components/orders/OrdersClient'

/**
 * Orders Page - Server-Side Rendered
 * 
 * Protected route: Requires authentication
 */
export default async function OrdersPage() {
  // Check authentication (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const isAuthenticated = await requireAuth(cookiesString)
  if (!isAuthenticated) {
    redirect('/login?redirect=/orders')
  }

  // Fetch orders
  let orders: OrdersResponse
  try {
    orders = await ordersApi.list()
  } catch (error) {
    orders = { orders: [], total: 0 }
  }

  return <OrdersClient initialOrders={orders} />
}
