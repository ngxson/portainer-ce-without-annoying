FROM portainer/portainer-ce:latest as portainer
FROM node:18-alpine3.17

WORKDIR /
COPY --from=portainer . .

WORKDIR /proxy

RUN npm i express http-proxy-middleware
COPY app.js .

COPY docker-entrypoint.sh /

ENTRYPOINT [ "/docker-entrypoint.sh" ]

