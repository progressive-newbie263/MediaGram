FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
COPY src ./src/
EXPOSE 5000
CMD ["sh", "-c", "npx prisma generate && npx prisma migrate deploy && node src/index.js"]
