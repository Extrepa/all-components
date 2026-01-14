# Vault Dashboard

The dashboard is the single control surface for the entire system.

It is intentionally simple.

## Purpose

- One URL to rule them all
- Human navigation layer
- No logic, no backend, no database

## Location

Served from:
- /srv/web/sites/dashboard
- Available at: vault.yourdomain.com

## Recommended Layout

- Files
- Media (Jellyfin)
- Admin (Portainer)
- Websites

Each item is just a link.

## Rules

- Static HTML only
- No authentication logic here
- Auth happens at the service level

The dashboard must never be clever.
It must never break.

