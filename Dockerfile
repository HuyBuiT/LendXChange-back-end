FROM node:18-alpine
WORKDIR /workspace

COPY . .
COPY package.json ./

RUN yarn install
RUN yarn build

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait

CMD /wait && yarn start