# E-Commerce Backend API

FastAPI backend cho sàn thương mại điện tử.

## Tech Stack

- **FastAPI**: Modern, fast web framework
- **SQLAlchemy (async)**: Async ORM
- **PostgreSQL**: Database
- **Alembic**: Database migrations
- **Pydantic**: Data validation
- **JWT**: Authentication

## Setup

### 1. Tạo Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Cài đặt Dependencies

```bash
pip install -r requirements.txt
```

### 3. Cấu hình Environment Variables

```bash
# Copy file .env.example thành .env
cp .env.example .env

# Chỉnh sửa .env với thông tin của bạn
# Đặc biệt là DATABASE_URL và SECRET_KEY
```

### 4. Chạy Server

```bash
# Development mode với auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 5. Test API

- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/api/v1/health

## Cấu Trúc Project

```
backend/
├── app/
│   ├── core/           # Core configuration
│   │   ├── config.py   # Settings
│   │   └── database.py # Database connection
│   ├── models/         # SQLAlchemy models
│   ├── routers/        # API routes
│   └── main.py         # FastAPI app
├── requirements.txt
├── .env.example
└── README.md
```

## Endpoints

### Health Check
- `GET /health` - Kiểm tra trạng thái API
- `GET /api/v1/health` - Health check (versioned)

### Authentication
- `POST /api/v1/auth/register` - Đăng ký user mới
  - Body: `{ "email": "user@example.com", "password": "password123", "role": "BUYER" }`
  - Role: `BUYER` hoặc `SELLER`
- `POST /api/v1/auth/login` - Đăng nhập
  - Body: `{ "email": "user@example.com", "password": "password123" }`
  - Response: Set JWT token in HttpOnly cookie
  - Returns: User information

### Users
- `GET /api/v1/users/me` - Lấy thông tin user hiện tại
  - Requires: Authentication (JWT token in cookie)
  - Returns: Current user information

### Products
- `GET /api/v1/products` - Lấy danh sách sản phẩm (public)
  - Query params: `skip`, `limit`, `category_id` (optional)
  - Returns: Paginated list of products
- `GET /api/v1/products/{id}` - Lấy chi tiết sản phẩm (public)
  - Returns: Product details with seller and category info
- `POST /api/v1/products` - Tạo sản phẩm mới (seller only)
  - Requires: Authentication + Seller role
  - Body: `{ "name": "...", "description": "...", "price": 100000, "stock": 10, "category_id": 1 }`
- `PUT /api/v1/products/{id}` - Cập nhật sản phẩm (seller only, own products)
  - Requires: Authentication + Seller role + Own product
  - Body: Partial update fields
- `DELETE /api/v1/products/{id}` - Xóa sản phẩm (seller only, own products)
  - Requires: Authentication + Seller role + Own product

## Development

### Code Style
- Follow PEP 8
- Use type hints
- Async/await for I/O operations

### Database Migrations
```bash
# Tạo migration
alembic revision --autogenerate -m "description"

# Apply migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Database Setup

### 1. Tạo Database

```sql
-- PostgreSQL
CREATE DATABASE ecommerce_db;
```

### 2. Tạo Migration

```bash
# Tạo migration tự động từ models
alembic revision --autogenerate -m "Create users table"

# Apply migration
alembic upgrade head
```

Xem chi tiết trong [MIGRATION.md](./MIGRATION.md)

## User Roles

### Buyer (Người Mua)
- Xem danh sách sản phẩm
- Tìm kiếm sản phẩm
- Thêm vào giỏ hàng
- Đặt hàng
- Xem lịch sử đơn hàng

### Seller (Người Bán)
- Quản lý sản phẩm (tạo, sửa, xóa)
- Xem đơn hàng liên quan đến sản phẩm của mình
- Cập nhật trạng thái đơn hàng
- Xem thống kê bán hàng

## Authentication Flow

### 1. Register
```bash
POST /api/v1/auth/register
{
  "email": "buyer@example.com",
  "password": "password123",
  "role": "BUYER"
}
```

### 2. Login
```bash
POST /api/v1/auth/login
{
  "email": "buyer@example.com",
  "password": "password123"
}
```

**Response**: JWT token được set trong HttpOnly cookie tự động.

### 3. Access Protected Endpoints
```bash
GET /api/v1/users/me
# Cookie tự động gửi kèm request
```

## JWT Token

- **Storage**: HttpOnly Cookie (JavaScript không thể truy cập)
- **Expiration**: 30 minutes (có thể config trong `.env`)
- **Payload**: `{ "sub": user_id, "email": email, "role": role }`
- **Security**: 
  - HttpOnly: Chống XSS
  - SameSite=Lax: Chống CSRF
  - Secure: Nên set `True` trong production (HTTPS)

## Database Models

### User
- id, email, password_hash, role, created_at
- Relationship: One seller has many products

### Category
- id, name
- Relationship: One category has many products

### Product
- id, name, description, price, stock, seller_id, category_id, created_at, updated_at
- Relationships:
  - Belongs to User (seller)
  - Belongs to Category

## Next Steps

- [x] Setup database models (User, Category, Product)
- [x] Implement authentication (Register, Login)
- [x] Implement login (JWT + HttpOnly Cookie)
- [x] Create product endpoints (CRUD)
- [ ] Create cart endpoints
- [ ] Create order endpoints
- [ ] Add tests
