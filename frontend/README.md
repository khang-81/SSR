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
- Fetch data từ FastAPI backend

### Login (`/login`)
- Client-side rendered
- Form đăng nhập
- JWT token được lưu trong HttpOnly cookie

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

## Build

```bash
npm run build
npm start
```

## Lưu Ý

- Backend FastAPI phải chạy trên `http://localhost:8000`
- CORS đã được cấu hình để cho phép requests từ frontend
- JWT token được lưu trong HttpOnly cookie tự động
