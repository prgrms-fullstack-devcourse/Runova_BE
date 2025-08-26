# ===== deps =====
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
# TypeORM CLI(ts-node 등)가 devDependencies에 있는 경우가 많으므로 심플 모드로 전부 설치
RUN npm ci

# ===== build =====
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# TS → JS 빌드 (예: "build": "tsc")
RUN npm run build

# ===== runtime =====
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Seoul

# 런타임에 필요한 것들 복사
COPY package*.json ./
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# (선택) 마이그레이션 파일이 dist 안으로 컴파일되어 들어가지 않는 구조라면 원본도 같이 복사
# COPY src/migrations ./src/migrations

EXPOSE 3000

# 컨테이너 시작 시: 마이그레이션 → 앱 기동
# (data-source 경로는 프로젝트에 맞게 수정. 아래는 예시)
CMD ["sh", "-lc", "node -v && npx typeorm migration:run -d dist/config/typeorm/data-source.js && node dist/main.js"]
