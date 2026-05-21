FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma/
COPY src ./src/
RUN npx prisma generate && npm prune --omit=dev
EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
