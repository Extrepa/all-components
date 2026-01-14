# Backups

## What Is Backed Up

- /srv (all data)
- Docker volumes
- Configuration files

## Backup Strategy

- Daily local snapshots
- Time Machine backups (Mac → server)
- Off-machine copy
- Automated, silent

## Time Machine Setup

Time Machine backup container provides:
- Network Time Machine target
- Automatic backups from Mac
- Stored in /srv/backups/

## Philosophy

If backups fail, everything else is irrelevant.

