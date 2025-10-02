FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY . .

RUN pnpm build

# Copy built output (client and server folders)
# COPY dist/client ./dist/client
# COPY dist/server ./dist/server

# # Copy public assets if needed
# COPY public ./public

# Expose the port Astro SSR runs on (default 4321)
EXPOSE 4321

# Start the SSR server
CMD ["node", "./dist/server/entry.mjs"]
