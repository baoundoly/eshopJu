# EshopJu — Premium Football Jersey eCommerce Store

A modern, enterprise-grade eCommerce platform for selling football jerseys with **WhatsApp social checkout**, **bKash/Nagad payment support**, and a **full admin panel**.

## 🏗️ Architecture

```
EshopJu/
├── src/
│   ├── backend/                  # ASP.NET Core Web API (Clean Architecture)
│   │   ├── EshopJu.Core/         # Domain: Entities, Enums, Interfaces
│   │   ├── EshopJu.Application/  # DTOs, Service Interfaces
│   │   ├── EshopJu.Infrastructure/ # EF Core, Repositories, Services
│   │   └── EshopJu.API/          # Controllers, Auth, Swagger
│   └── frontend/                 # Next.js 15 + Tailwind CSS + TypeScript
│       ├── app/                  # App Router pages
│       ├── components/           # Reusable UI components
│       └── lib/                  # API client, Zustand stores, types
└── docker-compose.yml
```

## 🚀 Quick Start

### Run with Docker
```bash
docker-compose up --build
```
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Swagger: http://localhost:5000/swagger

### Run Locally

**Backend:**
```bash
cd src/backend
dotnet run --project EshopJu.API
```

**Frontend:**
```bash
cd src/frontend
npm install
npm run dev
```

## 🧩 Features

### Customer Features
- Product browsing with filters (category, team, price, size)
- Shopping cart (session-based for guests, user-linked when logged in)
- **WhatsApp Checkout** — one-click order via WhatsApp deep link
- Payment methods: bKash, Nagad, Cash on Delivery
- Order tracking by order number

### Admin Features
- Dashboard with KPI cards (orders, revenue, products)
- Product management (CRUD, images, inventory)
- Order management (update status: Pending → Confirmed → Delivered)
- Payment verification (bKash/Nagad transaction ID)
- Category management

### WhatsApp Integration
Orders are confirmed via WhatsApp deep link:
```
https://wa.me/8801XXXXXXXXX?text=Order+Details...
```

## 🎨 Design

- Dark sports theme: black background, red/neon-green accents
- Mobile-first responsive design
- Sports typography (Inter font, bold headings)

## 📡 API Endpoints

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/login` | — |
| POST | `/api/auth/register` | — |
| GET | `/api/products` | — |
| GET | `/api/products/featured` | — |
| POST | `/api/products` | Admin |
| GET | `/api/categories` | — |
| GET | `/api/cart` | — |
| POST | `/api/cart/items` | — |
| POST | `/api/orders` | — |
| POST | `/api/orders/whatsapp-link` | — |
| GET | `/api/orders` | Admin |
| GET | `/api/admin/dashboard` | Admin |

## 🔧 Configuration

### Backend (`appsettings.json`)
```json
{
  "Jwt": { "Secret": "your-32-char-secret-key" },
  "WhatsApp": { "PhoneNumber": "8801XXXXXXXXX" },
  "ConnectionStrings": { "DefaultConnection": "..." }
}
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=8801XXXXXXXXX
```

## 🗄️ Database

Entity Framework Core with:
- **In-Memory** for development (default)
- **SQL Server** for production

Seed data: 3 categories (Club, National, Custom) + 4 sample products.

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | .NET 10, ASP.NET Core, EF Core 9, JWT, BCrypt |
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Zustand, Axios |
| Database | SQL Server / In-Memory (dev) |
| Deployment | Docker + Docker Compose |

## 📋 Order Flow

1. Browse Products → Select Size → Add to Cart
2. Checkout Form (Name, Phone, Address, Payment Method)
3. Click "Order via WhatsApp" → Pre-filled WhatsApp message opens
4. Admin confirms order → Updates status → Verifies payment
5. Order Delivered ✓
