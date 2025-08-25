# ============ deps stage ============
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ============ build stage ============
FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .                      
RUN npm run build            

# ============ runtime stage ============
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist   
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["sh", "-lc", "\
  node -v && \
  if [ -f dist/config/typeorm/data-source.js ]; then \
    node node_modules/typeorm/cli.js -d dist/config/typeorm/data-source.js migration:run; \
  fi && \
  node dist/main.js"]