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

FROM node:22-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Apply latest security patches to reduce known OS-level vulnerabilities
RUN apt-get update \
    && apt-get upgrade -y \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

ARG APP_NAME
ENV APP_NAME=$APP_NAME
COPY --from=builder /app/dist/apps/$APP_NAME ./dist/apps/$APP_NAME

# Run as non-root user for better container security
USER node

CMD ["sh", "-c", "node dist/apps/$APP_NAME/main.js"]
