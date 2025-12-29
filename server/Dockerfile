# BASE IMAGE
FROM node:22-alpine AS base

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

COPY package.json yarn.lock  ./
RUN yarn install --immutable

# RUNNER
FROM base AS runner
COPY ./  ./
COPY --from=builder /app/node_modules ./node_modules

VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
