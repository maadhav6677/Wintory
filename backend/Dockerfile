# ==========================================
# STAGE 1: Build base & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
# Retry flags guard against transient ECONNRESET network drops inside Docker
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=10000 --fetch-retry-maxtimeout=60000

# Copy rest of the application files
COPY tsconfig.json ./
COPY src ./src

# Generate Prisma Client & Compile TypeScript to dist/
RUN npx prisma generate
RUN npm run build

# Prune development dependencies to keep image lean
RUN npm prune --omit=dev

# ==========================================
# STAGE 2: Lightweight Production Runtime
# ==========================================
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

ENV NODE_ENV=production

# Required by Prisma's query engine binary at runtime
RUN apk add --no-cache openssl
# Copy built app files and node_modules from builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Copy entrypoint script
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Add a non-root system user for security
RUN addgroup -g 1001 -S nodejs \
    && adduser -S appuser -u 1001 -G nodejs \
    && chown -R appuser:nodejs /usr/src/app

USER appuser

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
