# Docker Platform

## Why Docker

- Reproducible
- Easy to back up
- No dependency rot
- Services stay isolated

## Core Components

- Docker Engine
- Docker Compose
- Portainer (management UI)

## Golden Rule

Nothing runs directly on Ubuntu.
Everything runs in containers.

## Install Docker

```bash
sudo apt install -y ca-certificates curl gnupg
```

(Add Docker repo, then install Docker Engine)

## Add user to docker group

```bash
sudo usermod -aG docker $USER
```

(Log out and back in)

## Install Portainer

```bash
docker volume create portainer_data

docker run -d \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Access:
- https://SERVER_IP:9443

