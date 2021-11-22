#!/bin/bash
cd clap
aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin $ECR_REGISTRY
docker pull $IMAGE
docker tag $IMAGE clap
docker stop clap && docker rm clap
docker run -d -p 5000:5000 --env-file=.env --name clap clap
docker image prune -f
