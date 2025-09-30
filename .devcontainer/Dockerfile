FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:1-22-bookworm

# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then groupmod --gid $USER_GID node && usermod --uid $USER_UID --gid $USER_GID node; fi

# Add the node user to the docker group to access
# the daemon without sudo
RUN groupadd docker
RUN usermod -a -G docker node