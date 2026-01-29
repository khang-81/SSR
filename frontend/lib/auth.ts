/**
 * Authentication utilities for SSR
 * 
 * Check authentication status on the server side.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export interface User {
  id: number
  email: string
  role: string
  created_at: string
}

/**
 * Check if user is authenticated (for SSR)
 * 
 * @param cookies - Cookie string from request headers
 * @returns User object if authenticated, null otherwise
 */
export async function getCurrentUser(cookies?: string): Promise<User | null> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (cookies) {
      headers['Cookie'] = cookies
    }

    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'GET',
      headers,
      credentials: 'include',
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch {
    return null
  }
}

/**
 * Redirect to login if not authenticated (for SSR)
 * 
 * @param cookies - Cookie string from request headers
 * @returns true if authenticated, false otherwise
 */
export async function requireAuth(cookies?: string): Promise<boolean> {
  const user = await getCurrentUser(cookies)
  return user !== null
}
