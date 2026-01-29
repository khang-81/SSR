# Route Protection - Bảo Vệ Routes

## Tổng Quan

Hệ thống sử dụng **2 lớp bảo vệ** để đảm bảo chỉ user đã đăng nhập mới có thể truy cập các routes được bảo vệ.

## 1. Middleware Protection

**File**: `middleware.ts`

Middleware chạy trước khi request đến page, kiểm tra cookie và redirect nếu chưa đăng nhập.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  if (isProtectedRoute) {
    const accessToken = request.cookies.get('access_token')
    
    if (!accessToken) {
      // Redirect to login
      return NextResponse.redirect('/login?redirect=' + pathname)
    }
  }
}
```

**Protected Routes**:
- `/cart`
- `/checkout`
- `/orders`
- `/profile`

**Ưu điểm**:
- Chạy trước khi render page
- Nhanh (không cần render)
- Redirect ngay lập tức

## 2. SSR Protection

**File**: `lib/auth.ts` + Page components

Kiểm tra authentication trong Server Components trước khi fetch data.

```typescript
// app/cart/page.tsx
export default async function CartPage() {
  // Check authentication (SSR)
  const cookieStore = await cookies()
  const cookiesString = cookieStore.toString()
  
  const isAuthenticated = await requireAuth(cookiesString)
  if (!isAuthenticated) {
    redirect('/login?redirect=/cart')
  }

  // Fetch cart data (only if authenticated)
  const cart = await cartApi.get()
  return <CartClient initialCart={cart} />
}
```

**Ưu điểm**:
- Kiểm tra chính xác hơn (verify JWT với backend)
- Không fetch data nếu chưa đăng nhập
- Better security

## Luồng Bảo Vệ

```
User Request → Middleware
              ↓
         Check Cookie
              ↓
    ┌─────────┴─────────┐
    │                   │
  No Cookie          Has Cookie
    │                   │
    ↓                   ↓
Redirect Login    →  Server Component
                          ↓
                    Check Auth (SSR)
                          ↓
                    ┌─────┴─────┐
                    │           │
                Not Auth    Authenticated
                    │           │
                    ↓           ↓
              Redirect    Fetch Data
              to Login    & Render
```

## Utility Functions

### `getCurrentUser(cookies)`
Kiểm tra authentication và trả về user info.

```typescript
const user = await getCurrentUser(cookies)
if (user) {
  // User is authenticated
}
```

### `requireAuth(cookies)`
Kiểm tra authentication, trả về boolean.

```typescript
const isAuth = await requireAuth(cookies)
if (!isAuth) {
  redirect('/login')
}
```

## Redirect After Login

Sau khi login thành công, user được redirect về trang ban đầu:

```typescript
// Login page
const redirect = searchParams.get('redirect') || '/'
router.push(redirect)
```

**Ví dụ**:
- User truy cập `/cart` → Redirect `/login?redirect=/cart`
- User login → Redirect về `/cart`

## Best Practices

1. **Sử dụng cả 2 lớp bảo vệ**:
   - Middleware: Fast check, early redirect
   - SSR: Accurate check, prevent data fetch

2. **Always check in SSR**:
   - Không fetch data nếu chưa authenticated
   - Tránh lãng phí resources

3. **Handle errors gracefully**:
   - Redirect đến login với return URL
   - Show friendly error messages

## Example: Protected Cart Page

```typescript
// app/cart/page.tsx
export default async function CartPage() {
  // 1. Middleware đã check cookie (nếu không có → redirect)
  
  // 2. SSR check (verify với backend)
  const cookieStore = await cookies()
  const isAuth = await requireAuth(cookieStore.toString())
  if (!isAuth) {
    redirect('/login?redirect=/cart')
  }

  // 3. Fetch data (chỉ khi authenticated)
  const cart = await cartApi.get()
  
  // 4. Render
  return <CartClient initialCart={cart} />
}
```

## Security Notes

- **HttpOnly Cookies**: JWT token không thể truy cập từ JavaScript
- **Server-Side Verification**: Luôn verify với backend, không trust client
- **Redirect on Failure**: Luôn redirect đến login nếu không authenticated
- **No Data Leakage**: Không fetch data nếu chưa authenticated
