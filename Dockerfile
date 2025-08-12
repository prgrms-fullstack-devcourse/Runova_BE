FROM node:20-alpine AS build
WORKDIR /app

COPY . .
RUN npm install
RUN npm run build

#===================#

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist

RUN npm i -g pm2
COPY ecosystem.config.js ./

EXPOSE 3000
ENTRYPOINT ["pm2-runtime", "start", "ecosystem.config.js"]