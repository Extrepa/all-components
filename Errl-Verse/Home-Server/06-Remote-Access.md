# Remote Access

## Goals

- No port forwarding
- No exposed IP
- Works on mobile networks
- HTTPS everywhere

## Method

- Cloudflare DNS
- Cloudflare Tunnel
- Reverse proxy (Caddy)

## Setup Steps

1. Buy domain
2. Use Cloudflare DNS
3. Set up Cloudflare Tunnel (no port forwarding needed)
4. Configure reverse proxy for routing

## Subdomains

- vault.domain.com (dashboard)
- files.domain.com
- media.domain.com
- admin.domain.com (Portainer)

Access is browser-based only.
No VPN required.

