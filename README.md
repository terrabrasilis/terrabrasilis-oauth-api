## NODE VERSION

You should user Node version >= 12 

## Installation

```sh
$ yarn install
```

## Usage



# Deploy Info

### Build and Run your image
From your Node.js app project folder launch those commands:

```bash
$ docker build -t terrabrasilis-oauth-api .
$ docker run -p 9000:9000 terrabrasilis-oauth-api
```
### Pushing to Docker Hub:

```bash
$ docker build -t terrabrasilis-oauth-api .
$ docker images # look and find the hash you want
$ docker tag local-image:tagname reponame:tagname
$ docker push reponame:tagname
# EXAMPLE:
$ docker tag bfe06c2b5dea terrabrasilis/terrabrasilis-oauth-api:v1.0.0
$ docker push terrabrasilis/terrabrasilis-oauth-api
```

## Useful commands

Command | Description
--------|------------
```$ docker exec -it <container-id> pm2 monit``` | Monitoring CPU/Usage of each process
```$ docker exec -it <container-id> pm2 list``` | Listing managed processes
```$ docker exec -it <container-id> pm2 show``` | Get more information about a process
```$ docker exec -it <container-id> pm2 reload all``` | 0sec downtime reload all applications
```$ docker exec -it <container-id> pm2 logs --format``` | see all applications logs
```$ docker exec -it <container-id> pm2 flush``` | flush applications logs

