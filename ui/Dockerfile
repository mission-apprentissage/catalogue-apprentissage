FROM node:14.15.1-stretch

ARG REACT_APP_ENV
ARG REACT_APP_ENDPOINT_NEW_FRONT
ARG REACT_APP_ENDPOINT_TCO

ENV REACT_APP_ENV=$REACT_APP_ENV
ENV REACT_APP_ENDPOINT_NEW_FRONT=$REACT_APP_ENDPOINT_NEW_FRONT
ENV REACT_APP_ENDPOINT_TCO=$REACT_APP_ENDPOINT_TCO

#Install and cache node_modules
COPY package.json yarn.lock /tmp/
RUN cd /tmp && \
    yarn install --frozen-lockfile && \
    mkdir -p /app && \
    mv /tmp/node_modules /app/

WORKDIR /app
COPY ./ /app

RUN yarn build

EXPOSE 3000
CMD yarn serve
