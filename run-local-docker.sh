#!bin/bash

DOCKER_IMAGE=jekyll-app
DOCKER_CONTAINER=jekyll-app


if [ -f /proc/sys/fs/binfmt_misc/WSLInterop ]; then
    echo "On WSL"

    if [ "$(docker image ls -q "${DOCKER_IMAGE}")" ]; then
        echo "Docker image : ${DOCKER_IMAGE} is already existed."

        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --force_polling --host 0.0.0.0
    else
        echo "Create docker image : ${DOCKER_IMAGE}"

        docker build -t ${DOCKER_IMAGE} .

        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --force_polling --host 0.0.0.0
    fi

else
    echo "On not WSL"

    if [ "$(docker image ls -q "${DOCKER_IMAGE}")" ]; then
        echo "Docker image : ${DOCKER_IMAGE} is already existed."

        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --host 0.0.0.0
    else
        echo "Create docker image : ${DOCKER_IMAGE}"

        docker build -t ${DOCKER_IMAGE} .

        docker run -it --rm -v ${PWD}:/usr/src/app \
            --name ${DOCKER_CONTAINER} -p 4000:4000 \
            ${DOCKER_IMAGE} bundle exec jekyll serve --future --host 0.0.0.0
    fi

fi