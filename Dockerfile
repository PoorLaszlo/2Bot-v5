FROM node:17-alpine3.15

WORKDIR /usr/src/app

COPY package*.json ./

RUN apk update && apk add git

RUN npm install

COPY . .

CMD [ "node", "index.js" ]