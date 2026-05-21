MediaGram — Full-Stack Social Media App
Overview
MediaGram là mạng xã hội đầy đủ chức năng lấy cảm hứng từ Facebook & Twitter, bao gồm auth, profile, posts, real-time chat, notifications, và image upload qua Cloudinary.

Tech Stack Decisions
Layer	Technology	Lý do chọn
Frontend	React 18 + Vite	Nhanh, hot-reload tốt, deploy Vercel dễ
UI Framework	TailwindCSS v3	Flexible, utility-first, dark mode built-in
State Management	Zustand	Nhẹ hơn Redux, dễ dùng
Routing	React Router v6	Standard cho React
HTTP Client	Axios	Interceptors cho JWT refresh
WebSocket	Socket.io-client	Pair với server
Backend	Node.js + Express.js	User yêu cầu
Real-time	Socket.io	Real-time chat & notifications
Database	PostgreSQL 15 (Docker)	User yêu cầu
ORM	Prisma	Type-safe, migration dễ, tốt với PostgreSQL
Auth	JWT (access + refresh tokens)	Stateless, scalable
File Upload	Cloudinary	User đề xuất
Container	Docker + Docker Compose	User yêu cầu
Backend Deploy	Railway.app	Free tier, support Node.js + PostgreSQL, dễ hơn Supabase cho Express
Frontend Deploy	Vercel	User yêu cầu
Project Structure
MediaGram/
├── docker-compose.yml          # PostgreSQL + pgAdmin4
├── .env.example
├── README.md                   # Hướng dẫn chạy
│
├── backend/
│   ├── Dockerfile
│   ├── package.json
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── src/
│       ├── index.js            # Entry point + Socket.io
│       ├── config/
│       │   ├── db.js           # Prisma client
│       │   └── cloudinary.js
│       ├── middlewares/
│       │   ├── auth.js         # JWT verify
│       │   └── upload.js       # Multer + Cloudinary
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── user.routes.js
│       │   ├── post.routes.js
│       │   ├── comment.routes.js
│       │   ├── like.routes.js
│       │   ├── follow.routes.js
│       │   ├── message.routes.js
│       │   ├── notification.routes.js
│       │   └── search.routes.js
│       ├── controllers/        # (mirror of routes)
│       ├── services/           # Business logic
│       └── utils/
│           ├── jwt.js
│           └── helpers.js
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css           # Tailwind + custom CSS vars
        ├── assets/
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx
        │   │   ├── RightPanel.jsx
        │   │   └── Navbar.jsx
        │   ├── post/
        │   │   ├── PostCard.jsx
        │   │   ├── CreatePost.jsx
        │   │   └── PostActions.jsx
        │   ├── chat/
        │   │   ├── ChatSidebar.jsx
        │   │   ├── ChatWindow.jsx
        │   │   └── MessageBubble.jsx
        │   ├── profile/
        │   │   └── ProfileHeader.jsx
        │   ├── common/
        │   │   ├── Avatar.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Toast.jsx
        │   │   └── LoadingSpinner.jsx
        │   └── notification/
        │       └── NotificationItem.jsx
        ├── pages/
        │   ├── AuthPage.jsx    # Login + Register
        │   ├── HomePage.jsx    # Feed
        │   ├── ProfilePage.jsx
        │   ├── ExplorePage.jsx # Trending / Search
        │   ├── ChatPage.jsx
        │   └── NotificationsPage.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useSocket.js
        │   └── useInfiniteScroll.js
        ├── store/              # Zustand stores
        │   ├── authStore.js
        │   ├── postStore.js
        │   └── chatStore.js
        ├── services/           # Axios API calls
        │   ├── api.js          # Base axios instance
        │   ├── auth.service.js
        │   ├── post.service.js
        │   ├── user.service.js
        │   └── message.service.js
        └── utils/
            ├── timeFormat.js
            └── constants.js
Database Schema (Prisma)
Users           — id, username, email, password, bio, avatar, coverImage, createdAt
Posts           — id, content, images[], userId, createdAt, updatedAt
Comments        — id, content, userId, postId, parentId (nested)
Likes           — id, userId, postId
Follows         — followerId, followingId
Messages        — id, content, senderId, receiverId, conversationId, createdAt, read
Conversations   — id, participants[]
Notifications   — id, type, userId, actorId, postId, read, createdAt
RefreshTokens   — id, token, userId, expiresAt
Features Breakdown
Authentication
 Đăng ký (username, email, password, avatar)
 Đăng nhập (JWT access + refresh token)
 Auto refresh token
 Logout (revoke refresh token)
 Protected routes
Profile
 Xem profile của user
 Chỉnh sửa bio, display name
 Upload avatar và cover image (Cloudinary)
 Danh sách followers/following
 Grid posts của user
Feed & Posts
 Tạo post (text + multiple images)
 Feed chính (posts từ following + own)
 Infinite scroll
 Like/Unlike post
 Comment (nested replies)
 Delete post (own)
 Share/Repost
Explore
 Trending hashtags
 Search users & posts
 Suggested users to follow
Real-time Chat
 Danh sách conversations
 Gửi/nhận tin nhắn real-time (Socket.io)
 Online/Offline status
 Typing indicator
 Read receipts
Notifications
 Real-time notifications (like, comment, follow, mention)
 Notification badge
 Mark as read
Docker Setup
yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    container_name: mediagram-db
    environment:
      POSTGRES_USER: mediagram
      POSTGRES_PASSWORD: mediagram123
      POSTGRES_DB: mediagram
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - docker_postgre   # group "docker postgre" theo yêu cầu
  pgadmin:
    image: dpage/pgadmin4
    container_name: mediagram-pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@mediagram.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    networks:
      - docker_postgre
networks:
  docker_postgre:
    driver: bridge
volumes:
  postgres_data:
Deployment Strategy
Backend → Railway.app
Push backend/ lên Railway
Auto-detect Node.js, set env vars
PostgreSQL add-on của Railway cho production
URL: https://mediagram-api.railway.app
Frontend → Vercel
Connect GitHub repo, set frontend/ as root
Set VITE_API_URL env var
URL: https://mediagram.vercel.app
UI Design Direction
Color palette: Dark mode-first, với gradient tím-xanh (instagram-like accent)
Typography: Google Font "Inter"
Layout: 3-column (sidebar nav | feed | right panel) như Twitter/Facebook
Components: Card-based posts, glassmorphism modals
Animations: Framer Motion cho page transitions, micro-animations
Build Order (Execution Plan)
Docker Compose + PostgreSQL setup
Backend: Express + Prisma setup + Auth routes
Backend: All CRUD routes (posts, users, comments, likes, follows)
Backend: Socket.io real-time (chat + notifications)
Backend: Cloudinary upload middleware
Frontend: Vite + TailwindCSS + Zustand setup
Frontend: Auth pages (Login/Register)
Frontend: Layout + Routing
Frontend: Feed + Post components
Frontend: Profile page
Frontend: Chat page (Socket.io client)
Frontend: Explore/Search page
Frontend: Notifications
README.md với hướng dẫn đầy đủ
