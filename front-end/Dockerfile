FROM node:18-alpine AS base

# Step 1. Rebuild the source code only when needed
FROM base AS builder

WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
# Omit --production flag for TypeScript devDependencies
RUN \
    if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
    elif [ -f package-lock.json ]; then npm ci && npm i sharp; \
    elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i && pnpm add sharp; \
    # Allow install without lockfile, so example works even without Node.js installed locally
    else echo "Warning: Lockfile not found. It is recommended to commit lockfiles to version control." && yarn install && yarn add sharp; \
    fi

COPY . .
COPY public ./public
COPY next.config.js .


# Environment variables must be redefined at build time

ARG ENDPOINT_SERVER
ENV ENDPOINT_SERVER=${ENDPOINT_SERVER}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ARG LIMIT_RESULTS
ENV LIMIT_RESULTS=${LIMIT_RESULTS}
ARG JWT_ACCESSTOKEN_EXPIRED
ENV JWT_ACCESSTOKEN_EXPIRED=${JWT_ACCESSTOKEN_EXPIRED}
ARG JWT_REFRESHTOKEN_EXPIRED
ENV JWT_REFRESHTOKEN_EXPIRED=${JWT_REFRESHTOKEN_EXPIRED}
ARG MEMO_PREFIX_DEPOSIT
ENV MEMO_PREFIX_DEPOSIT=${MEMO_PREFIX_DEPOSIT}




# Next.js collects completely anonymous telemetry data about general usage. Learn more here: https://nextjs.org/telemetry
# Uncomment the following line to disable telemetry at build time
# ENV NEXT_TELEMETRY_DISABLED 1

# Build Next.js based on the preferred package manager
RUN \
    if [ -f yarn.lock ]; then yarn build; \
    elif [ -f package-lock.json ]; then npm run build; \
    elif [ -f pnpm-lock.yaml ]; then pnpm build; \
    else npm run build; \
    fi

# Note: It is not necessary to add an intermediate step that does a full copy of `node_modules` here

# Step 2. Production image, copy all the files and run next
FROM base AS runner

WORKDIR /app

# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static


# Environment variables must be redefined at run time

ARG ENDPOINT_SERVER
ENV ENDPOINT_SERVER=${ENDPOINT_SERVER}
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

ARG NEXTAUTH_SECRET
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ARG LIMIT_RESULTS
ENV LIMIT_RESULTS=${LIMIT_RESULTS}
ARG JWT_ACCESSTOKEN_EXPIRED
ENV JWT_ACCESSTOKEN_EXPIRED=${JWT_ACCESSTOKEN_EXPIRED}
ARG JWT_REFRESHTOKEN_EXPIRED
ENV JWT_REFRESHTOKEN_EXPIRED=${JWT_REFRESHTOKEN_EXPIRED}
ARG MEMO_PREFIX_DEPOSIT
ENV MEMO_PREFIX_DEPOSIT=${MEMO_PREFIX_DEPOSIT}

# Uncomment the following line to disable telemetry at run time
# ENV NEXT_TELEMETRY_DISABLED 1

EXPOSE 3002

ENV PORT 3002

CMD ["node", "server.js"]