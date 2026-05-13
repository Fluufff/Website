FROM dhi.io/deno:2.7.11-dev AS builder

ARG SITE=https://www.next.fluufff.org
ARG STRAPI_URI=https://cms.fluufff.org/api/
ARG SITE_BASE_URL=/

WORKDIR /app
COPY . .
RUN deno install --allow-scripts
RUN --mount=type=secret,id=STRAPI_TOKEN,env=STRAPI_TOKEN \
    deno task build


FROM nginx:1.29.4

RUN apt-get update && \
    apt-get install -y git

COPY --from=builder /app/dist /usr/share/nginx/html
