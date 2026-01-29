import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Về Chúng Tôi</h3>
            <p className="text-sm">
              Sàn thương mại điện tử hiện đại, nơi bạn có thể mua sắm mọi thứ bạn cần.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Kết Nhanh</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Trang Chủ
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Sản Phẩm
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  Giới Thiệu
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Hỗ Trợ</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Liên Hệ
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  Câu Hỏi Thường Gặp
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Liên Hệ</h3>
            <ul className="space-y-2 text-sm">
              <li>Email: support@ecommerce.com</li>
              <li>Hotline: 1900-xxxx</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} E-Commerce. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  )
}
