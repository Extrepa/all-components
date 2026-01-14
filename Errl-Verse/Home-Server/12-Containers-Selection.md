# Container Selection Strategy

This document explains *how* to choose containers, and provides specific recommendations.

## Rules for Choosing Containers

A container is acceptable only if:

- Actively maintained
- Official or well-known image
- Supports volume mounts
- Browser-based UI
- No forced cloud account

## One Service, One Container

Never combine services.
Never stack features.

Bad:
- One container doing files + photos + media

Good:
- One container per media type

## Why This Matters

- Easier upgrades
- Easier backups
- Easier replacement
- Easier debugging

Containers are disposable.
Your data is not.

## Recommended Containers

### Core Services

1. **Time Machine** - Network Time Machine backup target
2. **Jellyfin** - Media server for movies and shows
3. **Caddy** - Reverse proxy and web server with automatic HTTPS
4. **Portainer** - Docker management UI

### Optional Services

- **Pi-hole** - DNS ad-blocking (optional)

## Installation Order

Install in this order:
1. Time Machine backup container
2. Jellyfin (media server)
3. Caddy (web server + HTTPS)
4. Optional: Pi-hole (DNS)

