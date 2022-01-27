FROM node:16-alpine as builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY tsconfig.json tsoa.json ./
COPY src src
RUN npm run build

FROM node:16-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY --from=builder /usr/src/app/build build/
COPY --from=builder /usr/src/app/public public/
EXPOSE 3000
CMD [ "node", "./build/index.js" ]