# Daily Workflows

## Adding Files

Upload to /srv/media/ or appropriate subdirectory.

## Media Management

- Movies: Add to /srv/media/movies/
- Shows: Add to /srv/media/shows/
- Jellyfin will automatically scan and organize

## Website Updates

1. Edit files in /srv/web/sites/
2. Sync to public host (if using separate host)
3. Or serve directly via Caddy

## Backups

- Time Machine: Automatic via container
- System backups: Scheduled to /srv/backups/

## General Rule

Server is authoritative.
Everything else is a mirror.

