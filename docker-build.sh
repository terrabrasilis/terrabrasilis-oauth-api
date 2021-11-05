#!/bin/bash

VERSION=$(git describe --tags --abbrev=0)

docker build -t terrabrasilis/terrabrasilis-oauth-api:$VERSION -f Dockerfile .

docker push terrabrasilis/terrabrasilis-oauth-api:$VERSION
