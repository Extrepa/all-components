# System Architecture

## Two Worlds, One Domain

### Private (Home Server)
- Ubuntu on Dell OptiPlex 7050
- Docker-based services
- Media vault
- Accessible via secure browser login

### Public (Cheap Host)
- Static website
- Embedded media
- No master files
- Can be deleted and rebuilt anytime

## Traffic Flow

User → Domain → Cloudflare → Home Server (private services)
User → Domain → Cheap Host (public site)

## Why This Works

- Home IP is hidden
- No port forwarding (Cloudflare Tunnel)
- Mobile-friendly access
- Public traffic never touches private data

