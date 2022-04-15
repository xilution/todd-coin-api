# syntax=docker/dockerfile:1
FROM node:16.14.2-alpine

ARG NPM_TOKEN

RUN echo //registry.npmjs.org/:_authToken=${NPM_TOKEN} > ~/.npmrc

WORKDIR /build

COPY . .

RUN npm ci
RUN npm run verify
RUN npm run build
RUN rm -rf node_modules
RUN npm ci --production --ignore-scripts

FROM node:16.14.2-alpine

WORKDIR /app

COPY --from=0 /build /app

CMD ["node", "dist/index.js"]

EXPOSE 3000