'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in (check for cookie)
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/users/me', {
          credentials: 'include',
        })
        setIsLoggedIn(response.ok)
      } catch {
        setIsLoggedIn(false)
      }
    }
    checkAuth()
    
    // Refresh auth state when route changes
    const interval = setInterval(checkAuth, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">🛒</span>
            <span className="text-xl font-bold text-gray-900">E-Commerce</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Trang Chủ
            </Link>
            <Link
              href="/products"
              className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
            >
              Sản Phẩm
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  href="/cart"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Giỏ Hàng
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Đơn Hàng
                </Link>
                <Link
                  href="/seller/dashboard"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Bán Hàng
                </Link>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Link
                href="/profile"
                className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
              >
                Tài Khoản
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-primary-600 transition-colors duration-200 font-medium"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="btn-primary"
                >
                  Đăng Ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
