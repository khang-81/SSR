# E-Commerce Platform

> Modern full-stack e-commerce platform built with FastAPI and Next.js

A production-ready e-commerce marketplace similar to Shopee, featuring buyer and seller functionalities with a clean, scalable architecture.

##  Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **SQLAlchemy (async)** - Async ORM for database operations
- **PostgreSQL** - Relational database
- **Alembic** - Database migrations
- **JWT** - Authentication with HttpOnly cookies
- **Pydantic** - Data validation and settings management

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Server-Side Rendering (SSR)** - SEO-friendly, fast initial load

##  Project Structure

```
SSR/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── core/           # Core configuration (config, database, security)
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── schemas/        # Pydantic schemas for validation
│   │   ├── routers/        # API route handlers
│   │   ├── services/       # Business logic layer
│   │   └── main.py         # Application entry point
│   ├── alembic/            # Database migrations
│   ├── Dockerfile          # Production Docker image
│   ├── Dockerfile.dev      # Development Docker image
│   ├── requirements.txt    # Python dependencies
│   └── env.example         # Environment variables template
│
├── frontend/                # Next.js frontend
│   ├── app/                # Next.js App Router pages
│   ├── components/         # React components
│   ├── lib/                # Utilities (API client, auth helpers)
│   ├── Dockerfile          # Production Docker image
│   ├── package.json        # Node.js dependencies
│   └── next.config.js      # Next.js configuration
│
├── docker-compose.yml       # Docker Compose configuration
└── README.md               # This file
```

##  Quick Start

### Step 1: Check Docker Desktop

**Windows PowerShell:**
```powershell
docker info
```

### Step 2: Start the Application

```bash
# Build and start all services
docker-compose up -d --build

# Run database migrations
docker-compose exec backend alembic upgrade head
```

### Step 3: Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs
- **Database**: localhost:5432
  - User: `postgres`
  - Password: `postgres`
  - Database: `ecommerce_db`

##  Features

### Buyer Features
- ✅ User registration and authentication
- ✅ Browse products with search and filtering
- ✅ Product detail pages
- ✅ Shopping cart management
- ✅ Order placement
- ✅ Order history

### Seller Features
- ✅ Seller registration and authentication
- ✅ Product management (CRUD operations)
- ✅ View shop orders
- ✅ Inventory management

##  Configuration

### Backend Environment Variables

Create `backend/.env` file (see `backend/env.example`):

```env
# Application
APP_NAME=E-Commerce API
APP_VERSION=1.0.0
DEBUG=True
ENVIRONMENT=development

# Database
DATABASE_URL=postgresql+asyncpg://postgres:postgres@postgres:5432/ecommerce_db

# Security
SECRET_KEY=your-secret-key-change-in-production
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `frontend/.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

##  API Documentation

Interactive API documentation is available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
