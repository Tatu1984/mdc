# Multi-stage build for Next.js application
# Optimized for Node.js runtime with production-ready configurations

# ============================================
# Stage 1: Base Image
# ============================================
FROM node:18-alpine AS base

# Install dependencies required for Alpine Linux
RUN apk add --no-cache libc6-compat

WORKDIR /app

# ============================================
# Stage 2: Dependencies Installation
# ============================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install production and development dependencies
# Using npm ci for clean install with exact versions from lock file
RUN npm ci

# ============================================
# Stage 3: Build Application
# ============================================
FROM base AS builder

WORKDIR /app

# Copy installed dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application with standalone output
# This creates an optimized production build with minimal dependencies
RUN npm run build

# ============================================
# Stage 4: Production Runtime
# ============================================
FROM base AS runner

WORKDIR /app

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=80
ENV HOSTNAME=0.0.0.0

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy entrypoint script
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# Create .next directory with correct permissions
RUN mkdir -p .next && \
    chown -R nextjs:nodejs .next && \
    chown -R nextjs:nodejs ./public

# Copy standalone server and static files
# Standalone mode includes only necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose application port
EXPOSE 80

# Health check to ensure container is running properly
# Checks /api/health endpoint every 30 seconds
HEALTHCHECK --interval=30s \
            --timeout=3s \
            --start-period=10s \
            --retries=3 \
  CMD node -e "require('http').get('http://localhost:80/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

# Use entrypoint script to inject runtime environment
ENTRYPOINT ["./docker-entrypoint.sh"]
