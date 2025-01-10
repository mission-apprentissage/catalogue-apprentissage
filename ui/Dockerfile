## BASE IMAGE
FROM node:20-alpine AS base

ARG REACT_APP_ENV
ARG REACT_APP_BASE_URL
ARG REACT_APP_ENDPOINT_LBA
ARG REACT_APP_METABASE_URL
ARG REACT_APP_METABASE_SECRET_KEY

ENV REACT_APP_ENV=$REACT_APP_ENV
ENV REACT_APP_BASE_URL=$REACT_APP_BASE_URL
ENV REACT_APP_ENDPOINT_LBA=$REACT_APP_ENDPOINT_LBA
ENV REACT_APP_METABASE_URL=$REACT_APP_METABASE_URL
ENV REACT_APP_METABASE_SECRET_KEY=$REACT_APP_METABASE_SECRET_KEY

WORKDIR /app
RUN corepack enable &&\
  corepack prepare yarn@stable --activate && \
  yarn set version 4.5.0 && \
  yarn config set nodeLinker node-modules && \
  yarn config set defaultSemverRangePrefix '' && \
  yarn config set --home enableTelemetry 0 && \
  yarn config set compressionLevel mixed

COPY package.json yarn.lock*  ./

## DEPS
FROM base AS deps
RUN yarn install --immutable

## BUILD
FROM base AS builder
COPY --from=deps /app/node_modules/  ./node_modules/
COPY .  ./
RUN yarn build

## RUN
FROM base AS runner
COPY --from=deps /app/node_modules/  ./node_modules/
COPY --from=builder /app/build  ./build/
EXPOSE 3000
CMD yarn serve
