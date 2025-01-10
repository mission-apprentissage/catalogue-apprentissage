# BASE IMAGE
FROM node:20-alpine AS base

WORKDIR /app

RUN corepack enable &&\
  corepack prepare yarn@stable --activate && \
  yarn set version 4.5.0  && \
  yarn config set nodeLinker node-modules && \
  yarn config set defaultSemverRangePrefix '' && \
  yarn config set --home enableTelemetry 0 && \
  yarn config set compressionLevel mixed

# BUILDER
FROM base AS builder
ARG NPM_TOKEN
RUN if [ "$NPM_TOKEN" != "local" ] ; then \
  yarn config set npmScopes.mission-apprentissage.npmRegistryServer https://npm.pkg.github.com && \
  yarn config set npmScopes.mission-apprentissage.npmPublishRegistry https://npm.pkg.github.com && \
  yarn config set npmScopes.mission-apprentissage.npmAlwaysAuth true && \
  yarn config set npmScopes.mission-apprentissage.npmAuthToken $NPM_TOKEN; \
  else \
  echo "No NPM_TOKEN prodived, exiting." && exit 1; \
  fi

COPY package.json yarn.lock  ./
RUN yarn install --immutable

# RUNNER
FROM base AS runner
COPY ./  ./
COPY --from=builder /app/node_modules ./node_modules

VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
