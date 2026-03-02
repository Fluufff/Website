FROM mcr.microsoft.com/vscode/devcontainers/typescript-node:16

ENV DENO_INSTALL=/deno
RUN mkdir /dino && \
    curl -fsSL https://deno.land/x/install/install.sh | sh

ENV PATH=/deno/bin:${PATH}
