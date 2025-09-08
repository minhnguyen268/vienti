# base
FROM node:18.17.0 AS base

WORKDIR /app
# Copy package.json and package-lock.json
COPY package*.json ./

RUN npm install
# Copy source code
COPY . .

# for production

FROM node:18.17.0-alpine3.17

WORKDIR /app

# Copy node_modules from base image
COPY --from=base /app .
COPY . /app
RUN npm install

CMD npm start





