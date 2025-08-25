# ===== deps =====
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

# ===== build =====
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ===== runtime =====
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
RUN apk add --no-cache curl

COPY --from=deps  /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY package*.json ./

EXPOSE 3000

CMD ["sh", "-lc", "\
  node -v && \
  if [ -f dist/src/config/typeorm/data-source.js ]; then \
    echo '[entrypoint] Running migrations...'; \
    node node_modules/typeorm/cli.js -d dist/src/config/typeorm/data-source.js migration:run; \
  else \
    echo '[WARN] data-source.js not found'; \
  fi && \
  node dist/src/main.js"]

