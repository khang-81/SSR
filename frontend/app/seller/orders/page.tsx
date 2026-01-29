import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { requireSeller } from '@/lib/auth'
import { ordersApi } from '@/lib/api'
import OrdersClient from '@/components/seller/SellerOrdersClient'

/**
 * Seller Orders Page - Server-Side Rendered
 * 
 * Protected route: Requires Seller role
 */
export default async function SellerOrdersPage() {
  // Check authentication and seller role (SSR protection)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const seller = await requireSeller(cookiesString)
  if (!seller) {
    redirect('/login?redirect=/seller/orders')
  }

  // Fetch orders
  // Note: Backend should have GET /seller/orders endpoint for better performance
  // For now, we fetch all orders and filter by seller's products
  let orders: any[] = []
  try {
    const data = await ordersApi.list()
    // Filter orders that contain products from this seller
    orders = data.orders.filter(order => {
      if (!order.items || order.items.length === 0) return false
      // Check if any order item's product belongs to this seller
      return order.items.some((item: any) => {
        // Product relationship should be loaded, check seller_id
        return item.product?.seller_id === seller.id
      })
    })
  } catch (error) {
    orders = []
  }

  return <OrdersClient initialOrders={orders} />
}
