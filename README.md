# portainer-ce-without-annoying

This is a drop-in replacement for [portainer/portainer-ce](https://hub.docker.com/r/portainer/portainer-ce), without annoying UI elements.

`portainer-ce-without-annoying` is **NOT** a fork of `portainer-ce`. It is just an overlay script / proxy to inject styles / scripts, allow removing DOM elements.

## How to use

If you already have `portainer-ce` installation, just replace `portainer/portainer-ce:latest` with `ngxson/portainer-ce-without-annoying:latest`

Alternatively, you can use [this docker-compose.yml](https://github.com/ngxson/portainer-ce-without-annoying/blob/master/docker-compose.yml)
