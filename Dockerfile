FROM portainer/portainer-ce:latest as portainer
FROM node:22.23.1-alpine3.24

WORKDIR /
COPY --from=portainer . .

WORKDIR /proxy

RUN npm i express http-proxy-middleware
COPY app.js .

COPY docker-entrypoint.sh /

ENTRYPOINT [ "/docker-entrypoint.sh" ]

