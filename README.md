# MediaGram

MediaGram là project mạng xã hội full-stack với đăng ký/đăng nhập, profile, đăng bài, like, comment, follow, chat realtime và thông báo.

## Stack

- Frontend: React, Vite, TailwindCSS, Zustand, Socket.io-client
- Backend: Node.js, Express, Prisma, Socket.io, JWT
- Database: PostgreSQL 15 chạy bằng Docker
- Upload ảnh: Cloudinary

## Cần có

- Node.js 18+
- Docker Desktop
- Tài khoản Cloudinary nếu muốn upload ảnh

## Cấu trúc chính

- `backend/`: API Express + Prisma
- `frontend/`: app React + Vite
- `docker-compose.yml`: PostgreSQL và pgAdmin

## Chạy local

### 1) Bật PostgreSQL và pgAdmin

Ở thư mục gốc project:

```powershell
docker compose up -d
```

Sau đó:

- PostgreSQL: `localhost:5434`
- pgAdmin: `http://localhost:5050`

Thông tin DB mặc định:

- Database: `mediagram`
- User: `mediagram`
- Password: `mediagram123`

Trong pgAdmin, nếu cần đăng ký server thủ công:

- Host: `mediagram-db` khi kết nối trong Docker network
- Port: `5432` nếu dùng `mediagram-db`
- Nếu kết nối từ máy host thì dùng `localhost:5434`

### 2) Chạy backend

```powershell
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
node src/index.js
```

API health check:

```text
http://localhost:5000/api/health
```

### 3) Chạy frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend chạy ở:

```text
http://localhost:5173
```

## Biến môi trường

### backend/.env

```env
DATABASE_URL="postgresql://mediagram:mediagram123@localhost:5434/mediagram?schema=public"
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
CLIENT_URL=http://localhost:5173
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Script hữu ích

- `npm run setup`: cài dependencies, bật Docker, migrate và seed
- `npm run docker:up`: bật PostgreSQL + pgAdmin
- `npm run docker:down`: tắt Docker stack
- `npm run dev:api`: chạy backend
- `npm run dev:web`: chạy frontend
- `npm run db:setup`: migrate deploy + seed

## Tài khoản demo

Sau khi seed:

- `alice@example.com` / `password123`
- `bob@example.com` / `password123`
- `admin@mediagram.com` / `password123`

## Lưu ý nhanh

- Nếu vào `http://localhost:5050/browser/` mà cây bên trái trống, hãy thêm server PostgreSQL thủ công trong pgAdmin.
- Nếu muốn làm sạch database rồi seed lại, chạy `docker compose down -v` rồi bật lại Docker và chạy migrate/seed.
- File entry của backend là `backend/src/index.js`, không phải `backend/index.js`.
