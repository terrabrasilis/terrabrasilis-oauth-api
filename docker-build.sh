#!/bin/bash

VERSION=$(cat package.json | grep -oP '(?<="version": ")[^"]*')

# Stopping all containers
#docker container stop terrabrasilis_amazon_alert_daily
#docker container stop terrabrasilis_amazon_alert_aggregated

# build all images
docker build -t terrabrasilis/terrabrasilis-oauth-api:v$VERSION --build-arg -f Dockerfile .

# send to dockerhub
## docker login
docker push terrabrasilis/terrabrasilis-oauth-api:v$VERSION

# If you want run containers, uncomment this lines
#docker run -d --rm -p 83:80 --name terrabrasilis_amazon_alert_daily terrabrasilis/amazon-alert-daily:v$VERSION
#docker run -d --rm -p 84:80 --name terrabrasilis_amazon_alert_aggregated terrabrasilis/amazon-alert-aggregated:v$VERSION

