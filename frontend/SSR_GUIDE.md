# Server-Side Rendering (SSR) với FastAPI

## Tổng Quan

Next.js App Router sử dụng **Server Components** để render HTML trên server trước khi gửi đến client. Điều này cho phép fetch data từ FastAPI backend trực tiếp trên server.

## Luồng SSR Fetch Data

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT REQUEST                            │
│  User truy cập: http://localhost:3000/                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER (Node.js)                       │
│                                                              │
│  1. Nhận request                                            │
│  2. Render Server Component (app/page.tsx)                  │
│  3. Execute async function trong component                  │
│     const data = await productsApi.list()                   │
│  4. Fetch data từ FastAPI                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FASTAPI BACKEND                                │
│  GET http://localhost:8000/api/v1/products                  │
│  - Query database                                           │
│  - Return JSON response                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              NEXT.JS SERVER                                 │
│  5. Nhận data từ FastAPI                                    │
│  6. Render HTML với data                                    │
│  7. Gửi HTML đã render đến client                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                         │
│  - Nhận HTML đã render sẵn                                  │
│  - Hiển thị ngay lập tức                                    │
│  - Hydrate với JavaScript (nếu cần)                         │
└─────────────────────────────────────────────────────────────┘
```

## Ví Dụ: Home Page SSR

### Code trong `app/page.tsx`

```typescript
// Đây là Server Component (mặc định trong App Router)
export default async function HomePage() {
  // Fetch data trên server
  // Code này chạy trên Node.js server, KHÔNG chạy trong browser
  const data = await productsApi.list({ page: 1, limit: 12 })

  // Render HTML với data
  return (
    <div>
      {data.products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
```

### API Client (`lib/api.ts`)

```typescript
async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  // Fetch từ server (Next.js server → FastAPI)
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies nếu cần
  })

  return response.json()
}
```

## Đặc Điểm SSR

### ✅ Ưu Điểm

1. **SEO Friendly**
   - HTML được render sẵn trên server
   - Search engines có thể index content ngay
   - Không cần JavaScript để hiển thị content

2. **Fast Initial Load**
   - HTML đã có data, không cần fetch thêm
   - User thấy content ngay lập tức
   - Better First Contentful Paint (FCP)

3. **Server-Side Data Fetching**
   - Fetch data trên server (nhanh hơn)
   - Không expose API endpoints đến client
   - Có thể access server-only resources

4. **Better Performance**
   - Giảm tải cho client
   - Server có thể cache responses
   - Optimized for production

### ⚠️ Lưu Ý

1. **Server Components vs Client Components**
   - Server Components (mặc định): Chạy trên server
   - Client Components (`'use client'`): Chạy trên client
   - Không thể dùng hooks (useState, useEffect) trong Server Components

2. **API Calls**
   - Server Components: Fetch trực tiếp từ FastAPI
   - Client Components: Cần fetch qua Next.js API routes hoặc trực tiếp

3. **Authentication**
   - HttpOnly cookies tự động được gửi kèm requests
   - Server Components có thể access cookies
   - Client Components cần fetch qua API routes

## So Sánh: SSR vs Client-Side Rendering

### SSR (Server-Side Rendering)
```typescript
// app/page.tsx - Server Component
export default async function Page() {
  const data = await fetch('http://localhost:8000/api/v1/products')
  return <div>{/* Render với data */}</div>
}
```

**Kết quả:**
- HTML có sẵn data
- SEO friendly
- Fast initial load

### Client-Side Rendering
```typescript
// app/page.tsx - Client Component
'use client'
export default function Page() {
  const [data, setData] = useState(null)
  
  useEffect(() => {
    fetch('http://localhost:8000/api/v1/products')
      .then(res => res.json())
      .then(setData)
  }, [])
  
  return <div>{/* Render với data */}</div>
}
```

**Kết quả:**
- HTML không có data ban đầu
- Cần JavaScript để fetch và render
- Slower initial load

## Best Practices

### 1. Sử dụng SSR cho Public Pages
```typescript
// ✅ Good: Home page, Product list, Product detail
export default async function HomePage() {
  const products = await productsApi.list()
  return <ProductList products={products} />
}
```

### 2. Sử dụng Client Components cho Interactive Features
```typescript
// ✅ Good: Login form, Cart, Interactive components
'use client'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  // ...
}
```

### 3. Error Handling
```typescript
export default async function ProductPage({ params }: { params: { id: string } }) {
  try {
    const product = await productsApi.getById(Number(params.id))
    return <ProductDetail product={product} />
  } catch (error) {
    notFound() // Show 404 page
  }
}
```

### 4. Loading States
```typescript
// Sử dụng Suspense cho loading states
import { Suspense } from 'react'

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ProductList />
    </Suspense>
  )
}
```

## Tóm Tắt

- **SSR**: Render HTML trên server với data từ FastAPI
- **Benefits**: SEO, fast load, better performance
- **Implementation**: Server Components (async functions)
- **Data Fetching**: Trực tiếp từ FastAPI trong Server Components
- **Authentication**: HttpOnly cookies tự động được gửi kèm
