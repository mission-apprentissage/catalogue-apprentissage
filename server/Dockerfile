# STAGE 1 : BUILDER
FROM node:16-alpine as builder

# handle .yarnrc.yml : copy local one for dev, create one using NPM_TOKEN arg for production & recette
ARG NPM_TOKEN
COPY .yarnrc.yml* /tmp/
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
" > /tmp/.yarnrc.yml ; \
fi

#Install and cache node_modules
COPY package.json yarn.lock /tmp/
COPY .yarn/ /tmp/.yarn/
RUN cd /tmp && \
    yarn install --immutable && \
    rm -f .yarnrc.yml

# STAGE 2 : RUNNER
FROM node:16-alpine as runner

WORKDIR /app
VOLUME /data
EXPOSE 5000

# Add .yarnrc.yml without secret
RUN echo -e "yarnPath: .yarn/releases/yarn-3.3.1.cjs\n\
nodeLinker: node-modules\n\
defaultSemverRangePrefix: ''\n\
" > /app/.yarnrc.yml ;

COPY ./ /app
COPY --from=builder /tmp/node_modules /app/node_modules

CMD ["yarn", "start"]
