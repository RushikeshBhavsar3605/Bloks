# Use lightweight Node.js image
FROM node:20-alpine

# Install openssl (and optional utilities)
RUN apk add --no-cache openssl

# Set working directory
WORKDIR /app

# Copy only package files first for better caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy rest of the app
COPY . .

# Expose port (Next.js default dev port)
EXPOSE 3000

# Start in dev mode (can override in compose)
CMD ["sh", "-c", "npx prisma generate && npx prisma db push && npm run dev"]
