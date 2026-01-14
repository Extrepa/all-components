# Migration Guide: Export Utilities Consolidation

**Created:** 2027-01-07  
**Priority:** Medium  
**Complexity:** Medium  
**Estimated Time:** 2 weeks

---

## Overview

This guide covers extracting common export patterns from multiple projects into shared utilities in `shared/utils/export/`.

**Current State:**
- Multiple projects with similar export implementations
- Different formats: JSON, SVG, PNG, ZIP
- Similar download patterns

**Target State:**
- Shared export utilities in `shared/utils/export/`
- Projects using shared utilities
- Consistent export patterns

---

## Current State Analysis

### Projects with Export Systems

1. **`multi-tool-app`**
   - Location: [`multi-tool-app/src/engine/exporters/`](multi-tool-app/src/engine/exporters/)
   - Formats: Flash bundle, React components, static SVG, PNG, JSON, ZIP
   - Files: `FlashExporter.ts`, `StaticExporter.ts`, `BundleExporter.ts`

2. **`figma-clone-engine`**
   - Location: [`figma-clone-engine/src/utils/fileOperations.ts`](figma-clone-engine/src/utils/fileOperations.ts)
   - Formats: PNG, SVG, JPG with multiple scales
   - Features: Multiple scale options

3. **`errl_scene_builder`**
   - Location: [`errl_scene_builder/src/components/ErrlEditor.tsx`](errl_scene_builder/src/components/ErrlEditor.tsx)
   - Formats: Scene JSON export

4. **`universal-component-extractor`**
   - Location: [`universal-component-extractor/`](universal-component-extractor/)
   - Formats: HTML, TSX, JS, SCSS, ZIP
   - Features: Multiple export formats

---

## Common Patterns

### Pattern 1: JSON Export

```typescript
// Common pattern across projects
const data = JSON.stringify(project, null, 2);
const blob = new Blob([data], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = filename;
a.click();
URL.revokeObjectURL(url);
```

### Pattern 2: SVG Export

```typescript
// SVG serialization
const serializer = new XMLSerializer();
const svgString = serializer.serializeToString(svgElement);
const blob = new Blob([svgString], { type: 'image/svg+xml' });
// ... download pattern
```

### Pattern 3: PNG Export

```typescript
// Canvas to PNG
canvas.toBlob((blob) => {
  if (blob) {
    const url = URL.createObjectURL(blob);
    // ... download pattern
  }
}, 'image/png', quality);
```

### Pattern 4: ZIP Export

```typescript
// Using JSZip
const zip = new JSZip();
zip.file('file1.json', jsonData);
zip.file('file2.svg', svgData);
const blob = await zip.generateAsync({ type: 'blob' });
// ... download pattern
```

---

## Target State Design

### Shared Export Utilities

**Location:** `shared/utils/export/`

**Structure:**
```
shared/utils/export/
├── index.ts
├── jsonExporter.ts      # JSON export
├── svgExporter.ts       # SVG export
├── pngExporter.ts       # PNG export
├── zipExporter.ts       # ZIP export
├── download.ts          # Common download utility
└── types.ts             # Export types
```

**API Design:**
```typescript
// JSON export
export function exportJSON(data: any, filename: string, options?: ExportOptions): void;

// SVG export
export function exportSVG(
  svgElement: SVGSVGElement | string,
  filename: string,
  options?: SVGExportOptions
): void;

// PNG export
export function exportPNG(
  canvas: HTMLCanvasElement,
  filename: string,
  options?: PNGExportOptions
): Promise<void>;

// Multiple scales PNG
export function exportPNGMultiScale(
  canvas: HTMLCanvasElement,
  filename: string,
  scales: number[]
): Promise<void>;

// ZIP export
export function exportZIP(
  files: { name: string; content: string | Blob }[],
  filename: string
): Promise<void>;

// Generic download
export function downloadBlob(blob: Blob, filename: string): void;
```

---

## Step-by-Step Migration Process

### Step 1: Create Shared Utilities

1. **Create `shared/utils/export/` structure**
   ```bash
   mkdir -p shared/utils/export
   ```

2. **Create common download utility**
   - Extract download pattern
   - Create `shared/utils/export/download.ts`
   - Handle edge cases

3. **Create JSON exporter**
   - Extract JSON export pattern
   - Create `shared/utils/export/jsonExporter.ts`
   - Add formatting options

4. **Create SVG exporter**
   - Extract SVG export pattern
   - Create `shared/utils/export/svgExporter.ts`
   - Handle both element and string inputs

5. **Create PNG exporter**
   - Extract PNG export pattern
   - Create `shared/utils/export/pngExporter.ts`
   - Support quality options
   - Support multiple scales

6. **Create ZIP exporter**
   - Extract ZIP export pattern
   - Create `shared/utils/export/zipExporter.ts`
   - Support multiple files

7. **Write tests**
   - Test all export formats
   - Test edge cases
   - Test error handling

### Step 2: Migrate `multi-tool-app`

1. **Update imports**
   ```typescript
   // Before
   import { exportFlashBundle } from '@/engine/exporters/FlashExporter';
   import { exportStaticSVG } from '@/engine/exporters/StaticExporter';
   
   // After
   import { exportJSON, exportSVG, exportPNG, exportZIP } from '@/shared/utils/export';
   ```

2. **Update export functions**
   ```typescript
   // Before
   export function exportFlashBundle(project: Project): string {
     const manifest = { ... };
     return JSON.stringify(manifest, null, 2);
   }
   
   // After
   export function exportFlashBundle(project: Project): void {
     const manifest = { ... };
     exportJSON(manifest, `${project.meta.name}_flash.json`);
   }
   ```

3. **Keep project-specific logic**
   - Flash bundle format is project-specific
   - Keep format logic, use shared download
   - Or create project-specific wrapper

4. **Test thoroughly**
   - Test all export formats
   - Visual regression testing
   - File format validation

### Step 3: Migrate `figma-clone-engine`

1. **Update imports**
   ```typescript
   // Before
   // Local export implementation
   
   // After
   import { exportPNG, exportSVG, exportPNGMultiScale } from '@/shared/utils/export';
   ```

2. **Update export functions**
   ```typescript
   // Before
   canvas.toBlob((blob) => { /* download */ }, 'image/png');
   
   // After
   await exportPNG(canvas, filename, { scale: 1 });
   ```

3. **Test thoroughly**
   - Test all export formats
   - Test multiple scales
   - Visual regression testing

### Step 4: Migrate Other Projects

**Projects:** `errl_scene_builder`, `universal-component-extractor`

1. **Update imports**
2. **Update export functions**
3. **Test thoroughly**
4. **Remove old implementations**

---

## Code Examples

### Before: Project-Specific Implementation

```typescript
// multi-tool-app/src/engine/exporters/FlashExporter.ts
export const exportFlashBundle = (project: Project): string => {
  const manifest = {
    name: project.meta.name,
    resolution: project.meta.resolution,
    assets: project.library.assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      data: asset.data,
    })),
    scene: {
      background: project.scene.background || '#000000',
      layers: project.scene.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        objects: layer.objects.map(obj => ({
          id: obj.id,
          assetId: obj.ref,
          x: obj.x,
          y: obj.y,
          // ...
        })),
      })),
    },
  };
  return JSON.stringify(manifest, null, 2);
};

// Then download separately
const content = exportFlashBundle(project);
const blob = new Blob([content], { type: 'application/json' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${project.meta.name}_flash.json`;
a.click();
URL.revokeObjectURL(url);
```

### After: Using Shared Utilities

```typescript
// Using shared export utilities
import { exportJSON } from '@/shared/utils/export';

export const exportFlashBundle = (project: Project): void => {
  const manifest = {
    name: project.meta.name,
    resolution: project.meta.resolution,
    assets: project.library.assets.map(asset => ({
      id: asset.id,
      name: asset.name,
      type: asset.type,
      data: asset.data,
    })),
    scene: {
      background: project.scene.background || '#000000',
      layers: project.scene.layers.map(layer => ({
        id: layer.id,
        name: layer.name,
        objects: layer.objects.map(obj => ({
          id: obj.id,
          assetId: obj.ref,
          x: obj.x,
          y: obj.y,
          // ...
        })),
      })),
    },
  };
  
  // Use shared export utility
  exportJSON(manifest, `${project.meta.name}_flash.json`);
};
```

### Before: PNG Export with Multiple Scales

```typescript
// figma-clone-engine/src/utils/fileOperations.ts
async function exportPNG(canvas: HTMLCanvasElement, scale: number) {
  const scaledCanvas = document.createElement('canvas');
  scaledCanvas.width = canvas.width * scale;
  scaledCanvas.height = canvas.height * scale;
  const ctx = scaledCanvas.getContext('2d');
  ctx?.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
  
  scaledCanvas.toBlob((blob) => {
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${scale}x.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, 'image/png');
}
```

### After: Using Shared Utilities

```typescript
// Using shared export utilities
import { exportPNGMultiScale } from '@/shared/utils/export';

async function exportPNG(canvas: HTMLCanvasElement, scales: number[]) {
  await exportPNGMultiScale(canvas, 'export', scales);
}
```

---

## Testing Checklist

### Functional Testing

- [ ] JSON export works
- [ ] SVG export works
- [ ] PNG export works
- [ ] ZIP export works
- [ ] Multiple scales work
- [ ] File names correct
- [ ] File formats valid

### Integration Testing

- [ ] Works with all projects
- [ ] No regressions
- [ ] Performance maintained
- [ ] Error handling works

### File Validation

- [ ] Exported files open correctly
- [ ] File sizes reasonable
- [ ] File formats valid
- [ ] No corruption

---

## Rollback Procedures

### If Issues Occur

1. **Immediate Rollback**
   ```bash
   # Revert to project-specific implementations
   git checkout HEAD~1 shared/utils/export/
   ```

2. **Project-Specific Rollback**
   ```typescript
   // Temporarily use old implementations
   import { exportFlashBundle } from '@/engine/exporters/FlashExporter'; // Old local version
   ```

3. **Gradual Rollback**
   - Keep old implementations available
   - Migrate projects back one at a time if needed
   - Fix issues before continuing

---

## Migration Timeline

**Week 1:**
- Create shared utilities
- Extract common patterns
- Write tests

**Week 2:**
- Migrate projects
- Test thoroughly
- Cleanup

---

## Success Criteria

- [ ] Shared export utilities created
- [ ] All projects using shared utilities
- [ ] All export formats work
- [ ] Performance maintained
- [ ] Code reduction achieved
- [ ] Documentation updated

---

## References

- [Code Patterns](CODE_PATTERNS.md) - Export pattern documentation
- [Consolidation Strategy](CONSOLIDATION_STRATEGY.md)
- [Consolidation Roadmap](CONSOLIDATION_ROADMAP.md)
