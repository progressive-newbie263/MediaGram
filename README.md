# MediaGram

MediaGram là mạng xã hội full-stack với feed bài viết, like, comment, follow, chat realtime, thông báo và profile cá nhân.

## Tính năng

- Auth: đăng ký, đăng nhập, JWT access/refresh
- Feed: bài viết text + ảnh, infinite scroll
- Social: like, comment lồng nhau, follow/unfollow
- Chat: realtime, online/offline, typing, read receipts
- Profile: avatar, cover, bio, display name
- Explore: tìm user/bài viết, hashtag trending
- Notifications: realtime badge + danh sách thông báo

## Chạy local nhanh

```powershell
docker compose up -d
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
node src/index.js
cd ..\frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend health: `http://localhost:5000/api/health`
- PostgreSQL: `localhost:5434`
- pgAdmin: `http://localhost:5050`

## PostgreSQL / pgAdmin

- DB name: `mediagram`
- User: `mediagram`
- Password: `mediagram123`
- Trong pgAdmin, connect đến host `mediagram-db` với port `5432`
- Nếu connect từ máy host thì dùng `localhost:5434`

## Env

### backend/.env

```env
PORT=5000
NODE_ENV=development
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
CLIENT_URL=http://localhost:5173
```


## Scripts

- `npm run setup`: install + Docker + migrate + seed
- `npm run docker:up`: bật database và pgAdmin
- `npm run docker:down`: tắt Docker stack
- `npm run dev:api`: chạy backend
- `npm run dev:web`: chạy frontend

