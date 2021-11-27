FROM node:16.8.0 as build-phase
WORKDIR /usr/src/app
COPY ./package*.json /usr/src/app/
RUN npm ci
COPY . /usr/src/app/
RUN npm run build:client
RUN npm run build:server

FROM node:16.8.0-alpine3.14
WORKDIR /usr/src/app
COPY ./package* /usr/src/app/
ENV PORT=8080
ENV NODE_ENV=production
RUN npm ci --ignore-scripts
COPY --from=build-phase /usr/src/app/build/server build/server
COPY --from=build-phase /usr/src/app/src/client/dist build/server/public
CMD ["npm", "run", "production:server"]
