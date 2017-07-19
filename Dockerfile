FROM node:slim

MAINTAINER Charlie Lee <charlie0275@gmail.com>

COPY ./chat /data
WORKDIR /data/chat

RUN npm install

EXPOSE 3000

CMD [ "npm", "start" ]
