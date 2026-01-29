# Hướng Dẫn Setup Backend

## Bước 1: Tạo Virtual Environment

### Windows (PowerShell)
```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### Windows (CMD)
```cmd
cd backend
python -m venv venv
venv\Scripts\activate.bat
```

### Linux/Mac
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
```

## Bước 2: Cài Đặt Dependencies

```bash
pip install -r requirements.txt
```

## Bước 3: Cấu Hình Environment

```bash
# Copy file env.example thành .env
# Windows
copy env.example .env

# Linux/Mac
cp env.example .env
```

Sau đó chỉnh sửa file `.env` với thông tin của bạn:
- `DATABASE_URL`: URL kết nối PostgreSQL
- `SECRET_KEY`: Secret key cho JWT (nên dùng chuỗi ngẫu nhiên dài)

## Bước 4: Chạy Server

```bash
# Development mode (auto-reload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Bước 5: Test API

Mở trình duyệt và truy cập:
- **API Docs (Swagger)**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health
- **Root**: http://localhost:8000/

## Kiểm Tra Health Endpoint

```bash
# Sử dụng curl
curl http://localhost:8000/health

# Hoặc mở trình duyệt
# http://localhost:8000/health
```

Response mong đợi:
```json
{
  "status": "healthy",
  "service": "E-Commerce API",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000000"
}
```

## Lưu Ý

- **Database**: Hiện tại chưa cần database để chạy endpoint `/health`
- **Port**: Mặc định port 8000, có thể thay đổi bằng `--port`
- **Auto-reload**: Chế độ `--reload` tự động restart khi code thay đổi
