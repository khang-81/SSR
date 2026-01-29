/**
 * API Client for FastAPI Backend
 * 
 * Base URL: http://localhost:8000/api/v1
 * All requests include credentials (cookies) for authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | undefined>
}

/**
 * Fetch wrapper with automatic error handling
 */
async function apiFetch<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options

  // Build URL with query parameters
  let url = `${API_BASE_URL}${endpoint}`
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    const queryString = searchParams.toString()
    if (queryString) {
      url += `?${queryString}`
    }
  }

  // Default headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...fetchOptions.headers,
  }

  // Make request with credentials (cookies)
  const response = await fetch(url, {
    ...fetchOptions,
    headers,
    credentials: 'include', // Important: Include cookies for JWT authentication
  })

  // Handle errors
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  // Return JSON data
  return response.json()
}

// Products API
export const productsApi = {
  list: (params?: { keyword?: string; category?: number; page?: number; limit?: number }) =>
    apiFetch<{
      products: Product[]
      total: number
      page: number
      limit: number
      total_pages: number
    }>('/products', { params }),

  getById: (id: number) =>
    apiFetch<ProductDetail>(`/products/${id}`),
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiFetch<{ message: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register: async (email: string, password: string, role: 'BUYER' | 'SELLER' = 'BUYER') => {
    return apiFetch<{ message: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    })
  },
}

// Cart API (via Next.js API routes)
export const cartApi = {
  get: async () => {
    const response = await fetch('/api/cart', {
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  add: async (productId: number, quantity: number) => {
    const response = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity }),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  update: async (cartItemId: number, quantity: number) => {
    const response = await fetch(`/api/cart/${cartItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity }),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  remove: async (cartItemId: number) => {
    const response = await fetch(`/api/cart/${cartItemId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
  },
}

// Orders API (via Next.js API routes)
export const ordersApi = {
  list: async () => {
    const response = await fetch('/api/orders', {
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  create: async () => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}

// Types
export interface CartItem {
  id: number
  user_id: number
  product_id: number
  quantity: number
  product?: Product
}

export interface CartResponse {
  items: CartItem[]
  total_items: number
}

export interface OrderItem {
  id: number
  order_id: number
  product_id: number
  quantity: number
  price: number
  product?: Product
}

export interface Order {
  id: number
  user_id: number
  total_price: number
  status: string
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface OrdersResponse {
  orders: Order[]
  total: number
}

// Seller API (via Next.js API routes)
export const sellerApi = {
  // Products
  getMyProducts: async () => {
    const response = await fetch('/api/seller/products', {
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    // Filter to only show seller's products
    // In production, backend should have a dedicated endpoint
    return data
  },

  createProduct: async (productData: {
    name: string
    description?: string
    price: number
    stock: number
    category_id: number
  }) => {
    const response = await fetch('/api/seller/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  updateProduct: async (productId: number, productData: {
    name?: string
    description?: string
    price?: number
    stock?: number
    category_id?: number
  }) => {
    const response = await fetch(`/api/seller/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },

  deleteProduct: async (productId: number) => {
    const response = await fetch(`/api/seller/products/${productId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
  },

  // Orders
  getMyOrders: async () => {
    const response = await fetch('/api/seller/orders', {
      credentials: 'include',
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }
    return response.json()
  },
}

// Types
export interface Product {
  id: number
  name: string
  description: string | null
  price: number
  stock: number
  seller_id: number
  category_id: number
  created_at: string
  updated_at: string
  category?: {
    id: number
    name: string
  }
}

export interface ProductDetail extends Product {
  seller?: {
    id: number
    email: string
    role: string
    created_at: string
  }
}

export interface User {
  id: number
  email: string
  role: string
  created_at: string
}
