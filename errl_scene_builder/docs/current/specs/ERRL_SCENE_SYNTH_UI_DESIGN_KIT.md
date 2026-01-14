# Errl Scene Synth — UI Design Kit (v1)

Practical tokens and patterns so the UI stays consistent and intentional.

---

## 1) Theme Tokens
- Colors
  - `--bg`: #060712
  - `--panel`: #0b0d1a
  - `--card`: #0e1022
  - `--border`: rgba(255,255,255,0.08)
  - `--text`: #f4f0ff
  - `--muted`: #9aa2c0
  - Accents: `--emerald` #42ffbf, `--sky` #8be9ff, `--accent-2` #ff7ad1, `--accent-3` #ffd166
- Radii
  - Card/inputs: 10–12px
  - Pills: 999px
- Shadows
  - Base: 0 18px 50px rgba(0, 0, 0, 0.35)
- Typography
  - Font: "Space Grotesk", fallback system
  - Headers: 10–11px uppercase, 0.06–0.08em tracking
  - Body: 12–14px

---

## 2) Layout Primitives
- Panels: border 1px `--border`, background rgba(255,255,255,0.03–0.06), blur optional.
- Grid gutters: 10–12px for asset grids and cards.
- Spacing: 8px (tight), 12px (default), 16px (section).
- Widths: Left 280px, Right 320px; collapsible to 48px icon strip (future).
- Canvas frame: dashed or subtle border, soft radius, centered within 92% of available width/height.

---

## 3) Common Components
- **Button (Primary):** gradient (`--accent` → `--accent-2`), bold 700, dark text.
- **Button (Ghost):** border `--border`, bg rgba(255,255,255,0.04); hover +border and +bg.
- **Input:** bg rgba(255,255,255,0.05), border `--border`, radius 8px, text `--text`.
- **Pill:** inline-flex, border 1px rgba(255,255,255,0.12); use emerald/sky gradient for emphasis.
- **Card:** border `--border`, radius 12px, hover lift + accent border.
- **Tabs (rail):** 3-column grid; active border-bottom emerald, muted inactive text.

---

## 4) Interaction Microcopy
- Empty states:
  - AssetPanel: “Click any asset to spawn it”
  - Inspector: “Select an entity to edit”
  - FX: “No FX yet. Add grain, vignette, or glow.”
- Helper chips:
  - “Snap: Shift” “Parallax: On” “Artboard: 1024”

---

## 5) Motion/Feedback
- Hover: +1px translateY(-1), +border alpha, subtle brighten.
- Press: slight darken; no heavy scaling.
- Focus: outline 1px `--accent` or `--emerald`.

---

## 6) Responsive
- Medium: allow left/right collapse; icons only.
- Small (future): canvas on top, panels as bottom drawers; keep 12px padding and pill headers.

---

## 7) Do/Don’t
- Do keep UI dark/quiet; let Errl art be loud.
- Don’t cram neon gradients everywhere; reserve for active states or CTAs.
- Do keep labels short, uppercase for panel headers only.
