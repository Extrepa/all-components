# Errl Variant Files - Thumbnail Requirements

## Summary

- **Total Variant SVG Files**: 380 files
- **Variant Groups**: 9 groups (each appears as a single button in AssetPanel)
- **Thumbnail Display**: Currently uses SVG files directly (on-the-fly rendering)
- **If Pre-generated Thumbnails Needed**: All 380 files would need thumbnail images

## Files Currently Used as Thumbnails (9 files)

These are the first variant from each group, displayed as thumbnails for the variant group buttons:

1. `/svgs/Errl_AndOrbs/errl-30-dynamic-individual-transparent/errl-01.svg`
2. `/svgs/Errl_AndOrbs/errl-50-grid-poses-individual-transparent/errl-01.svg`
3. `/svgs/Errl_AndOrbs/errl-50-grid-ref-individual-transparent/errl-01.svg`
4. `/svgs/Errl_AndOrbs/random-dynamic-individual-transparent/errl-01.svg`
5. `/svgs/Errl_AndOrbs/errl-20-viscous-body-v2-individual-transparent/visc2-body-01-shear-left-tall.svg`
6. `/svgs/ErrlOnly/errl-30-dynamic-individual-errl-only/errl-01.svg`
7. `/svgs/ErrlOnly/errl-50-grid-poses-individual-errl-only/errl-01.svg`
8. `/svgs/ErrlOnly/errl-50-grid-ref-individual-errl-only/errl-01.svg`
9. `/svgs/ErrlOnly/errl-50-random-dynamic-individual-errl-only/errl-01.svg`

## Complete File List

See `docs/errl-variant-files-all-paths.txt` for the complete list of all 380 SVG file paths.

## Variant Group Breakdown

### Errl_AndOrbs (with Orbs) - 200 files total

1. **errl-30-dynamic-individual-transparent** - 30 files (Has Faces: Yes)
2. **errl-50-grid-poses-individual-transparent** - 50 files (Has Faces: Yes)
3. **errl-50-grid-ref-individual-transparent** - 50 files (Has Faces: Yes)
4. **random-dynamic-individual-transparent** - 50 files (Has Faces: Yes)
5. **errl-20-viscous-body-v2-individual-transparent** - 20 files (Has Faces: No - Body Only)

### ErrlOnly (without Orbs) - 180 files total

6. **errl-30-dynamic-individual-errl-only** - 30 files (Has Faces: Yes)
7. **errl-50-grid-poses-individual-errl-only** - 50 files (Has Faces: Yes)
8. **errl-50-grid-ref-individual-errl-only** - 50 files (Has Faces: Yes)
9. **errl-50-random-dynamic-individual-errl-only** - 50 files (Has Faces: Yes)

## Notes

- ✅ **Thumbnails are now pre-generated**: All 380 PNG thumbnails have been generated and are stored in `svgs/thumbnails/`
- The AssetPanel automatically uses these thumbnails for faster loading
- If a thumbnail fails to load, the system automatically falls back to the SVG
- To regenerate thumbnails, run `npm run generate:thumbnails` (see `docs/thumbnail-generation-guide.md`)
- Individual variant assets are hidden from the asset list and only accessible through variant group buttons

