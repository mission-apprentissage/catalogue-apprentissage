## BASE IMAGE
FROM node:18-alpine as base

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
COPY .yarn  ./.yarn
COPY package.json yarn.lock*  ./
RUN echo -e "yarnPath: .yarn/releases/yarn-3.3.1.cjs\n\
nodeLinker: node-modules\n\
defaultSemverRangePrefix: ''\n\
" > /app/.yarnrc.yml ;

## DEPS
FROM base as deps
RUN yarn install --immutable

## BUILD
FROM base as builder
COPY --from=deps /app/node_modules/  ./node_modules/
COPY .  ./
RUN yarn build

## RUN
FROM base as runner

COPY --from=builder /app/build  ./build/
EXPOSE 3000
CMD yarn serve
