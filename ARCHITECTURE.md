# Kiến Trúc Tổng Thể - Sàn Thương Mại Điện Tử

## 1. Kiến Trúc Tổng Thể

### 1.1. Tổng Quan Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Mobile     │  │   Desktop    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
┌────────────────────────────┼──────────────────────────────┐
│                    FRONTEND LAYER                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │         Next.js (React SSR - App Router)           │   │
│  │  - Server Components (SSR)                         │   │
│  │  - Client Components (Interactive)                  │   │
│  │  - API Routes (Proxy to Backend)                   │   │
│  │  - Middleware (Auth, Redirect)                     │   │
│  └────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                          │ HTTP/HTTPS
                          │ REST API
┌─────────────────────────┼──────────────────────────────────┐
│                    BACKEND LAYER                           │
│  ┌────────────────────────────────────────────────────┐   │
│  │              FastAPI (Python Async)                │   │
│  │  - API Endpoints                                   │   │
│  │  - Authentication (JWT + HttpOnly Cookie)         │   │
│  │  - Authorization (Role-based: Buyer/Seller/Admin) │   │
│  │  - Business Logic                                  │   │
│  │  - Validation (Pydantic)                          │   │
│  └────────────────────┬───────────────────────────────┘   │
└────────────────────────┼───────────────────────────────────┘
                          │
                          │ SQLAlchemy Async ORM
┌─────────────────────────┼──────────────────────────────────┐
│                    DATABASE LAYER                          │
│  ┌────────────────────────────────────────────────────┐   │
│  │              PostgreSQL Database                    │   │
│  │  - Users (Buyers, Sellers)                         │   │
│  │  - Products                                        │   │
│  │  - Orders                                          │   │
│  │  - Cart                                            │   │
│  │  - Categories                                      │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### 1.2. Các Layer Chính

#### **Frontend Layer (Next.js)**
- **Server Components**: Render HTML trên server, giảm JavaScript bundle
- **Client Components**: Tương tác người dùng (form, button, cart)
- **API Routes**: Proxy requests đến Backend FastAPI
- **Middleware**: Xử lý authentication, redirect, CORS
- **Static Generation**: Pre-render các trang tĩnh (product list, category)

#### **Backend Layer (FastAPI)**
- **API Endpoints**: RESTful API cho tất cả operations
- **Authentication**: JWT tokens lưu trong HttpOnly cookies (bảo mật)
- **Authorization**: Phân quyền dựa trên role (Buyer/Seller/Admin)
- **Business Logic**: Xử lý logic nghiệp vụ (order, payment, inventory)
- **Validation**: Pydantic models để validate request/response
- **Async Operations**: Tất cả I/O operations đều async (database, external APIs)

#### **Database Layer (PostgreSQL)**
- **ACID Compliance**: Đảm bảo tính nhất quán dữ liệu
- **Relationships**: Foreign keys, indexes cho performance
- **Transactions**: Đảm bảo atomicity cho các operations phức tạp

---

## 2. Luồng Request

### 2.1. Luồng Request: User Xem Danh Sách Sản Phẩm

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. Navigate to /products
     ▼
┌─────────────────────────────────┐
│   Next.js Frontend (SSR)       │
│                                 │
│   - Server Component:           │
│     /app/products/page.tsx      │
│                                 │
│   - Fetch data on server:       │
│     await fetch('/api/products')│
└────┬────────────────────────────┘
     │
     │ 2. Internal API call
     ▼
┌─────────────────────────────────┐
│   Next.js API Route             │
│   /app/api/products/route.ts    │
│                                 │
│   - Get JWT from HttpOnly cookie│
│   - Forward request to Backend  │
└────┬────────────────────────────┘
     │
     │ 3. HTTP Request (with JWT)
     ▼
┌─────────────────────────────────┐
│   FastAPI Backend               │
│   GET /api/v1/products          │
│                                 │
│   - Verify JWT token            │
│   - Parse query params          │
│     (page, limit, category,    │
│      search, sort)              │
└────┬────────────────────────────┘
     │
     │ 4. Database Query
     ▼
┌─────────────────────────────────┐
│   PostgreSQL Database           │
│                                 │
│   SELECT * FROM products        │
│   WHERE status = 'active'       │
│   ORDER BY created_at DESC      │
│   LIMIT 20 OFFSET 0             │
└────┬────────────────────────────┘
     │
     │ 5. Return data
     ▼
┌─────────────────────────────────┐
│   FastAPI Response              │
│   {                             │
│     products: [...],            │
│     total: 100,                 │
│     page: 1,                    │
│     limit: 20                   │
│   }                             │
└────┬────────────────────────────┘
     │
     │ 6. Return to Next.js
     ▼
┌─────────────────────────────────┐
│   Next.js Server Component      │
│   - Render HTML with data       │
│   - Send to client              │
└────┬────────────────────────────┘
     │
     │ 7. HTML Response
     ▼
┌─────────┐
│  User   │
│  (Browser displays products)    │
└─────────┘
```

**Đặc điểm:**
- **SSR**: HTML được render trên server, SEO-friendly
- **Hydration**: Client-side JavaScript "hydrate" để enable interactivity
- **Caching**: Có thể cache product list ở Next.js level

### 2.2. Luồng Request: User Đặt Hàng

```
┌─────────┐
│  Buyer  │
└────┬────┘
     │
     │ 1. Click "Đặt hàng"
     ▼
┌─────────────────────────────────┐
│   Next.js Client Component      │
│   /app/cart/page.tsx            │
│                                 │
│   - Validate cart items         │
│   - Show order summary          │
│   - User confirms order         │
└────┬────────────────────────────┘
     │
     │ 2. POST /api/orders
     ▼
┌─────────────────────────────────┐
│   Next.js API Route             │
│   /app/api/orders/route.ts      │
│                                 │
│   - Get JWT from HttpOnly cookie│
│   - Forward POST to Backend     │
└────┬────────────────────────────┘
     │
     │ 3. HTTP POST (with JWT + order data)
     ▼
┌─────────────────────────────────┐
│   FastAPI Backend               │
│   POST /api/v1/orders           │
│                                 │
│   Steps:                        │
│   1. Verify JWT token           │
│   2. Check user role = Buyer    │
│   3. Validate request data      │
│      (Pydantic model)           │
│   4. Check product availability │
│   5. Calculate total price      │
│   6. Start Database Transaction │
└────┬────────────────────────────┘
     │
     │ 4. Database Transaction
     ▼
┌─────────────────────────────────┐
│   PostgreSQL Database           │
│                                 │
│   BEGIN TRANSACTION;            │
│                                 │
│   -- Create order               │
│   INSERT INTO orders (...)      │
│                                 │
│   -- Create order items         │
│   INSERT INTO order_items (...) │
│                                 │
│   -- Update product stock       │
│   UPDATE products               │
│   SET stock = stock - quantity  │
│   WHERE id IN (...)             │
│                                 │
│   -- Clear user cart            │
│   DELETE FROM cart_items        │
│   WHERE user_id = ...           │
│                                 │
│   COMMIT;                       │
└────┬────────────────────────────┘
     │
     │ 5. Transaction Success
     ▼
┌─────────────────────────────────┐
│   FastAPI Response              │
│   {                             │
│     order_id: "123",            │
│     status: "pending",          │
│     total: 500000,              │
│     message: "Order created"    │
│   }                             │
└────┬────────────────────────────┘
     │
     │ 6. Return to Next.js
     ▼
┌─────────────────────────────────┐
│   Next.js API Route             │
│   - Forward response to client  │
└────┬────────────────────────────┘
     │
     │ 7. Update UI
     ▼
┌─────────┐
│  Buyer  │
│  (See order confirmation)       │
└─────────┘
```

**Đặc điểm:**
- **Transaction**: Đảm bảo atomicity (tất cả hoặc không gì cả)
- **Validation**: Validate ở nhiều layer (Frontend + Backend)
- **Authorization**: Chỉ Buyer mới có thể đặt hàng
- **Stock Check**: Kiểm tra tồn kho trước khi tạo order

---

## 3. Phân Biệt Vai Trò (Role-Based Access Control)

### 3.1. Buyer (Người Mua)

**Quyền hạn:**
- ✅ Xem danh sách sản phẩm
- ✅ Tìm kiếm sản phẩm
- ✅ Xem chi tiết sản phẩm
- ✅ Thêm sản phẩm vào giỏ hàng
- ✅ Quản lý giỏ hàng (thêm/xóa/cập nhật)
- ✅ Đặt hàng
- ✅ Xem lịch sử đơn hàng của mình
- ✅ Cập nhật thông tin cá nhân
- ❌ Không thể tạo/chỉnh sửa sản phẩm
- ❌ Không thể xem đơn hàng của người khác

**Endpoints:**
- `GET /api/v1/products` - Xem sản phẩm
- `GET /api/v1/products/{id}` - Chi tiết sản phẩm
- `GET /api/v1/cart` - Xem giỏ hàng
- `POST /api/v1/cart/items` - Thêm vào giỏ hàng
- `PUT /api/v1/cart/items/{id}` - Cập nhật giỏ hàng
- `DELETE /api/v1/cart/items/{id}` - Xóa khỏi giỏ hàng
- `POST /api/v1/orders` - Đặt hàng
- `GET /api/v1/orders` - Xem đơn hàng của mình
- `GET /api/v1/orders/{id}` - Chi tiết đơn hàng

### 3.2. Seller (Người Bán)

**Quyền hạn:**
- ✅ Xem danh sách sản phẩm (tất cả)
- ✅ Tạo sản phẩm mới
- ✅ Chỉnh sửa sản phẩm của mình
- ✅ Xóa sản phẩm của mình
- ✅ Quản lý tồn kho (stock)
- ✅ Xem đơn hàng liên quan đến sản phẩm của mình
- ✅ Cập nhật trạng thái đơn hàng (đang xử lý, đã giao)
- ✅ Xem thống kê bán hàng
- ❌ Không thể đặt hàng (hoặc có thể, tùy business logic)
- ❌ Không thể chỉnh sửa sản phẩm của seller khác

**Endpoints:**
- `GET /api/v1/products` - Xem tất cả sản phẩm
- `POST /api/v1/products` - Tạo sản phẩm mới
- `PUT /api/v1/products/{id}` - Cập nhật sản phẩm (chỉ của mình)
- `DELETE /api/v1/products/{id}` - Xóa sản phẩm (chỉ của mình)
- `GET /api/v1/seller/products` - Xem sản phẩm của mình
- `GET /api/v1/seller/orders` - Xem đơn hàng liên quan
- `PUT /api/v1/seller/orders/{id}/status` - Cập nhật trạng thái đơn hàng
- `GET /api/v1/seller/statistics` - Thống kê bán hàng

### 3.3. Admin (Sẽ thêm sau)

**Quyền hạn:**
- ✅ Tất cả quyền của Buyer và Seller
- ✅ Quản lý users (xem, khóa, xóa)
- ✅ Quản lý tất cả sản phẩm
- ✅ Quản lý tất cả đơn hàng
- ✅ Quản lý categories
- ✅ Xem thống kê tổng thể

### 3.4. Authentication Flow

```
┌─────────┐
│  User   │
└────┬────┘
     │
     │ 1. POST /api/v1/auth/login
     │    { email, password }
     ▼
┌─────────────────────────────────┐
│   FastAPI Backend               │
│   - Verify credentials          │
│   - Generate JWT token          │
│   - Set HttpOnly cookie         │
└────┬────────────────────────────┘
     │
     │ 2. Response: Set-Cookie header
     │    Cookie: access_token=xxx; HttpOnly; Secure; SameSite=Strict
     ▼
┌─────────────────────────────────┐
│   Next.js Frontend              │
│   - Cookie tự động lưu          │
│   - Redirect to dashboard       │
└────┬────────────────────────────┘
     │
     │ 3. Subsequent requests
     ▼
┌─────────────────────────────────┐
│   All API Requests              │
│   - Cookie tự động gửi kèm      │
│   - Backend verify JWT          │
│   - Extract user_id, role       │
└─────────────────────────────────┘
```

**Bảo mật:**
- **HttpOnly Cookie**: JavaScript không thể truy cập, chống XSS
- **Secure**: Chỉ gửi qua HTTPS
- **SameSite=Strict**: Chống CSRF
- **JWT Expiration**: Token có thời hạn, cần refresh

---

## 4. Cấu Trúc Thư Mục

### 4.1. Backend FastAPI

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app entry point
│   │
│   ├── core/                   # Core configuration
│   │   ├── __init__.py
│   │   ├── config.py           # Settings (database, JWT, etc.)
│   │   ├── security.py         # JWT, password hashing
│   │   └── database.py         # Database connection (async)
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── user.py             # User, Buyer, Seller models
│   │   ├── product.py          # Product model
│   │   ├── order.py            # Order, OrderItem models
│   │   ├── cart.py             # Cart, CartItem models
│   │   └── category.py         # Category model
│   │
│   ├── schemas/                # Pydantic schemas (request/response)
│   │   ├── __init__.py
│   │   ├── user.py             # User schemas
│   │   ├── product.py          # Product schemas
│   │   ├── order.py            # Order schemas
│   │   ├── cart.py             # Cart schemas
│   │   └── common.py           # Common schemas (pagination, etc.)
│   │
│   ├── api/                    # API routes
│   │   ├── __init__.py
│   │   ├── deps.py             # Dependencies (get_current_user, etc.)
│   │   │
│   │   ├── v1/                 # API version 1
│   │   │   ├── __init__.py
│   │   │   ├── auth.py         # Authentication endpoints
│   │   │   ├── products.py     # Product endpoints (public)
│   │   │   ├── cart.py         # Cart endpoints (Buyer)
│   │   │   ├── orders.py       # Order endpoints (Buyer)
│   │   │   │
│   │   │   ├── buyer/          # Buyer-specific endpoints
│   │   │   │   └── orders.py   # Buyer order management
│   │   │   │
│   │   │   └── seller/         # Seller-specific endpoints
│   │   │       ├── products.py # Seller product management
│   │   │       ├── orders.py   # Seller order management
│   │   │       └── statistics.py # Seller statistics
│   │   │
│   │   └── router.py           # Main router (combine all routes)
│   │
│   ├── services/               # Business logic layer
│   │   ├── __init__.py
│   │   ├── auth_service.py    # Authentication logic
│   │   ├── product_service.py  # Product business logic
│   │   ├── order_service.py    # Order business logic
│   │   ├── cart_service.py     # Cart business logic
│   │   └── user_service.py     # User business logic
│   │
│   ├── repositories/           # Data access layer (optional)
│   │   ├── __init__.py
│   │   ├── user_repository.py
│   │   ├── product_repository.py
│   │   └── order_repository.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── exceptions.py       # Custom exceptions
│       └── helpers.py          # Helper functions
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── tests/                      # Tests
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_products.py
│   └── test_orders.py
│
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
├── .env.example
└── README.md
```

**Giải thích:**
- **core/**: Cấu hình chung (database, security, config)
- **models/**: SQLAlchemy ORM models (database tables)
- **schemas/**: Pydantic schemas (validation, serialization)
- **api/**: API endpoints (routes)
- **services/**: Business logic (tách biệt khỏi routes)
- **repositories/**: Data access (optional, có thể dùng trực tiếp models)
- **utils/**: Helper functions, exceptions

### 4.2. Frontend Next.js (App Router)

```
frontend/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home page
│   ├── globals.css             # Global styles (Tailwind)
│   │
│   ├── (auth)/                 # Auth route group
│   │   ├── login/
│   │   │   └── page.tsx        # Login page
│   │   ├── register/
│   │   │   └── page.tsx        # Register page
│   │   └── layout.tsx          # Auth layout
│   │
│   ├── (buyer)/                # Buyer route group
│   │   ├── products/
│   │   │   ├── page.tsx        # Product list (SSR)
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Product detail (SSR)
│   │   ├── cart/
│   │   │   └── page.tsx        # Cart page
│   │   ├── orders/
│   │   │   ├── page.tsx        # Order list
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Order detail
│   │   └── layout.tsx          # Buyer layout (with navbar)
│   │
│   ├── (seller)/               # Seller route group
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Seller dashboard
│   │   ├── products/
│   │   │   ├── page.tsx        # Product management
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Create product
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx # Edit product
│   │   ├── orders/
│   │   │   └── page.tsx        # Seller orders
│   │   └── layout.tsx          # Seller layout
│   │
│   ├── api/                    # Next.js API routes (proxy to FastAPI)
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts
│   │   │   └── register/
│   │   │       └── route.ts
│   │   ├── products/
│   │   │   ├── route.ts        # GET /api/products
│   │   │   └── [id]/
│   │   │       └── route.ts    # GET /api/products/[id]
│   │   ├── cart/
│   │   │   ├── route.ts        # GET, POST /api/cart
│   │   │   └── items/
│   │   │       └── [id]/
│   │   │           └── route.ts # PUT, DELETE /api/cart/items/[id]
│   │   └── orders/
│   │       ├── route.ts        # GET, POST /api/orders
│   │       └── [id]/
│   │           └── route.ts    # GET /api/orders/[id]
│   │
│   └── middleware.ts           # Auth middleware, redirects
│
├── components/                 # React components
│   ├── ui/                     # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── layout/                 # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   │
│   ├── product/                # Product-related components
│   │   ├── ProductCard.tsx
│   │   ├── ProductList.tsx
│   │   └── ProductDetail.tsx
│   │
│   ├── cart/                   # Cart components
│   │   ├── CartItem.tsx
│   │   └── CartSummary.tsx
│   │
│   └── order/                  # Order components
│       ├── OrderCard.tsx
│       └── OrderDetail.tsx
│
├── lib/                        # Utilities, helpers
│   ├── api.ts                  # API client (fetch wrapper)
│   ├── auth.ts                 # Auth helpers
│   ├── utils.ts                # General utilities
│   └── types.ts                # TypeScript types
│
├── hooks/                      # Custom React hooks
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useProducts.ts
│
├── store/                      # State management (optional)
│   ├── cartStore.ts            # Zustand/Redux store
│   └── authStore.ts
│
├── public/                     # Static assets
│   ├── images/
│   └── icons/
│
├── types/                      # TypeScript type definitions
│   ├── product.ts
│   ├── order.ts
│   ├── user.ts
│   └── api.ts
│
├── tailwind.config.js          # Tailwind CSS config
├── next.config.js              # Next.js config
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md
```

**Giải thích:**
- **app/**: Next.js App Router (file-based routing)
  - **(auth)/**, **(buyer)/**, **(seller)/**: Route groups (không ảnh hưởng URL)
- **components/**: React components (tái sử dụng)
- **lib/**: Utilities, API client
- **hooks/**: Custom React hooks
- **store/**: State management (nếu cần)
- **types/**: TypeScript types

---

## 5. Database Schema (Tổng Quan)

### 5.1. Các Bảng Chính

```
users
├── id (PK)
├── email (unique)
├── password_hash
├── full_name
├── role (buyer/seller/admin)
├── is_active
├── created_at
└── updated_at

products
├── id (PK)
├── seller_id (FK -> users.id)
├── name
├── description
├── price
├── stock
├── category_id (FK -> categories.id)
├── images (JSON array)
├── status (active/inactive)
├── created_at
└── updated_at

categories
├── id (PK)
├── name
├── slug
└── parent_id (FK -> categories.id, nullable)

cart_items
├── id (PK)
├── user_id (FK -> users.id)
├── product_id (FK -> products.id)
├── quantity
└── created_at

orders
├── id (PK)
├── buyer_id (FK -> users.id)
├── total_amount
├── status (pending/processing/shipped/delivered/cancelled)
├── shipping_address
├── created_at
└── updated_at

order_items
├── id (PK)
├── order_id (FK -> orders.id)
├── product_id (FK -> products.id)
├── quantity
├── price (snapshot tại thời điểm đặt hàng)
└── seller_id (FK -> users.id)
```

---

## 6. Tóm Tắt

### 6.1. Kiến Trúc
- **3-tier**: Frontend (Next.js SSR) → Backend (FastAPI) → Database (PostgreSQL)
- **Async**: Tất cả I/O operations đều async
- **JWT + HttpOnly Cookie**: Bảo mật authentication
- **Role-based**: Buyer, Seller, Admin

### 6.2. Luồng Request
- **SSR**: Product list được render trên server (SEO-friendly)
- **Client-side**: Cart, Order sử dụng client components (interactive)
- **API Proxy**: Next.js API routes proxy đến FastAPI

### 6.3. Phân Quyền
- **Buyer**: Xem, tìm kiếm, giỏ hàng, đặt hàng
- **Seller**: Quản lý sản phẩm, đơn hàng của mình
- **Admin**: Quản lý toàn bộ hệ thống

### 6.4. Cấu Trúc
- **Backend**: Tách biệt rõ ràng (models, schemas, api, services)
- **Frontend**: App Router với route groups, components tái sử dụng

---

**Sẵn sàng cho Bước 2!** 🚀
