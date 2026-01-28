# 📘 Project Setup Guide

**Next.js Client + Express (TypeScript) Server + PostgreSQL**

---

## 🧱 Tech Stack

- **Client:** Next.js (React)
- **Server:** Express.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT + HttpOnly Cookies
- **Node.js:** **v20+ (Required)**

---

## ✅ Requirements

Make sure the following are installed:

| Software   | Version            |
| ---------- | ------------------ |
| Node.js    | **20.x or higher** |
| npm        | 9+                 |
| PostgreSQL | 13+                |
| Git        | Latest             |

Verify Node version:

```bash
node -v
```

Must be:

```
v20.x.x
```

---

# 📁 Project Structure

```
project-root/
│
├── client/     # Next.js frontend
├── server/     # Express + Prisma backend
└── README.md
```

---

# 🌐 CLIENT SETUP (Next.js)

## 1️⃣ Install dependencies

```bash
cd client
npm install
```

---

## 2️⃣ Environment variables

Create file:

```
client/.env.local
```

### Required

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

### Production example

```env
NEXT_PUBLIC_API_BASE_URL=https://yourdomain.com
```

> ⚠️ Only variables starting with `NEXT_PUBLIC_` are exposed to the browser.

---

## 3️⃣ Start client (development)

```bash
npm run dev
```

Client runs at:

```
http://localhost:3000
```

---

## 4️⃣ Build for production

```bash
npm run build
npm start
```

---

# 🔧 SERVER SETUP (Express + TypeScript)

## 1️⃣ Install dependencies

```bash
cd server
npm install
```

---

## 2️⃣ Environment variables

Create file:

```
server/.env
```

### Required environment variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

PORT=4000
NODE_ENV=development

JWT_SECRET=super-secret-key
COOKIE_NAME=auth_token

FIRST_ADMIN_PHONE=first_admin_phone
FIRST_ADMIN_PASSWORD=first_admin_password
FIRST_ADMIN_NAME=first_admin_name
FIRST_ADMIN_EMAIL=admin@example.com
```

---

### 🔐 Environment variable explanation

| Variable       | Description                     |
| -------------- | ------------------------------- |
| DATABASE_URL   | PostgreSQL connection string    |
| PORT           | API server port                 |
| NODE_ENV       | development / production        |
| JWT_SECRET     | Token signing secret            |
| COOKIE_NAME    | Authentication cookie name      |
| FIRST*ADMIN*\* | Auto-creates initial admin user |

---

## 3️⃣ Database setup

Ensure PostgreSQL is running.

Create database:

```sql
CREATE DATABASE billing_db;
```

---

## 4️⃣ Prisma setup

```bash
cd server
npx prisma generate
npx prisma migrate deploy
```

> Use `migrate dev` only for local development.

---

## 5️⃣ Start server

### Development

```bash
npm run dev
```

Server runs at:

```
http://localhost:4000
```

---

### Production

```bash
npm run build
node dist/main.js
```

(Recommended: run using **PM2**)

---

# 🔁 Client ↔ Server Communication

Client reads API base URL from:

```ts
process.env.NEXT_PUBLIC_API_BASE_URL;
```

Example:

```
http://localhost:4000/auth/login
```

Production:

```
https://yourdomain.com/api/auth/login
```

---

# 🔐 Authentication

- JWT stored in **HttpOnly cookies**
- Cookie name controlled via:

```env
COOKIE_NAME=auth_token
```

- Secure cookies automatically enabled in production

---

# 🧪 Local Development URLs

| Service    | URL                                            |
| ---------- | ---------------------------------------------- |
| Client     | [http://localhost:3000](http://localhost:3000) |
| Server     | [http://localhost:4000](http://localhost:4000) |
| PostgreSQL | localhost:5432                                 |

---

# 🚀 Production Deployment Summary

- Node.js **v20+ required**
- Server runs via **PM2**
- Client built using `next build`
- Reverse proxy:
  - `/` → client
  - `/api` → server

- PostgreSQL managed separately

---

# 📦 Common Scripts

### Client

```bash
npm run dev
npm run build
npm start
```

### Server

```bash
npm run dev
npm run build
node dist/main.js
```

---

# ✅ Production Ready

When setup is complete:

- Client accessible via domain
- Server protected behind `/api`
- PostgreSQL secured
- Admin auto-created
- JWT authentication enabled

---

# 🧠 Notes

- Use **Node 20 LTS**
- Restart app after changing `.env`
- Use `pm2` in production
- Never expose database publicly

---

## 🎯 Support

If something doesn’t work, check:

- Node version
- Environment variables
- Database credentials
- Prisma migration status
- Server logs

---

### 🚀 Happy Shipping!

This setup follows **real production architecture** used in startups and companies.

---
