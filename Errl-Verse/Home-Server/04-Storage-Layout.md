# Canonical Storage Layout

This layout must never change.

```text
/srv
├── backups/
├── media/
│   ├── movies/
│   └── shows/
├── web/
│   └── sites/
└── docker/
```

## Rules

- One media type per folder
- Originals never modified
- Public content always copied, never moved
- Server is the source of truth

## Purpose

- **backups/**: Mac / Time Machine backups, Docker volumes, system backups
- **media/movies/**: Movie files
- **media/shows/**: TV show files
- **web/sites/**: Website data and static files
- **docker/**: Docker volumes and persistent data

