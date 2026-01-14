# Authentication Model

## Goals

- One login per user
- No public access to private services
- Works on mobile and desktop

## Model

- Authentication handled by reverse proxy or per-service
- Dashboard itself has no auth
- Services require login

## User Types (Future)

- Owner (you)
- Collaborator
- Viewer

Do not implement roles until needed.

## Rule

Security is boring by design.
If it feels fancy, it's probably fragile.

