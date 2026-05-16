# MediaGram — Full-Stack Social Media

Mạng xã hội đầy đủ chức năng (đăng ký, đăng nhập, profile, bài viết, like, comment, follow, chat realtime, thông báo) với giao diện lấy cảm hứng từ Facebook & Twitter.

## Tech stack

| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS, Zustand, Socket.io-client |
| Backend | Node.js, Express, Prisma, Socket.io, JWT |
| Database | PostgreSQL 15 (Docker) |
| Upload ảnh | Cloudinary |
| Deploy gợi ý | Frontend → **Vercel**, Backend → **Railway** |

## Yêu cầu

- [Node.js](https://nodejs.org/) 18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- Tài khoản [Cloudinary](https://cloudinary.com/) (miễn phí) — bắt buộc nếu upload ảnh

## Cấu trúc thư mục

```
MediaGram/
├── docker-compose.yml    # PostgreSQL + pgAdmin4
├── backend/              # API Express + Prisma
├── frontend/             # React + Vite
└── README.md
```

---

## Setup nhanh (Windows)

Mở **Docker Desktop**, rồi chạy trong PowerShell tại thư mục gốc project:

```powershell
.\scripts\setup.ps1
```

Script sẽ: cài npm (backend + frontend) → `docker compose up` → migrate → seed.

Hoặc dùng npm scripts:

```bash
npm run install:all
npm run docker:up
npm run db:setup
```

---

## Hướng dẫn chạy local (từng bước)

### 1. Khởi động PostgreSQL & pgAdmin (Docker)

Tại thư mục gốc dự án:

```bash
docker compose up -d
```

- **PostgreSQL**: `localhost:5434` — user `mediagram`, password `mediagram123`, database `mediagram`  
  (dùng cổng **5434** để tránh xung đột với PostgreSQL cài sẵn trên Windows thường chiếm 5432)
- **pgAdmin4**: http://localhost:5050 — email `admin@mediagram.com`, password `admin123`

Trong pgAdmin, thêm server mới:
- Host: `mediagram-db` nếu bạn đang kết nối từ pgAdmin chạy trong Docker
- Port: `5432` nếu dùng `mediagram-db`
- Nếu muốn kết nối từ máy host qua `localhost` / `host.docker.internal`, khi đó mới dùng port `5434`
- User/Password/DB: như trên

### 2. Cấu hình Backend

```bash
cd backend
cp ../.env.example .env
```

Chỉnh file `backend/.env` (hoặc copy từ `.env.example` ở root):

```env
DATABASE_URL="postgresql://mediagram:mediagram123@localhost:5434/mediagram?schema=public"
PORT=5000
JWT_ACCESS_SECRET=your_secret
JWT_REFRESH_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLIENT_URL=http://localhost:5173
```

Cài dependency và migrate database:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
```

Chạy API:

```bash
npm run dev
```

API: http://localhost:5000/api/health

### 3. Cấu hình Frontend

```bash
cd frontend
npm install
```

Tạo `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Chạy dev server:

```bash
npm run dev
```

Mở http://localhost:5173

### 4. Tài khoản demo (sau seed)

| Email | Mật khẩu |
|-------|-----------|
| alice@example.com | password123 |
| bob@example.com | password123 |
| admin@mediagram.com | password123 |

---

## Tính năng chính

- **Auth**: Đăng ký, đăng nhập, JWT access + refresh, auto refresh, logout
- **Profile**: Sửa bio, display name, upload avatar & cover (Cloudinary)
- **Feed**: Bài từ người đang follow + infinite scroll
- **Posts**: Text + tối đa 4 ảnh, like, comment lồng nhau, xóa bài của mình
- **Explore**: Tìm user/bài, hashtag trending
- **Chat**: Realtime Socket.io, online/offline, typing, read receipts
- **Notifications**: Like, comment, follow — realtime + badge

---

## Deploy production

### Frontend — Vercel

1. Push repo lên GitHub
2. Import project trên Vercel, **Root Directory**: `frontend`
3. Biến môi trường:
   - `VITE_API_URL` = URL API production (vd. `https://your-api.railway.app/api`)
   - `VITE_SOCKET_URL` = URL API (không có `/api`)

### Backend — Railway (khuyến nghị cho Express)

1. Tạo project Railway, deploy thư mục `backend`
2. Thêm **PostgreSQL** plugin hoặc dùng `DATABASE_URL` từ Railway
3. Set env: `JWT_*`, `CLOUDINARY_*`, `CLIENT_URL` = URL Vercel
4. Chạy migrate: `npx prisma migrate deploy` (Railway start command hoặc one-off)

> **Lưu ý**: Supabase phù hợp Postgres + Auth sẵn; với **Express tùy chỉnh** nên dùng Railway/Render/Fly.io thay vì Supabase Edge.

### Docker production (tùy chọn)

Có thể mở rộng `docker-compose.yml` thêm service `backend` và `frontend` — hiện tại compose chỉ chạy DB + pgAdmin cho dev.

---

## Scripts hữu ích

| Lệnh | Mô tả |
|------|--------|
| `npm run setup` | install + docker + migrate + seed (cần Docker đang chạy) |
| `npm run docker:up` | Chạy Postgres + pgAdmin |
| `npm run dev:api` | API dev (nodemon) |
| `npm run dev:web` | Frontend Vite |
| `npm run build:web` | Build production frontend |
| `npm run db:setup` | migrate deploy + seed |
| `cd backend && npm run prisma:studio` | Prisma Studio GUI |
| `cd frontend && npm run preview` | Xem bản build |

---

## Xử lý lỗi thường gặp

**Không kết nối DB** — Kiểm tra `docker compose ps`, đợi healthcheck xong rồi chạy lại migrate.

**Upload ảnh lỗi** — Kiểm tra `CLOUDINARY_*` trong `backend/.env`. Bài chỉ text vẫn đăng được nếu không gửi ảnh.

**Socket không kết nối** — `VITE_SOCKET_URL` trỏ đúng origin backend (không có path `/api`).

**CORS** — `CLIENT_URL` trên backend phải khớp URL frontend.

---

## License

Dự án cá nhân — tự do sử dụng và chỉnh sửa.
