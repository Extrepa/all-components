# Failure Scenarios

## If the Public Host Dies

- Nothing important is lost
- Re-upload from /srv/web/sites/
- Domain stays the same

## If the Home Server Goes Down

- Public site still works (if on separate host)
- Vault temporarily unavailable
- Restore from backups

## If You Make a Mistake

- Containers can be rebuilt
- Data remains intact
- Nothing is permanent except folders

This system is resilient by design.

