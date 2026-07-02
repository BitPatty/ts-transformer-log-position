FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:24-trixie

# Install MariaDB client for mysql commands
RUN apt update && apt install -y mariadb-client

# Update args in docker-compose.yaml to set the UID/GID of the "node" user.
ARG USER_UID=1000
ARG USER_GID=$USER_UID
ENV USER_UID=${USER_UID}
ENV USER_GID=${USER_GID}
RUN if [ "$USER_GID" != "1000" ] || [ "$USER_UID" != "1000" ]; then groupmod --gid $USER_GID node && usermod --uid $USER_UID --gid $USER_GID node; fi
