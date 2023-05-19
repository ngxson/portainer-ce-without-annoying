#!/bin/bash

# Get newest tag from https://hub.docker.com/r/portainer/portainer-ce/tags
# Also build one for :latest

IMAGE="ngxson/portainer-ce-without-annoying"
ARCHS="linux/amd64,linux/arm64,linux/arm/v7"

if [ -z "$TAG" ]; then
  echo "Please set TAG environment variable"
  exit 1
fi

cp Dockerfile Dockerfile.tmp
sed -i "s/portainer-ce:latest/portainer-ce:$TAG/g" Dockerfile.tmp

if [ -z "$MULTIARCH" ]; then
  docker build -t "$IMAGE:$TAG" -f Dockerfile.tmp .*
else
  echo "Multi-arch build..."
  docker build --platform "$ARCHS" -t "$IMAGE:$TAG" -f Dockerfile.tmp .*
fi

docker push "$IMAGE:$TAG"
