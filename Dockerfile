# Imagen única para Railway: frontend (Vite) + API (Express) detrás de nginx.
# Un solo dominio: el navegador llama a /api en el mismo origen → las cookies
# (httpOnly + bandera session_present) funcionan sin problemas de third-party.

FROM node:22-alpine AS base
RUN corepack enable

# ── Frontend ──────────────────────────────────────────────────────────
FROM base AS client-build
WORKDIR /client
COPY client/package.json client/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY client/ ./
# Mismo origen: el frontend llama a /api del propio dominio
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN pnpm build

# ── Backend ───────────────────────────────────────────────────────────
FROM base AS server-build
WORKDIR /server
COPY server/package.json server/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY server/ ./
RUN pnpm run typecheck && pnpm run build:docker

# ── Runtime: nginx (estáticos + proxy) + node (API) ───────────────────
FROM node:22-alpine AS runtime
RUN corepack enable && apk add --no-cache nginx supervisor gettext

# Alpine usa /etc/nginx/http.d/ y trae un default en el puerto 80 que chocaría
RUN rm -f /etc/nginx/http.d/default.conf

ENV NODE_ENV=production

WORKDIR /app
COPY server/package.json server/pnpm-lock.yaml* ./
# --ignore-scripts: en producción no hacen falta (evita el script `prepare` de husky,
# que es una devDependency ausente en --prod)
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

# Artefacto compilado del backend (dist/index.js + swagger.json + _moduleAliases)
COPY --from=server-build /server/dist ./dist

# Estáticos del frontend
COPY --from=client-build /client/dist /usr/share/nginx/html

# nginx + supervisor + entrypoint (envsubst del puerto público de Railway)
COPY deploy/nginx.conf.template /etc/nginx/nginx.conf.template
COPY deploy/supervisord.conf /etc/supervisord.conf
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8080

ENTRYPOINT ["/entrypoint.sh"]
