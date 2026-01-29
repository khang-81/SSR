# E-Commerce Frontend

Next.js frontend với App Router cho sàn thương mại điện tử.

## Tech Stack

- **Next.js 14**: React framework với App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **Server-Side Rendering (SSR)**: SEO-friendly, fast initial load

## Setup

### 1. Cài đặt Dependencies

```bash
npm install
```

### 2. Cấu hình Environment

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### 3. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Cấu Trúc Project

```
frontend/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (SSR)
│   ├── login/             # Login page
│   ├── register/          # Register page
│   └── products/          # Product pages
│       └── [id]/         # Product detail (SSR)
├── components/            # React components
│   └── layout/           # Layout components
│       ├── Navbar.tsx
│       └── Footer.tsx
├── lib/                   # Utilities
│   └── api.ts            # API client
└── public/               # Static assets
```

## Pages

### Home Page (`/`)
- Server-Side Rendered (SSR)
- Hiển thị danh sách sản phẩm nổi bật
- Fetch data từ FastAPI backend

### Product Detail (`/products/[id]`)
- Server-Side Rendered (SSR)
- Hiển thị chi tiết sản phẩm
- Add to Cart functionality
- Fetch data từ FastAPI backend

### Cart (`/cart`) - Protected
- Server-Side Rendered (SSR)
- Xem giỏ hàng
- Cập nhật số lượng, xóa sản phẩm
- Protected route (yêu cầu authentication)

### Checkout (`/checkout`) - Protected
- Server-Side Rendered (SSR)
- Tạo đơn hàng từ giỏ hàng
- Protected route (yêu cầu authentication)

### Orders (`/orders`) - Protected
- Server-Side Rendered (SSR)
- Hiển thị danh sách đơn hàng
- Protected route (yêu cầu authentication)

### Seller Dashboard (`/seller/dashboard`) - Protected
- Server-Side Rendered (SSR)
- Dashboard với thống kê sản phẩm
- Protected route (yêu cầu Seller role)

### Seller Products (`/seller/products`) - Protected
- Server-Side Rendered (SSR)
- Quản lý sản phẩm (list, create, edit, delete)
- Protected route (yêu cầu Seller role)

### Seller Orders (`/seller/orders`) - Protected
- Server-Side Rendered (SSR)
- Xem đơn hàng liên quan đến sản phẩm của shop
- Protected route (yêu cầu Seller role)

### Login (`/login`)
- Client-side rendered
- Form đăng nhập
- JWT token được lưu trong HttpOnly cookie
- Redirect về trang được yêu cầu sau khi login

### Register (`/register`)
- Client-side rendered
- Form đăng ký
- Chọn vai trò (Buyer/Seller)

## SSR với FastAPI

Xem [SSR_GUIDE.md](./SSR_GUIDE.md) để hiểu cách SSR fetch data từ FastAPI.

## Features

- ✅ Server-Side Rendering (SSR)
- ✅ Responsive Design
- ✅ Tailwind CSS Styling
- ✅ TypeScript
- ✅ API Integration với FastAPI
- ✅ Authentication với JWT + HttpOnly Cookie
- ✅ Cart Management (Add, Update, Remove)
- ✅ Checkout Process
- ✅ Order Management
- ✅ Route Protection (Middleware + SSR)
- ✅ Seller Dashboard
- ✅ Product Management (CRUD)
- ✅ Seller Orders View

## Build

```bash
npm run build
npm start
```

## Route Protection

Routes được bảo vệ bằng 2 lớp:

1. **Middleware**: Kiểm tra cookie và redirect đến login
2. **SSR Protection**: Kiểm tra authentication trong Server Components

Protected routes:
- `/cart` - Requires authentication
- `/checkout` - Requires authentication
- `/orders` - Requires authentication
- `/seller/*` - Requires Seller role

## API Routes

Next.js API routes được sử dụng để proxy requests đến FastAPI:
- `/api/cart` - Cart operations
- `/api/orders` - Order operations
- `/api/users/me` - Get current user
- `/api/seller/products` - Seller product management
- `/api/seller/orders` - Seller orders

Lý do: SSR cần forward cookies từ client request đến FastAPI.

## Lưu Ý

- Backend FastAPI phải chạy trên `http://localhost:8000`
- CORS đã được cấu hình để cho phép requests từ frontend
- JWT token được lưu trong HttpOnly cookie tự động
- Protected routes yêu cầu authentication
