# Wintory

![Status](https://img.shields.io/badge/Status-Under%20Development-orange)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)
![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green)
![Express.js](https://img.shields.io/badge/Express.js-4.19-lightgrey)
![Prisma](https://img.shields.io/badge/Prisma-5.16-teal)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![Redis](https://img.shields.io/badge/Redis-7-red)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

> A production-grade, AI-powered inventory management and sales forecasting SaaS platform designed for independent grocery stores, serving as their AI operations copilot.

---

## Overview

Wintory is a full-stack SaaS platform built specifically to support growing independent grocery stores (typically managing 2,000–10,000 SKUs and operated by 2–10 employees). 

Beyond simple record-keeping, Wintory serves as an **AI Operations Copilot**, combining standard inventory controls with demand forecasting, automated purchase ordering, and out-of-band background workflows to streamline store management.

### Core Capabilities

- **Multi-Tenant Store Isolation**: Full data isolation boundary partition per store (tenant).
- **Authentication & RBAC**: Secure credential auth via token rotation (JWT & Refresh tokens) with Role-Based Access Control (`ADMIN`, `MANAGER`, `STAFF`).
- **Product & Category Catalog**: Complete product metadata mapping (SKUs, barcodes, categories, and descriptions).
- **Inventory Tracking & Thresholds**: Real-time stock counts with configurable reorder points and automated notification triggers.
- **Sales & Transaction Ingestion**: Clean logging of itemized store sales, dynamically recalculating total revenues and auto-decrementing inventory levels.
- **Purchase Order Pipelines**: Lifecycle tracking for supplier purchases (`DRAFT`, `SENT`, `RECEIVED`, `CANCELLED`) with automated inventory reconciliation when stock arrives.
- **AI-Powered Demand Forecasting**: Data-driven sales predictions helping managers optimize purchase order amounts, spot dead stock, and avoid supply chain lockouts.
- **Asynchronous Task Architecture**: Non-blocking workers powered by BullMQ and Redis handling background jobs such as CSV exports/imports and stock-alert notifications.
- **Interactive Swagger Documentation**: Standard OpenAPI spec sandbox for API testing.

---

# Architecture

```mermaid
flowchart TD
    %% Frontend Layer
    Browser[Browser / Next.js Client App]
    
    %% API & Core Layer
    subgraph Backend [Express API Gateway - Port 3000]
        Router[API Router /api/v1]
        
        subgraph Modules [Application Modules]
            Auth[Auth & User]
            Product[Product & Category]
            Inv[Inventory Management]
            Sales[Sales Tracking]
            PO[Purchase Orders]
        end
    end

    %% Database & Queue Layer
    subgraph Data [Data & Job Queue Layer]
        Prisma[Prisma ORM]
        Postgres[(PostgreSQL Database)]
        Redis[(Redis Cache & Queue)]
        Workers[BullMQ Workers]
    end

    %% Connections
    Browser -->|HTTP Request / JSON| Router
    Router --> Modules
    Modules -->|Database Queries| Prisma
    Prisma --> Postgres
    Modules -->|Dispatch Background Jobs| Redis
    Redis --> Workers
    Workers -->|DB Updates / Logging| Postgres
```

---

# Request Flow

```mermaid
sequenceDiagram
    actor Manager as Store Manager / Staff
    participant Frontend as Next.js UI (Planned)
    participant API as Express API (Port 3000)
    participant Queue as Redis / BullMQ
    participant DB as PostgreSQL (via Prisma)

    Manager->>Frontend: Perform Action (e.g., Record Sale / Receive PO)
    Frontend->>API: POST /api/v1/sales (with JWT)
    Note over API: Authenticate & Validate Request Schema (Zod)
    API->>DB: Record Transaction & Update Inventory
    DB-->>API: Transaction Complete
    API->>Queue: Dispatch Async Job (e.g., Low-Stock Notification check)
    API-->>Frontend: Return 201 Created (Receipt & Updates)
    Frontend-->>Manager: Display Confirmation
    Queue->>DB: Process Queue Job (Create low-stock Notification if threshold hit)
```

---

# Technology Stack

- **Frontend**: Next.js, React, Tailwind CSS (Planned/Placeholder)
- **Backend API**: Node.js (>=18), Express, TypeScript (Strict-mode)
- **Database ORM**: Prisma ORM
- **Database**: PostgreSQL (ACID-compliant store)
- **Cache & Queues**: Redis & BullMQ (Background job processing)
- **Validation**: Zod (JSON schema validation)
- **Testing**: Vitest (Unit and integration suite)
- **Logging**: Winston logger (Structured HTTP / application logging)
- **DevOps**: Docker, Docker Compose

---

# Project Structure

```
Wintory
├── backend/
│   ├── src/
│   │   ├── common/         # Global middlewares, error handlers, and validation helpers
│   │   ├── config/         # App environment, DB, Redis, logger, and Swagger specs
│   │   ├── modules/        # Domain-driven features & routes
│   │   │   ├── auth/           # JWT authentications and credential checks
│   │   │   ├── category/       # Product classification and categories
│   │   │   ├── inventory/      # Stock tracking, thresholds, and manual adjustments
│   │   │   ├── product/        # Item definitions, SKUs, and barcodes
│   │   │   ├── purchase-order/ # Procurement pipelines and supplier orders
│   │   │   ├── sale/           # Customer transaction recording and ingestion
│   │   │   ├── supplier/       # Vendor metadata profiles
│   │   │   └── user/           # Core system users and store associations
│   │   ├── workers/        # BullMQ background worker scripts
│   │   ├── app.ts          # Express setup and global middlewares
│   │   ├── routes.ts       # Router assembly config
│   │   └── server.ts       # Server initializer & graceful shutdown hooks
│   ├── prisma/             # Schema files, migration SQL scripts, and seeding rules
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   └── README.md           # Planned Next.js user-interface module
├── docs/                   # Product requirements, API documentation, design logs
├── docker-compose.yml      # Multi-container orchestration (PostgreSQL, Redis, API)
└── README.md
```

---

# Database Design

```mermaid
erDiagram
    STORE ||--o{ USER : contains
    STORE ||--o{ CATEGORY : defines
    STORE ||--o{ PRODUCT : owns
    STORE ||--o{ SUPPLIER : registers
    STORE ||--o{ SALE : processes
    STORE ||--o{ PURCHASE_ORDER : issues
    STORE ||--o{ NOTIFICATION : triggers

    USER ||--o{ REFRESH_TOKEN : authenticates
    USER ||--o{ SALE : executes

    CATEGORY ||--o{ PRODUCT : categorizes

    PRODUCT ||--|| INVENTORY : maintains
    PRODUCT ||--o{ SALE_ITEM : line_item
    PRODUCT ||--o{ PURCHASE_ORDER_ITEM : line_item
    PRODUCT ||--o{ FORECAST : predicts

    SUPPLIER ||--o{ PURCHASE_ORDER : supplies

    SALE ||--o{ SALE_ITEM : details
    PURCHASE_ORDER ||--o{ PURCHASE_ORDER_ITEM : details
```

---

# Getting Started

## 1. Clone Repository

```bash
git clone https://github.com/maadhav6677/Wintory.git
cd Wintory
```

---

## 2. Install Backend Dependencies

Ensure you have Node.js (>=18.0.0) installed:

```bash
cd backend
npm install
```

---

## 3. Configure Environment Variables

Create your local `.env` configuration within the `backend/` directory:

```bash
cp .env.example .env
```

Review and adjust variables inside `backend/.env` as needed:

```env
PORT=3000
NODE_ENV=development
API_PREFIX=/api/v1

DATABASE_URL=postgresql://your_user:your_password@localhost:5432/wintory_db?schema=public
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
```

---

## 4. Spin up Database & Cache

Use Docker Compose to launch PostgreSQL and Redis containers locally:

```bash
# From the project root
docker compose up postgres redis -d
```

---

## 5. Sync Database Schema & Generate Client

Prepare your database schema using Prisma:

```bash
# Inside the backend/ directory
npm run prisma:migrate
npm run prisma:generate
```

---

## 6. Run Backend Dev Server

Start the development server with live reload:

```bash
# Inside the backend/ directory
npm run dev
```

The server runs on `http://localhost:3000`. 
API interactive docs are available at `http://localhost:3000/api-docs`.

---

# Testing

Wintory backend utilizes **Vitest** for running unit and integration test suites:

```bash
# Inside the backend/ directory
npm run test
```

---

# Docker Orchestration

To build and run the entire stack (Database, Cache, and Backend Express API) in a unified Docker network:

```bash
# From root directory
docker compose build
docker compose up
```

To tear down services:

```bash
docker compose down
```

---

# API Overview

Interactive Swagger documentation is available out of the box at `http://localhost:3000/api-docs`. Core route prefixes:

- **Authentication** (`/api/v1/auth`): Register (`POST /register`), Login (`POST /login`), Refresh (`POST /refresh`), Logout (`POST /logout`).
- **Users** (`/api/v1/users`): Profile management and registration of managers/staff.
- **Categories** (`/api/v1/categories`): Classification schemas for retail items.
- **Products** (`/api/v1/products`): SKU setup, barcodes, categorizations, and descriptions.
- **Inventory** (`/api/v1/inventory`): Quantity tracking, restock thresholds, location logs, updates.
- **Sales** (`/api/v1/sales`): Transaction recordings (automatically updates stock levels).
- **Purchase Orders** (`/api/v1/purchase-orders`): Procurement orders to suppliers (reconciles stock upon arrival).
- **Suppliers** (`/api/v1/suppliers`): Vendor/supplier contact profiles.

---

# Future Roadmap

- **Phase 1: Core Platform**: Complete the store management portal, inventory levels tracking, sales, and PO logs.
- **Phase 2: Forecasting Engine**: Integrate the Python FastAPI service, introducing Moving Average, Exponential Smoothing, and eventually Prophet / XGBoost ML pipelines.
- **Phase 3: Whatsapp Alerts & Supplier Integration**: Automate restocking messages and low-stock updates to managers via WhatsApp integrations.
- **Phase 4: OCR & Scale operations**: PDF/invoice parsing engine to auto-generate PO logs, voice-assisted stock updates, and multi-location management dashboards.

---

# Design & Engineering Principles

- **Modular Monolith**: Organized domain modules separating concerns before considering scaling to microservices.
- **Type Safety**: Strictly typed TypeScript codebase (no usage of `any`).
- **Input Validation**: Zero-trust endpoint architecture enforcing Zod validation for body and query elements.
- **Repository Pattern**: Clean decoupling of business logic handlers from Prisma database access query layers.
- **Clean Architecture**: Transparent error boundary routing and response standardization.

---

# Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

# License

Distributed under the MIT License.

---

## Author

**Maadhav**
- GitHub: [maadhav6677](https://github.com/maadhav6677)
