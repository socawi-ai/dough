FROM node:20-alpine

# Pull in patched Alpine OS packages (e.g. openssl) ahead of known CVEs
# that lag behind in the base image tag.
RUN apk update && apk upgrade --no-cache

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

COPY . .

# npm and corepack are only needed to install packages at build time; the
# app is started directly via `node server.js`, so drop them from the final
# image. This also removes CVEs in npm's own bundled dependencies (glob,
# minimatch, tar, etc.) that don't affect the app itself.
RUN rm -rf \
    /usr/local/lib/node_modules/npm \
    /usr/local/lib/node_modules/corepack \
    /usr/local/bin/npm \
    /usr/local/bin/npx \
    /usr/local/bin/corepack

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["node", "server.js"]
