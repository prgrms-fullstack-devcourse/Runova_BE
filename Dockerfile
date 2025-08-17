# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== runtime =====
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Seoul
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

RUN npm prune --omit=dev
RUN addgroup -g 1001 nodegrp && adduser -D -G nodegrp -u 1001 node
USER 1001

EXPOSE 3000
# 컨테이너 시작 시: 마이그레이션 → 앱 기동
CMD ["sh", "-lc", "npm run start:prod"]
