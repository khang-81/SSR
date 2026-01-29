# Database Migration Guide

## Tạo Migration

Sau khi đã setup database và models, tạo migration:

```bash
# Tạo migration tự động từ models
alembic revision --autogenerate -m "Create users table"

# Hoặc tạo migration trống (nếu cần chỉnh sửa thủ công)
alembic revision -m "Create users table"
```

## Apply Migration

```bash
# Apply tất cả migrations chưa được apply
alembic upgrade head

# Apply migration cụ thể
alembic upgrade <revision_id>

# Xem lịch sử migrations
alembic history
```

## Rollback Migration

```bash
# Rollback 1 bước
alembic downgrade -1

# Rollback về revision cụ thể
alembic downgrade <revision_id>

# Rollback tất cả
alembic downgrade base
```

## Lưu Ý

- **Database URL**: Đảm bảo `DATABASE_URL` trong `.env` đúng
- **Async**: Alembic env.py đã được cấu hình cho async SQLAlchemy
- **Models**: Tất cả models phải được import trong `alembic/env.py` để autogenerate hoạt động

## Ví Dụ: Tạo Migration cho User Table

```bash
# 1. Đảm bảo database đã được tạo
# PostgreSQL: CREATE DATABASE ecommerce_db;

# 2. Tạo migration
alembic revision --autogenerate -m "Create users table"

# 3. Kiểm tra file migration trong alembic/versions/
# 4. Apply migration
alembic upgrade head
```
