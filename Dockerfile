# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
ENV NODE_ENV=development
# 빌드 캐시 최적화: lockfile 기반 설치
COPY package*.json ./
RUN npm ci

# ===== build =====
FROM node:20-alpine AS build
WORKDIR /app
# Prisma가 alpine에서 동작하도록 openssl 설치 (Prisma 엔진이 OpenSSL 1.1/3 필요)
RUN apk add --no-cache openssl
COPY --from=deps /app/node_modules ./node_modules
# 소스 및 Prisma 스키마 복사
COPY . .
# Prisma Client 생성(빌드 단계에서 확정)
RUN npx prisma generate
# NestJS 등 빌드(프로젝트 스크립트 기준)
RUN npm run build

# ===== runtime =====
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production \
    TZ=Asia/Seoul

# 런타임에 필요한 것만 복사
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma

# devDependencies 제거
RUN npm prune --omit=dev

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -q -T 2 -O- http://localhost:3000/healthz || exit 1

# 비루트 실행
RUN addgroup -g 1001 nodegrp && adduser -D -G nodegrp -u 1001 node
USER 1001

EXPOSE 3000
CMD ["node", "dist/main.js"]
