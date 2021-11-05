FROM node:12-alpine

LABEL mantainer="Claudio Bogossian <claudio.bogossian@gmail.com>"

WORKDIR /app

COPY ./*.json /app/
COPY ./index.js /app/
COPY src/ /app/src/
COPY assets/ /app/assets/
ENV NPM_CONFIG_LOGLEVEL warn
RUN npm install  -g yarn --force \
&& yarn install --production \
&& npm install pm2 -g \
&& pm2 install pm2-server-monit \
&& pm2 install pm2-logrotate

# add curl for use in swarm health test
RUN apk --no-cache add curl

ENV PORT 9000
EXPOSE 9000
ENV FILES_PATH /data/oauth-api
VOLUME ["${FILES_PATH}","/logs"]

CMD ["pm2-runtime", "--env", "production", "start", "pm2.json"]
