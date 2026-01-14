# Architectural Decisions

## Storage
- One media type per folder
- Server is the source of truth
- Storage path: /srv (not /storage)

## Networking
- No port forwarding
- Cloudflare Tunnel only

## Hosting
- Cheap shared host for public site
- Public host is disposable

## Containers
- One service per container
- Containers are replaceable

## Philosophy
- Boring beats clever
- Stability beats novelty

Whenever Cursor suggests something new, you can say:

"Check DECISIONS.md before proceeding."

It will actually obey.

