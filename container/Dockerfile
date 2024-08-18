FROM node:18-alpine AS base


RUN apk update && apk upgrade


RUN apk add --no-cache ffmpeg


WORKDIR /app


COPY package.json .
COPY package-lock.json .


RUN npm install


COPY index.js .
COPY .env .   


CMD ["npm", "start"]
