# Project Structure Documentation

**Project:** Errl-Verse
**Last Updated:** 2027-01-09

## Directory Structure
```
Errl-Verse/
├── Cursor-Constraints/          # Development constraints and guidelines
│   ├── CURSOR_PROJECT_CONTRACT.md
│   ├── CANONICAL_PATHS.md
│   ├── ALLOWED_ACTIONS.md
│   ├── DECISIONS.md
│   ├── DEFINITION_OF_DONE.md
│   ├── BORING_IS_GOOD.md
│   └── README.md
├── Home-Server/                 # Home server documentation (22 files)
│   ├── 00-Overview.md
│   ├── 01-Architecture.md
│   ├── 02-Hardware-Setup.md
│   ├── 03-OS-Install.md
│   ├── 04-Storage-Layout.md
│   ├── 05-Docker-Platform.md
│   ├── 06-Remote-Access.md
│   ├── 07-Media-Services.md
│   ├── 08-Public-Website.md
│   ├── 09-Workflows.md
│   ├── 10-Backups.md
│   ├── 11-Dashboard.md
│   ├── 12-Containers-Selection.md
│   ├── 13-Authentication.md
│   ├── 14-Mobile-Use.md
│   ├── 15-Sync-and-Sharing.md
│   ├── 16-Maintenance.md
│   ├── 17-Failure-Scenarios.md
│   ├── 18-Future-Extensions.md
│   ├── 19-Rules-of-the-System.md
│   ├── 20-Quick-Start.md
│   ├── QUICK-REFERENCE.md
│   └── README.md
├── docs/                        # Project documentation
│   ├── archive/                 # Historical verification docs
│   │   ├── FINAL-VERIFICATION.md
│   │   ├── PLAN-COMPARISON.md
│   │   ├── VERIFICATION-REPORT.md
│   │   └── README.md
│   ├── current/                # Active implementation notes
│   │   ├── SUMMARY.md
│   │   ├── IMPLEMENTATION-NOTES.md
│   │   └── README.md
│   ├── architecture.md
│   ├── project-structure.md
│   ├── completion-checklist.md
│   └── index.md
├── INDEX.md                     # Workspace index
├── PROJECT_STATUS.md            # Project status
├── README.md                    # Main project documentation
└── ErrlServerGPT_*.txt          # Original GPT files (reference only)
```

## File Organization

### Core Documentation

- **INDEX.md** - Workspace index with project overview
- **PROJECT_STATUS.md** - Current project status and completion tracking
- **README.md** - Main project documentation and quick start

### Home Server Documentation (`Home-Server/`)

**Core Setup (00-10):**
- `00-Overview.md` - System overview
- `01-Architecture.md` - Architecture design
- `02-Hardware-Setup.md` - Hardware requirements and setup
- `03-OS-Install.md` - Operating system installation
- `04-Storage-Layout.md` - Storage structure (`/srv`)
- `05-Docker-Platform.md` - Docker setup
- `06-Remote-Access.md` - Cloudflare Tunnel configuration
- `07-Media-Services.md` - Media service setup
- `08-Public-Website.md` - Public website configuration
- `09-Workflows.md` - Workflow automation
- `10-Backups.md` - Backup strategy

**Operational (11-20):**
- `11-Dashboard.md` - Dashboard setup
- `12-Containers-Selection.md` - Container recommendations
- `13-Authentication.md` - Authentication setup
- `14-Mobile-Use.md` - Mobile access
- `15-Sync-and-Sharing.md` - Sync and sharing
- `16-Maintenance.md` - Maintenance procedures
- `17-Failure-Scenarios.md` - Failure handling
- `18-Future-Extensions.md` - Future plans
- `19-Rules-of-the-System.md` - System rules
- `20-Quick-Start.md` - Quick start guide

**Reference:**
- `QUICK-REFERENCE.md` - Printable build-day checklist
- `README.md` - Home Server documentation index

### Cursor Constraints (`Cursor-Constraints/`)

Development guidelines and constraints:
- `CURSOR_PROJECT_CONTRACT.md` - Project contract
- `CANONICAL_PATHS.md` - Standard paths
- `ALLOWED_ACTIONS.md` - Allowed actions
- `DECISIONS.md` - Key decisions
- `DEFINITION_OF_DONE.md` - Completion criteria
- `BORING_IS_GOOD.md` - Philosophy

### Documentation (`docs/`)

**Archive (`docs/archive/`):**
- Historical verification and comparison documents
- Plan comparison reports
- Final verification reports

**Current (`docs/current/`):**
- Active implementation notes
- Current summaries
- Implementation verification

## Key Directories

### Home-Server/
Primary documentation for home server setup and operation. Follows modular structure with numbered files for logical flow.

### Cursor-Constraints/
Development constraints and guidelines for working with Cursor AI. Ensures consistent project structure and practices.

### docs/
Project documentation including verification reports, implementation notes, and status tracking.

## File Naming Conventions

- **Home Server docs**: Numbered sequence (00-20) for logical flow
- **Cursor Constraints**: Descriptive names with underscores
- **Documentation**: Lowercase with hyphens (kebab-case)
- **Archive files**: UPPERCASE with hyphens

## Storage Structure

All storage paths use `/srv` (Linux standard):
- `/srv/backups/` - Backup storage
- `/srv/media/movies/` - Movie files
- `/srv/media/shows/` - TV show files
- `/srv/web/sites/` - Web site files
- `/srv/docker/` - Docker data

## Related Documentation

- [Architecture](architecture.md) - Technical architecture
- [Documentation Index](index.md) - Main documentation index
- [Home Server README](../Home-Server/README.md) - Home Server docs index
