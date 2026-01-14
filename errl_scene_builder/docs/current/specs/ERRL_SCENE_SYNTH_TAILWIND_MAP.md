# Errl Scene Synth — Tailwind Class Map (v1)

Mapping the design kit tokens to Tailwind utility bundles. Use these shorthands to keep styling consistent.

---

## 1) Colors / Theme
Configure in `tailwind.config` (conceptual; mirror existing CSS variables):
```js
theme: {
  extend: {
    colors: {
      bg: "#060712",
      panel: "#0b0d1a",
      card: "#0e1022",
      border: "rgba(255,255,255,0.08)",
      text: "#f4f0ff",
      muted: "#9aa2c0",
      emerald: "#42ffbf",
      sky: "#8be9ff",
      accent2: "#ff7ad1",
      accent3: "#ffd166",
    },
    boxShadow: {
      errl: "0 18px 50px rgba(0,0,0,0.35)",
    },
    fontFamily: {
      errl: ['"Space Grotesk"', "Inter", "system-ui", "-apple-system", "sans-serif"],
    },
  },
}
```

---

## 2) Utility Bundles (apply via `@apply` or component classes)
- Panel: `border border-[color:var(--border)] bg-[rgba(255,255,255,0.03)] rounded-xl shadow-errl`
- Card: `border border-[color:var(--border)] bg-[rgba(255,255,255,0.05)] rounded-xl shadow-errl hover:-translate-y-[1px] hover:border-emerald/50 transition`
- Button primary: `bg-gradient-to-r from-emerald to-accent2 text-[#041f2b] font-bold rounded-lg px-3 py-2`
- Button ghost: `border border-[color:var(--border)] bg-white/5 text-text rounded-lg px-3 py-2 hover:bg-white/10`
- Input: `bg-white/5 border border-[color:var(--border)] text-text rounded-md px-2 py-1`
- Pill: `inline-flex items-center gap-1.5 border border-white/10 rounded-full px-3 py-1 bg-white/5`
- Tab (rail): `h-10 border-b-2 border-transparent text-muted hover:text-white` and active `border-emerald text-white`

---

## 3) Layout Helpers
- Dock (left): `w-[280px] min-w-[260px] flex flex-col border-r border-[color:var(--border)] bg-[rgba(9,11,20,0.9)] backdrop-blur`
- Right rail: `w-[320px] min-w-[300px] flex flex-col border-l border-[color:var(--border)] bg-[rgba(9,11,20,0.9)] backdrop-blur`
- Stage column: `flex-1 flex flex-col min-h-0 p-3 gap-3`
- Stage toolbar: `flex items-center justify-between px-3 py-2 border border-[color:var(--border)] rounded-xl bg-white/5`
- Viewport frame: `relative w-[92%] h-[92%] border border-dashed border-[color:var(--border)] rounded-xl bg-black/40 overflow-hidden shadow-errl`
- Bottom bar: `h-13 flex items-center justify-between px-4 border-t border-[color:var(--border)] bg-white/5`

---

## 4) Typography
- Header (panel title): `text-[11px] uppercase tracking-[0.08em] text-muted`
- Body: `text-[13px] text-text`
- Muted: `text-[12px] text-muted`

---

## 5) Micro-interactions
- Hover lift: `transition translate-y-[-1px] border-emerald/50`
- Focus ring: `focus:outline-none focus:ring-2 focus:ring-emerald/60`

---

## 6) Grids / Spacing
- Asset grid: `grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-2.5`
- Gaps: use `gap-2` (8px), `gap-3` (12px), `gap-4` (16px)
- Padding: `px-3 py-2` for bars, `p-3` for cards, `p-4` for heavier sections

---

## 7) Responsive Notes
- Collapsed panels: `w-12` with `flex flex-col items-center` and icon buttons.
- Mobile (future): stack canvas and use bottom drawers with `fixed bottom-0 inset-x-0 bg-panel rounded-t-2xl p-4`.
