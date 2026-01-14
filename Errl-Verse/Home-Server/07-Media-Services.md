# Media Services

Each media type is its own service.

## Core Services (Install Order)

1. Time Machine backup container
2. Jellyfin (media server)
3. Caddy (web server + HTTPS)
4. Optional: Pi-hole (DNS)

## Files
- Upload/download
- Folder browsing
- Phone-friendly

## Media (Movies/Shows)
- Stream via Jellyfin
- Organized in /srv/media/
- Originals preserved

## Each Service

- One container
- One subdomain (or path)
- Shared authentication
- Browser-based UI

## Container Selection Rules

A container is acceptable only if:
- Actively maintained
- Official or well-known image
- Supports volume mounts
- Browser-based UI
- No forced cloud account

Containers are disposable.
Your data is not.

