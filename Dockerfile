# ===== base =====
FROM node:22-alpine AS base
WORKDIR /app

# ===== deps (build-time deps 포함) =====
FROM base AS deps
COPY package*.json ./
# npm 캐시 활용
RUN --mount=type=cache,target=/root/.npm npm ci

# ===== build =====
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nest 빌드 (tsconfig.outDir=dist 가정)
RUN npm run build

# ===== proddeps (런타임용 prod deps만) =====
FROM base AS proddeps
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev

# ===== runtime =====
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 런타임에 필요한 것만 복사
COPY --from=proddeps /app/node_modules ./node_modules
COPY --from=build    /app/dist         ./dist
COPY package*.json   ./

EXPOSE 3000

# 존재 확인 후 마이그레이션 → 앱 실행
CMD ["sh","-lc","\
  node -v && \
  if [ -f dist/config/typeorm/data-source.js ]; then \
    echo '[entrypoint] Running migrations...'; \
    node node_modules/typeorm/cli.js -d dist/config/typeorm/data-source.js migration:run; \
  else \
    echo '[entrypoint][WARN] dist/config/typeorm/data-source.js not found. Skipping migrations.'; \
  fi && \
  node dist/main.js \
"]
