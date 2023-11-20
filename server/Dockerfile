FROM node:18-alpine as base

# STAGE 1 : BUILDER
FROM base as builder

# handle .yarnrc.yml : copy local one for dev, create one using NPM_TOKEN arg for production & recette
ARG NPM_TOKEN
COPY .yarnrc.yml* /app/
RUN if [ "$NPM_TOKEN" != "local" ] ; then \
    echo -e "yarnPath: .yarn/releases/yarn-3.3.1.cjs\n\
nodeLinker: node-modules\n\
defaultSemverRangePrefix: ''\n\
\n\
npmScopes:\n\
  mission-apprentissage:\n\
    npmRegistryServer: https://npm.pkg.github.com\n\
    npmPublishRegistry: https://npm.pkg.github.com\n\
    npmAlwaysAuth: true\n\
    npmAuthToken: $NPM_TOKEN\n\
" > /app/.yarnrc.yml ; \
fi

#Install and cache node_modules
COPY package.json yarn.lock  /app/
COPY .yarn/ /app/.yarn/
RUN cd /app && \
    yarn install --immutable && \
    rm -f .yarnrc.yml

# STAGE 2 : RUNNER
FROM base as runner

WORKDIR /app
VOLUME /data
EXPOSE 5000

# Add .yarnrc.yml without secret
RUN echo -e "yarnPath: .yarn/releases/yarn-3.3.1.cjs\n\
nodeLinker: node-modules\n\
defaultSemverRangePrefix: ''\n\
" > /app/.yarnrc.yml ;

COPY ./  ./
COPY --from=builder /app/node_modules ./node_modules

CMD ["yarn", "start"]
