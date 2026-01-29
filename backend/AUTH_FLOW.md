# Luồng Xác Thực JWT với HttpOnly Cookie

## Tổng Quan

Hệ thống sử dụng **JWT (JSON Web Token)** kết hợp với **HttpOnly Cookie** để xác thực người dùng.

## Luồng Xác Thực

### 1. Đăng Ký (Register)

```
User → POST /api/v1/auth/register
     → Backend tạo user mới
     → Hash password bằng bcrypt
     → Lưu vào database
     → Response: User info (không có password)
```

**Request:**
```json
{
  "email": "buyer@example.com",
  "password": "password123",
  "role": "BUYER"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "buyer@example.com",
    "role": "BUYER",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

### 2. Đăng Nhập (Login)

```
User → POST /api/v1/auth/login
     → Backend verify email + password
     → Tạo JWT token (chứa user_id, email, role)
     → Set HttpOnly Cookie với token
     → Response: User info
```

**Request:**
```json
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

**Response:**
- **Body:**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "buyer@example.com",
    "role": "BUYER",
    "created_at": "2024-01-01T00:00:00"
  }
}
```

- **Headers:**
```
Set-Cookie: access_token=eyJ0eXAiOiJKV1QiLCJhbGc...; HttpOnly; SameSite=Lax; Path=/; Max-Age=1800
```

### 3. Truy Cập Endpoint Bảo Vệ

```
User → GET /api/v1/users/me
     → Browser tự động gửi cookie
     → Backend verify JWT từ cookie
     → Extract user info từ JWT
     → Query database để lấy user đầy đủ
     → Response: User info
```

**Request:**
- Cookie tự động gửi kèm (không cần thủ công)

**Response:**
```json
{
  "id": 1,
  "email": "buyer@example.com",
  "role": "BUYER",
  "created_at": "2024-01-01T00:00:00"
}
```

## Chi Tiết Kỹ Thuật

### JWT Token Payload

```json
{
  "sub": 1,                    // User ID
  "email": "buyer@example.com", // User email
  "role": "BUYER",             // User role
  "exp": 1704067200            // Expiration timestamp
}
```

### Cookie Settings

- **HttpOnly**: `true` - JavaScript không thể truy cập (chống XSS)
- **Secure**: `false` (dev) / `true` (production) - Chỉ gửi qua HTTPS
- **SameSite**: `lax` - CSRF protection
- **Path**: `/` - Cookie có hiệu lực cho toàn bộ domain
- **Max-Age**: `1800` (30 phút) - Thời gian hết hạn

### Security Features

1. **Password Hashing**: Bcrypt với salt tự động
2. **JWT Expiration**: Token tự động hết hạn sau 30 phút
3. **HttpOnly Cookie**: Chống XSS attacks
4. **SameSite Cookie**: Chống CSRF attacks
5. **Token Verification**: Mỗi request đều verify token

## Luồng Lỗi

### Login Failed
```json
{
  "detail": "Incorrect email or password"
}
```
Status: `401 Unauthorized`

### Token Missing/Invalid
```json
{
  "detail": "Not authenticated"
}
```
Status: `401 Unauthorized`

### Token Expired
```json
{
  "detail": "Invalid or expired token"
}
```
Status: `401 Unauthorized`

## Test với cURL

### 1. Register
```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","role":"BUYER"}'
```

### 2. Login (Lưu cookie)
```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

### 3. Get Current User (Dùng cookie)
```bash
curl -X GET http://localhost:8000/api/v1/users/me \
  -b cookies.txt
```

## Test với Browser

1. Mở **Swagger UI**: http://localhost:8000/docs
2. **Register** user mới
3. **Login** với email/password
4. Cookie tự động được set
5. Gọi **GET /users/me** - Cookie tự động gửi kèm

## Lưu Ý

- **Development**: `secure=False` để test trên HTTP
- **Production**: Phải set `secure=True` (chỉ HTTPS)
- **Token Refresh**: Hiện tại chưa có, cần login lại khi hết hạn
- **Logout**: Xóa cookie bằng cách set cookie với `Max-Age=0`
