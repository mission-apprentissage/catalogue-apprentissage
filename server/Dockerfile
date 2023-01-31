FROM node:16-alpine

# handle .npmrc : copy local one for dev, create one using NPM_TOKEN arg for production & recette
ARG NPM_TOKEN
COPY .yarnrc.yml* /tmp/
RUN if [ "$NPM_TOKEN" != "local" ] ; then \
    echo 'yarnPath: .yarn/releases/yarn-3.3.1.cjs\
nodeLinker: node-modules\
defaultSemverRangePrefix: ""\
\
npmScopes:\
  mission-apprentissage:\
    npmRegistryServer: "https://npm.pkg.github.com"\
    npmPublishRegistry: "https://npm.pkg.github.com"\
    npmAlwaysAuth: true\
    npmAuthToken: $NPM_TOKEN' > /tmp/.yarnrc.yml ; \
fi

#Install and cache node_modules
COPY package.json yarn.lock /tmp/
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
