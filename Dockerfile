FROM dhi.io/deno:2.7.11-dev AS builder

ARG SITE=https://www.next.fluufff.org
ARG SITE_BASE_URL=/
ARG NODE_ENV=development

WORKDIR /app
COPY . .
RUN deno install --allow-scripts
RUN deno task build


FROM nginx:1.29.4

COPY --from=builder /app/dist /usr/share/nginx/html
