# Base stage
FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Development stage
FROM base AS dev
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM base AS production
WORKDIR /usr/src/app

# Create data directory for SQLite
RUN mkdir -p data && chown node:node data

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install only production dependencies
RUN npm install --omit=dev

# Copy build artifacts and generated prisma client
COPY --from=dev /usr/src/app/dist ./dist
COPY --from=dev /usr/src/app/node_modules/.prisma ./node_modules/.prisma
COPY --from=dev /usr/src/app/node_modules/@prisma/client ./node_modules/@prisma/client

# Set user to node
USER node

EXPOSE 3007

CMD ["node", "dist/src/main"]
