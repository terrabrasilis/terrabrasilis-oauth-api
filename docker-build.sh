#!/bin/bash

VERSION='v'$(cat package.json | grep -oP '(?<="version": ")[^"]*')

docker build -t terrabrasilis/terrabrasilis-oauth-api:$VERSION -f Dockerfile .

docker push terrabrasilis/terrabrasilis-oauth-api:$VERSION
