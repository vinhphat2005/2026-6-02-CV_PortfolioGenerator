FROM node:22-bookworm AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
RUN npx playwright install --with-deps chromium

FROM node:22-bookworm AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:22-bookworm AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=deps /root/.cache/ms-playwright /root/.cache/ms-playwright
EXPOSE 3000
CMD ["npm", "run", "start"]
