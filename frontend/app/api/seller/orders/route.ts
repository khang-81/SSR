/**
 * Next.js API Route: Seller Orders Proxy
 * 
 * Note: Backend doesn't have dedicated seller orders endpoint yet.
 * This will filter orders from the orders endpoint to show only orders
 * containing products from the current seller.
 */
import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function GET(request: NextRequest) {
  try {
    const cookies = request.cookies.toString()

    // Get all orders (we'll filter by seller products on frontend)
    // In production, backend should have a dedicated endpoint
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    const nextResponse = NextResponse.json(data)
    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        nextResponse.headers.append(key, value)
      }
    })

    return nextResponse
  } catch (error: any) {
    return NextResponse.json(
      { detail: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
