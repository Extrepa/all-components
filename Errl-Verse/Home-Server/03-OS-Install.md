# Ubuntu Server Installation

## Installer Prep (on your Mac)

- Download Ubuntu Server LTS
  - https://ubuntu.com/download/server
- Install balenaEtcher
- Flash Ubuntu ISO to USB drive

## Install

1. Insert USB into Dell
2. Power on → press **F12**
3. Select USB boot device
4. Choose **Install Ubuntu Server**

## During Install

- Language + keyboard → defaults OK
- Network → DHCP (automatic)
- Storage → Guided / Use entire disk
- Create user + password
- Enable **OpenSSH**
- Skip extra snaps

Reboot when finished.

## After Install

- Reboot
- Note server IP
- SSH in from another machine:

```bash
ssh username@SERVER_IP
```

## First Login & Base Setup

### Update system

```bash
sudo apt update && sudo apt upgrade -y
```

### Install basics

```bash
sudo apt install -y htop curl git ufw
```

This system will be headless after this point.

