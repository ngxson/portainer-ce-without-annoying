# portainer-ce-without-annoying

This is a drop-in replacement for [portainer/portainer-ce](https://hub.docker.com/r/portainer/portainer-ce), without annoying UI elements.

`portainer-ce-without-annoying` is **NOT** a fork of `portainer-ce`. It is just an overlay script / proxy to inject styles / scripts, allow removing DOM elements.

| Before ||  After |
|---|---|---|
| ![image](https://user-images.githubusercontent.com/7702203/236629225-5703d704-0d3e-4eb4-b460-e91bb7dbe19d.png) | ==> | ![image](https://user-images.githubusercontent.com/7702203/236629236-53df8ff4-7fb3-4144-876f-a04ce8ab9ea4.png) |
| ![image](https://user-images.githubusercontent.com/7702203/236629290-e616ff6a-b69b-4848-80ab-b4d93ca9d25e.png) | ==> | ![image](https://user-images.githubusercontent.com/7702203/236629305-9130c816-2fd6-4bec-b1c8-c117b6381d4b.png) |
| ![image](https://user-images.githubusercontent.com/7702203/236629353-5fd003d4-1725-46ab-bed9-15df02705263.png) | ==> | ![image](https://user-images.githubusercontent.com/7702203/236629375-a248f359-2730-4dc0-9206-5de84d5ed831.png) |

**Bonus**: tracking script is also removed. See [this issue](https://github.com/ngxson/portainer-ce-without-annoying/issues/5)

## How to use

If you already have `portainer-ce` installation, just replace `portainer/portainer-ce:latest` with `ngxson/portainer-ce-without-annoying:latest`

For example, if you use the command from the [official installation guide](https://docs.portainer.io/start/install-ce/server/docker/linux), the command will be:

```
docker volume create portainer_data
docker run -d \
  -p 8000:8000 -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  ngxson/portainer-ce-without-annoying:latest
```

Alternatively, you can use [this docker-compose.yml](https://github.com/ngxson/portainer-ce-without-annoying/blob/master/docker-compose.yml)
