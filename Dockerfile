# ===== deps =====
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
# TypeORM CLI(ts-node 등)가 devDependencies에 있는 경우가 많으므로 심플 모드로 전부 설치
RUN npm ci

# ===== build =====
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== runtime =====
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production TZ=Asia/Seoul

COPY package*.json ./
COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-lc", "node -v && npx typeorm migration:run -d dist/config/typeorm/data-source.js && node dist/main.js"]
