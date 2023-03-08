FROM portainer/portainer-ce:2.17.0 as portainer
FROM node:18-alpine3.17

WORKDIR /
COPY --from=portainer . .

WORKDIR /proxy

RUN npm i express http-proxy-middleware
COPY app.js .

CMD ["node", "app.js"]
