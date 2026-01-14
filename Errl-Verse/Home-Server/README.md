# Home Server Documentation

Complete documentation system for setting up and managing a home server on Dell OptiPlex 7050.

## Quick Navigation

### Start Here
- **[00-Overview.md](00-Overview.md)** - System overview and core principles
- **[QUICK-REFERENCE.md](QUICK-REFERENCE.md)** - Printable build-day checklist

### Core Documentation (00-10)
- **[01-Architecture.md](01-Architecture.md)** - System architecture (private/public split)
- **[02-Hardware-Setup.md](02-Hardware-Setup.md)** - Hardware requirements and installation
- **[03-OS-Install.md](03-OS-Install.md)** - Ubuntu Server installation
- **[04-Storage-Layout.md](04-Storage-Layout.md)** - Canonical storage structure
- **[05-Docker-Platform.md](05-Docker-Platform.md)** - Docker setup and Portainer
- **[06-Remote-Access.md](06-Remote-Access.md)** - Cloudflare Tunnel setup
- **[07-Media-Services.md](07-Media-Services.md)** - Media services and containers
- **[08-Public-Website.md](08-Public-Website.md)** - Public website strategy
- **[09-Workflows.md](09-Workflows.md)** - Daily workflows
- **[10-Backups.md](10-Backups.md)** - Backup strategy

### Operational Documentation (11-20)
- **[11-Dashboard.md](11-Dashboard.md)** - Vault dashboard design
- **[12-Containers-Selection.md](12-Containers-Selection.md)** - Container selection strategy
- **[13-Authentication.md](13-Authentication.md)** - Authentication model
- **[14-Mobile-Use.md](14-Mobile-Use.md)** - Mobile-first design
- **[15-Sync-and-Sharing.md](15-Sync-and-Sharing.md)** - Sync and sharing rules
- **[16-Maintenance.md](16-Maintenance.md)** - Maintenance schedule
- **[17-Failure-Scenarios.md](17-Failure-Scenarios.md)** - Failure recovery
- **[18-Future-Extensions.md](18-Future-Extensions.md)** - Future extensions
- **[19-Rules-of-the-System.md](19-Rules-of-the-System.md)** - System rules
- **[20-Quick-Start.md](20-Quick-Start.md)** - Quick start checklist

## Key Information

### Storage Path
All data is stored in `/srv`:
- `/srv/backups/` - Backups and Time Machine
- `/srv/media/movies/` - Movie files
- `/srv/media/shows/` - TV show files
- `/srv/web/sites/` - Website data
- `/srv/docker/` - Docker volumes

### Core Services
1. Time Machine backup container
2. Jellyfin (media server)
3. Caddy (reverse proxy + HTTPS)
4. Portainer (Docker management)
5. Optional: Pi-hole (DNS)

### Remote Access
- Cloudflare Tunnel (no port forwarding)
- Browser-based access only
- HTTPS everywhere

## Philosophy

This system follows the **"boring is good"** principle:
- Predictable
- Simple
- Long-lasting
- No premature optimization

## Related Documentation

- **[../Cursor-Constraints/](../Cursor-Constraints/)** - Cursor AI constraints and rules
- **[../PLAN-COMPARISON.md](../PLAN-COMPARISON.md)** - Plan comparison and decisions
- **[../SUMMARY.md](../SUMMARY.md)** - Project summary

