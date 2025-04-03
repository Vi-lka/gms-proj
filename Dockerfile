FROM node:22.11.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 g++ make
RUN apk update
WORKDIR /app

# Enable Corepack and set up pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./

# Install dependencies with pnpm
RUN pnpm i --frozen-lockfile

RUN pnpm i --config.arch=x64 --config.platform=linux --config.libc=musl sharp@0.33.3


# Step 2. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Enable Corepack and set up pnpm
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

COPY src ./src
COPY public ./public
COPY next.config.js .
# COPY sentry.client.config.ts .
COPY sentry.server.config.ts .
COPY sentry.edge.config.ts .
COPY tsconfig.json .
COPY tailwind.config.ts postcss.config.js ./

# Environment variables must be present at build time
# https://github.com/vercel/next.js/discussions/14030
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG IS_VERCEL
ENV IS_VERCEL=${IS_VERCEL}

ARG AUTH_SECRET
ENV AUTH_SECRET=${AUTH_SECRET}
ARG AUTH_URL
ENV AUTH_URL=${AUTH_URL}
# ARG AUTH_REDIRECT_PROXY_URL
# ENV AUTH_REDIRECT_PROXY_URL=${AUTH_REDIRECT_PROXY_URL}

ARG AUTH_YANDEX_ID
ENV AUTH_YANDEX_ID=${AUTH_YANDEX_ID}
ARG AUTH_YANDEX_SECRET
ENV AUTH_YANDEX_SECRET=${AUTH_YANDEX_SECRET}

ARG AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
ARG AUTH_GOOGLE_SECRET
ENV AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}

ARG DB_HOST
ENV DB_HOST=${DB_HOST}
ARG DB_USER
ENV DB_USER=${DB_USER}
ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD}
ARG DB_NAME
ENV DB_NAME=${DB_NAME}
ARG DB_PORT
ENV DB_PORT=${DB_PORT}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG CONTROL_KEY
ENV CONTROL_KEY=${CONTROL_KEY}
ARG CRON_SECRET
ENV CRON_SECRET=${CRON_SECRET}

ARG S3_ENDPOINT
ENV S3_ENDPOINT=${S3_ENDPOINT}
ARG S3_PORT
ENV S3_PORT=${S3_PORT}
ARG S3_ACCESS_KEY
ENV S3_ACCESS_KEY=${S3_ACCESS_KEY}
ARG S3_SECRET_KEY
ENV S3_SECRET_KEY=${S3_SECRET_KEY}
ARG S3_BUCKET_NAME
ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
ARG S3_USE_SSL
ENV S3_USE_SSL=${S3_USE_SSL}

ARG SENTRY_URL
ENV SENTRY_URL=${SENTRY_URL}
ARG SENTRY_DSN
ENV SENTRY_DSN=${SENTRY_DSN}
ARG SENTRY_ORG
ENV SENTRY_ORG=${SENTRY_ORG}
ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=${SENTRY_PROJECT}

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ARG NEXT_PUBLIC_S3_PATH
ENV NEXT_PUBLIC_S3_PATH=${NEXT_PUBLIC_S3_PATH}
ARG NEXT_PUBLIC_IS_VERCEL
ENV NEXT_PUBLIC_IS_VERCEL=${NEXT_PUBLIC_IS_VERCEL}

# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
ENV NEXT_TELEMETRY_DISABLED 1
# Build Next.js based on the preferred package manager
RUN pnpm build

COPY . .

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

ENV NODE_ENV production
# Disable NextJS telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED 1

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Enable Corepack and set up pnpm (for runtime scripts if needed)
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY --from=builder /app/next.config.js .
# COPY --from=builder /app/sentry.client.config.ts .
COPY --from=builder /app/sentry.server.config.ts .
COPY --from=builder /app/sentry.edge.config.ts .
COPY --from=builder /app/package.json .

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/.next/cache ./.next/cache
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Environment variables must be redefined at run time
ARG NODE_ENV
ENV NODE_ENV=${NODE_ENV}

ARG IS_VERCEL
ENV IS_VERCEL=${IS_VERCEL}

ARG AUTH_SECRET
ENV AUTH_SECRET=${AUTH_SECRET}
ARG AUTH_URL
ENV AUTH_URL=${AUTH_URL}
# ARG AUTH_REDIRECT_PROXY_URL
# ENV AUTH_REDIRECT_PROXY_URL=${AUTH_REDIRECT_PROXY_URL}

ARG AUTH_YANDEX_ID
ENV AUTH_YANDEX_ID=${AUTH_YANDEX_ID}
ARG AUTH_YANDEX_SECRET
ENV AUTH_YANDEX_SECRET=${AUTH_YANDEX_SECRET}

ARG AUTH_GOOGLE_ID
ENV AUTH_GOOGLE_ID=${AUTH_GOOGLE_ID}
ARG AUTH_GOOGLE_SECRET
ENV AUTH_GOOGLE_SECRET=${AUTH_GOOGLE_SECRET}

ARG DB_HOST
ENV DB_HOST=${DB_HOST}
ARG DB_USER
ENV DB_USER=${DB_USER}
ARG DB_PASSWORD
ENV DB_PASSWORD=${DB_PASSWORD}
ARG DB_NAME
ENV DB_NAME=${DB_NAME}
ARG DB_PORT
ENV DB_PORT=${DB_PORT}

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG CONTROL_KEY
ENV CONTROL_KEY=${CONTROL_KEY}
ARG CRON_SECRET
ENV CRON_SECRET=${CRON_SECRET}

ARG S3_ENDPOINT
ENV S3_ENDPOINT=${S3_ENDPOINT}
ARG S3_PORT
ENV S3_PORT=${S3_PORT}
ARG S3_ACCESS_KEY
ENV S3_ACCESS_KEY=${S3_ACCESS_KEY}
ARG S3_SECRET_KEY
ENV S3_SECRET_KEY=${S3_SECRET_KEY}
ARG S3_BUCKET_NAME
ENV S3_BUCKET_NAME=${S3_BUCKET_NAME}
ARG S3_USE_SSL
ENV S3_USE_SSL=${S3_USE_SSL}

ARG SENTRY_URL
ENV SENTRY_URL=${SENTRY_URL}
ARG SENTRY_DSN
ENV SENTRY_DSN=${SENTRY_DSN}
ARG SENTRY_ORG
ENV SENTRY_ORG=${SENTRY_ORG}
ARG SENTRY_PROJECT
ENV SENTRY_PROJECT=${SENTRY_PROJECT}

ARG NEXT_PUBLIC_URL
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}
ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=${NEXT_PUBLIC_SENTRY_DSN}
ARG NEXT_PUBLIC_S3_PATH
ENV NEXT_PUBLIC_S3_PATH=${NEXT_PUBLIC_S3_PATH}
ARG NEXT_PUBLIC_IS_VERCEL
ENV NEXT_PUBLIC_IS_VERCEL=${NEXT_PUBLIC_IS_VERCEL}

RUN chown -R nextjs ./.next/cache
USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]