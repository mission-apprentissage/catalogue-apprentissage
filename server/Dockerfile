FROM node:16-alpine

# handle .npmrc : copy local one for dev, create one using NPM_TOKEN arg for production & recette
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
    mkdir -p /app && \
    mv /tmp/node_modules /app/ && \
    rm -f .yarnrc.yml

COPY ./ /app
WORKDIR /app

VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
