# Builds any one of the apps in this Nest monorepo, chosen via --build-arg APP_NAME=<api-gateway|authentications|rider|logging>
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG APP_NAME
RUN if [ "$APP_NAME" = "authentications" ]; then \
      npx prisma generate --schema apps/authentications/prisma/schema.prisma; \
    fi
RUN npx nest build "$APP_NAME"

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

ARG APP_NAME
ENV APP_NAME=$APP_NAME
COPY --from=builder /app/dist/apps/$APP_NAME ./dist/apps/$APP_NAME

CMD ["sh", "-c", "node dist/apps/$APP_NAME/main.js"]
