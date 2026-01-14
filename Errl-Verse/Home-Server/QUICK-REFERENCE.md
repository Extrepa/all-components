# Home Server Quick Reference
## Dell OptiPlex 7050 — Printable Setup Guide

This is a **print-friendly, no-fluff checklist** you can keep next to you while building your home server.
Follow top to bottom. Don't skip ahead. Don't overthink it.

---

## PAGE 1 — WHAT TO BUY (ORDER FIRST)

### Required

☐ **2TB 2.5" SATA SSD (DATA DRIVE)**  
Recommended models:
- Samsung 870 EVO — 2TB  
- Crucial MX500 — 2TB  

Purpose:
- Backups (Mac / Time Machine)
- Media (movies, shows, files)
- Website data
- Docker volumes

☐ **USB Flash Drive (8GB or larger)**  
Purpose:
- Ubuntu Server installer

☐ **Ethernet Cable**
Purpose:
- Server must be wired to your router

### Optional but Smart

☐ **NVMe M.2 SSD (500GB–1TB)**  
Only needed if:
- Your Dell does not already have an SSD
- You want OS + Docker on a very fast drive

Recommended:
- Samsung 970 / 980
- WD Blue SN570 / SN580
- Crucial P3 / P5

☐ **UPS (Battery Backup)**
Purpose:
- Prevent corruption during power outages
- Graceful shutdown

---

## PAGE 2 — PHYSICAL SETUP (HARDWARE)

### Tools Needed
- Small Phillips screwdriver
- Clean table or desk

### Steps

1. Shut down Dell completely
2. Unplug **all cables**
3. Lay Dell on its side
4. Release side panel latch / screw
5. Remove side panel

### Install 2TB SATA SSD

6. Locate 2.5" drive bay/caddy
7. Slide SSD into caddy
8. Connect:
   - SATA **data** cable → motherboard
   - SATA **power** cable → PSU
9. Secure drive in place

### (Optional) Install NVMe SSD

10. Locate M.2 slot on motherboard
11. Insert NVMe at angle
12. Screw it down gently

13. Close side panel
14. Reconnect power + monitor + keyboard + ethernet

**STOP HERE if SSDs are not installed yet.**

---

## PAGE 3 — OS INSTALL (UBUNTU SERVER)

### Prep (on your Mac)

☐ Download **Ubuntu Server LTS**
- https://ubuntu.com/download/server

☐ Install **balenaEtcher**
- Flash Ubuntu ISO to USB drive

### Install

1. Insert USB into Dell
2. Power on → press **F12**
3. Select USB boot device
4. Choose **Install Ubuntu Server**

### During Install

☐ Language + keyboard → defaults OK  
☐ Network → DHCP (automatic)  
☐ Storage → Guided / Use entire disk  
☐ Create user + password  
☐ Enable **OpenSSH**  
☐ Skip extra snaps  

Reboot when finished.

---

## PAGE 4 — FIRST LOGIN & BASE SETUP

### Login

- Either locally with keyboard
- Or from Mac:

```bash
ssh username@SERVER_IP
```

### Update system

```bash
sudo apt update && sudo apt upgrade -y
```

### Install basics

```bash
sudo apt install -y htop curl git ufw
```

---

## PAGE 5 — DOCKER & PORTAINER

### Install Docker

```bash
sudo apt install -y ca-certificates curl gnupg
```

(Add Docker repo, then install Docker Engine)

### Add user to docker group

```bash
sudo usermod -aG docker $USER
```
(Log out and back in)

### Install Portainer

```bash
docker volume create portainer_data

docker run -d \
  -p 9443:9443 \
  --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce:latest
```

Access:
- https://SERVER_IP:9443

---

## PAGE 6 — STORAGE LAYOUT

### Mount 2TB Drive to /srv

Target layout:

```text
/srv
  backups/
  media/
    movies/
    shows/
  web/
    sites/
  docker/
```

---

## PAGE 7 — CORE SERVICES (ORDER)

Install in this order:

1. Time Machine backup container
2. Jellyfin (media server)
3. Caddy (web server + HTTPS)
4. Optional: Pi-hole (DNS)

---

## PAGE 8 — DOMAIN & ACCESS

☐ Buy domain  
☐ Use Cloudflare DNS  
☐ Set up Cloudflare Tunnel (no port forwarding needed)  
☐ Configure reverse proxy (Caddy)  

---

## FINAL RULE

**One step at a time.**
If something breaks, nothing is ruined.
Servers are patient machines.

