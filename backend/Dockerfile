# Inventory backend — deploy as its own Dokploy service
# Context: backend/
# Port: 5000 (or PORT env)

FROM node:20-alpine AS base

WORKDIR /app

# Native builds for some npm packages (optional but safer)
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# Runtime dirs (uploads volume-mount these in Dokploy if you need persistence)
RUN mkdir -p uploads tmp && chown -R node:node /app

ENV NODE_ENV=production
ENV PORT=5000

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:'+(process.env.PORT||5000)+'/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
