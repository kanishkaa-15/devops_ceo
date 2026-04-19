# Base image
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend files
COPY . .

# Build the Next.js app
RUN npm run build

# Runner stage
FROM node:18-alpine AS runner

WORKDIR /app

# Copy only the necessary files from the builder
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose frontend port
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "run", "start"]
