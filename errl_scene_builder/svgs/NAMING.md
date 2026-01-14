# SVG Naming and Category Conventions

This project uses structured SVG filenames so assets are self-describing and easy to organize.

## General pattern

- Base: `errl_<domain>_<descriptor>_<variant>.svg`
- All lowercase, words separated by `_`.
- No spaces in filenames.

Examples:
- `errl_fest_gate_icon_minimap_01.svg`
- `errl_weather_sun_simple_01.svg`
- `errl_bg_void_panel_01.svg`
- `errl_woods_mushroom_ring_01.svg`

## Domains and prefixes

- `errl_bg_*` – generic background cards/panels (go in `svgs/library/env`).
- `errl_woods_*` – woods / campsite environment (go in `svgs/library/env`).
- `errl_fest_*` – festival world assets (go in `svgs/library/fest`).
- `errl_weather_*` – weather overlays and icons (go in `svgs/library/weather` or `fx`).
- `errl_env_*` – generic environment pieces (go in `svgs/library/env`).
- `errl_fx_*` – abstract FX shapes and overlays (go in `svgs/library/fx`).
- `errl_goo_*` – goo / drip primitives (go in `svgs/library/goo`).
- `errl_accessory_*`, `errl_hat_*` – Errl accessories/hats (go in `svgs/library/accessory` / `hat`).
- `errl_frame_*` – frames / borders (go in `svgs/library/frame`).
- `errl_ui_icon_*` – UI chrome icons (go in `svgs/library/ui`).

## Common suffixes

- `_icon` – pictogram icon version (e.g. `errl_fest_food_tray_icon_01`).
- `_minimap` – simplified glyph for minimap (e.g. `errl_fest_stage_icon_minimap_01`).
- `_node` / `_node_vip` – minimap node markers.
- `_01`, `_02`, ... – numbered variants within a family.

For deliberate alternates, prefer:
- `_01_alt`, `_01_outline`, `_01_dense`, `_01_sparse`, etc. instead of auto `_1`, `_2` suffixes.

## Data names

Each SVG should include a logical name via either:

- `data-name="errl_fest_tent_icon_mainstage_01"`, or
- A leading comment: `<!-- errl_fest_tent_icon_mainstage_01 – description -->`.

The `data-name` or comment base should match the filename (without `.svg`).

## Categories vs. filenames

When adding new assets:

- Use the filename prefix to decide the base folder under `svgs/library`.
- If an asset has `*_icon_*` or `*minimap*` in its name and is festival-related, it still lives in `svgs/library/fest`, but may also appear in filtered indexes (e.g. `asset_catalog_fest_icons.json`, `asset_catalog_minimap.json`).

## Linting

The `scripts/lint_assets.cjs` script enforces:
- No spaces in filenames.
- Logical names matching the filename slug.
- Domain prefix present (e.g. `errl_fest_`, `errl_woods_`, `errl_weather_`, etc.).

Run:

```bash
npm run lint:assets
```

to check new assets before committing.