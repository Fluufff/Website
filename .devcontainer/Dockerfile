# https://github.com/devcontainers/images/tree/main/src/typescript-node
FROM mcr.microsoft.com/devcontainers/typescript-node:24

ENV DENO_INSTALL=/deno
RUN mkdir /dino && \
    curl -fsSL https://deno.land/x/install/install.sh | sh

RUN git config --global --add safe.directory /mnt

ENV PATH=/deno/bin:${PATH}
