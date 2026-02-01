# Stage 1: Install dependencies (cache optimized)
FROM node:20-alpine AS deps
# Install build tools for native dependencies (required for usb)
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Development environment
FROM deps AS development
WORKDIR /app
COPY . .
CMD ["npm", "run", "dev"]

# Stage 3: Install production dependencies only
FROM node:20-alpine AS prod-deps
# Install build tools for native dependencies
RUN apk add --no-cache python3 make g++ linux-headers eudev-dev
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
COPY package.json package-lock.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Accept API URL build argument
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build-env /app/build ./build
COPY package.json ./

EXPOSE 3000
CMD ["npm", "run", "start"]