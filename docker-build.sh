#!/bin/bash

VERSION=$(cat package.json | grep -oP '(?<="version": ")[^"]*')

docker build -t terrabrasilis/terrabrasilis-oauth-api:v$VERSION -f Dockerfile .

docker push terrabrasilis/terrabrasilis-oauth-api:v$VERSION
