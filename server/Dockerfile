FROM node:14.15.1-stretch


# handle .npmrc : copy local one for dev, create one using NPM_TOKEN arg for production & recette
ARG NPM_TOKEN
COPY .npmrc* /tmp/
RUN if [ "$NPM_TOKEN" != "local" ] ; then \
    echo "//npm.pkg.github.com/:_authToken=$NPM_TOKEN\n@mission-apprentissage:registry=https://npm.pkg.github.com" > /tmp/.npmrc ; \
fi

#Install and cache node_modules
COPY package.json yarn.lock /tmp/
RUN cd /tmp && \
    yarn install --frozen-lockfile && \
    mkdir -p /app && \
    mv /tmp/node_modules /app/ && \
    rm -f .npmrc

COPY ./ /app
WORKDIR /app

VOLUME /data
EXPOSE 5000
CMD ["yarn", "start"]
