# ---- build stage: install everything, build the SPA ----
FROM node:20-slim AS build
WORKDIR /app
COPY package*.json ./
# npm install (not ci) so a committed lockfile is optional
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build:web

# ---- runtime stage: prod deps + server + built SPA ----
FROM node:20-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
ENV DATA_DIR=/data
ENV UPLOAD_DIR=/data/uploads

COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY server ./server
COPY shared ./shared
COPY tsconfig.json ./

EXPOSE 3001

# Rebuild the curated catalogue on every boot (idempotent; keeps votes & photos),
# then start the API which also serves dist/.
CMD ["sh", "-c", "npm run seed && npm start"]
