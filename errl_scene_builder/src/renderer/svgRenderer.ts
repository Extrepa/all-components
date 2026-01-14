import { ErrlScene, SceneEntity, SceneLayer } from "../scene/types";
import { ISceneRenderer } from "./interface";
import { getAssetById } from "../assets/registry";
import { exportSvgElementAsPng } from "./export";

/**
 * SvgRenderer
 *
 * Responsibilities:
 * - Render an ErrlScene into a single SVG element.
 * - Apply entity transforms (position, rotation, scale, pivot).
 * - Apply motion offsets based on the current playback time.
 *
 * Playback model:
 * - The renderer stores `playbackTimeMs`, set via `setPlaybackTime(ms)`.
 * - On each `render(scene)` call we derive `timeSec = playbackTimeMs / 1000`.
 * - For every SceneEntity we compose:
 *   base transform (entity.transform)
 *   + motion offsets from `applyMotionOffsets(entity, timeSec)`
 *   into the final SVG transform attribute.
 *
 * The entity.transform data stays immutable at runtime; all animation is computed per frame
 * from time + motion params so scenes remain serializable.
 */

const createSvgElement = <K extends keyof SVGElementTagNameMap>(tag: K) =>
  document.createElementNS("http://www.w3.org/2000/svg", tag);

const sortLayers = (layers: SceneLayer[]) => [...layers].sort((a, b) => a.zIndex - b.zIndex);

const sortEntities = (entities: SceneEntity[], layers: SceneLayer[]) => {
  const zMap = new Map(layers.map((l) => [l.id, l.zIndex]));
  return [...entities].sort(
    (a, b) => (zMap.get(a.layerId) || 0) - (zMap.get(b.layerId) || 0)
  );
};

/**
 * Computes animated offsets for a given entity at a specific playback time.
 * - timeSec is derived from the global playback time in seconds.
 * - Iterates over enabled motion entries and accumulates dx/dy, rotation, and scale deltas.
 * Supported motionIds:
 *   MOTION_FLOAT  -> vertical sine
 *   MOTION_WIGGLE -> small rotation wiggle
 *   MOTION_PULSE  -> scale in/out
 *   MOTION_ORBIT  -> elliptical motion around pivot
 *   MOTION_DRIP   -> simple looping downward motion
 */
const applyMotionOffsets = (entity: SceneEntity, timeSec: number) => {
  let dx = 0;
  let dy = 0;
  let dRot = 0;
  let dScale = 1;
  entity.motion
    .filter((m) => m.enabled)
    .forEach((m) => {
      const p = m.params || {};
      const speed = typeof p.speed === "number" ? p.speed : 0.5;
      const intensity = typeof p.intensity === "number" ? p.intensity : 0.5;
      const freq = speed * 2 * Math.PI;
      switch (m.motionId) {
        case "MOTION_FLOAT": {
          const amp = 20 * intensity;
          dy += Math.sin(timeSec * freq) * amp;
          break;
        }
        case "MOTION_WIGGLE": {
          const rotAmp = 5 * intensity;
          dRot += Math.sin(timeSec * freq) * rotAmp;
          break;
        }
        case "MOTION_PULSE": {
          const scaleAmp = 0.1 * intensity;
          dScale *= 1 + Math.sin(timeSec * freq) * scaleAmp;
          break;
        }
        case "MOTION_ORBIT": {
          const rx = typeof p.radiusX === "number" ? p.radiusX : 40;
          const ry = typeof p.radiusY === "number" ? p.radiusY : 24;
          const phase = typeof p.phaseOffset === "number" ? p.phaseOffset : 0;
          dx += Math.cos(timeSec * freq + phase) * rx;
          dy += Math.sin(timeSec * freq + phase) * ry;
          break;
        }
        case "MOTION_DRIP": {
          const g = typeof p.gravity === "number" ? p.gravity : 0.5;
          const loop = (timeSec * speed * 100) % 200;
          dy += loop * g;
          break;
        }
        default:
          break;
      }
    });
  return { dx, dy, dRot, dScale };
};

export class SvgRenderer implements ISceneRenderer {
  private container: HTMLElement | null = null;
  private svg: SVGSVGElement | null = null;
  private parallaxEnabled = true;
  private playbackTimeMs = 0;
  private entityNodeMap: Map<string, SVGGElement> = new Map();
  private svgCache: Map<string, SVGElement> = new Map(); // Cache loaded SVG elements

  mount(container: HTMLElement): void {
    this.container = container;
    this.svg = createSvgElement("svg");
    this.svg.setAttribute("width", "100%");
    this.svg.setAttribute("height", "100%");
    this.svg.setAttribute("viewBox", "0 0 1024 1024");
    this.svg.style.background = "#05060c";
    container.innerHTML = "";
    container.appendChild(this.svg);
  }

  unmount(): void {
    if (this.container) {
      this.container.innerHTML = "";
    }
    this.svg = null;
    this.container = null;
  }

  setParallaxEnabled(enabled: boolean): void {
    this.parallaxEnabled = enabled;
  }

  handlePointerEvent(evt: PointerEvent): void {
    void evt; // Selection/transform handled by React layer for now.
  }

  private clear(): void {
    if (!this.svg) return;
    while (this.svg.firstChild) {
      this.svg.removeChild(this.svg.firstChild);
    }
    this.entityNodeMap.clear();
  }

  render(scene: ErrlScene): void {
    if (!this.svg) return;
    this.clear();
    const timeSec = this.playbackTimeMs / 1000;

    // Background planes (skip if transparent background is enabled)
    const transparentBg = (scene.background.params?.transparentBg as boolean) || false;
    if (!transparentBg) {
      const bgGroup = createSvgElement("g");
      const planes = scene.background.planes;
      const addPlane = (assetId?: string) => {
        if (!assetId) return;
        const def = getAssetById(assetId);
        if (!def) return;
        const img = createSvgElement("image");
        img.setAttribute("href", def.filePath);
        img.setAttribute("x", "0");
        img.setAttribute("y", "0");
        img.setAttribute("width", "1024");
        img.setAttribute("height", "1024");
        img.setAttribute("preserveAspectRatio", "xMidYMid slice");
        bgGroup.appendChild(img);
      };
      addPlane(planes.bgAssetId);
      addPlane(planes.mgAssetId);
      addPlane(planes.fgAssetId);
      this.svg.appendChild(bgGroup);
      
      // Also add background color if specified
      const bgColor = scene.background.params?.backgroundColor as string | undefined;
      if (bgColor) {
        const bgRect = createSvgElement("rect");
        bgRect.setAttribute("x", "0");
        bgRect.setAttribute("y", "0");
        bgRect.setAttribute("width", "1024");
        bgRect.setAttribute("height", "1024");
        bgRect.setAttribute("fill", bgColor);
        this.svg.insertBefore(bgRect, this.svg.firstChild);
      }
    }

    // Entities ordered by layer zIndex
    const layersSorted = sortLayers(scene.layers.filter((l) => l.visible));
    const entitiesSorted = sortEntities(
      scene.entities.filter((e) => {
        const layer = scene.layers.find((l) => l.id === e.layerId);
        return layer?.visible;
      }),
      layersSorted
    );

    entitiesSorted.forEach((entity) => {
      const def = getAssetById(entity.assetId);
      const g = createSvgElement("g");
      g.dataset.entityId = entity.id;
      g.style.pointerEvents = "auto";
      const { x, y, scaleX, scaleY, rotation, pivotX = 0.5, pivotY = 0.5 } = entity.transform;
      const motion = applyMotionOffsets(entity, timeSec);

      // Apply transform; without knowing intrinsic size, assume 1024 canvas with 0.5 pivot at center.
      const originX = 1024 * pivotX;
      const originY = 1024 * pivotY;
      const transform = [
        `translate(${x + motion.dx} ${y + motion.dy})`,
        `rotate(${rotation + motion.dRot})`,
        `scale(${scaleX * motion.dScale} ${scaleY * motion.dScale})`,
        `translate(${-originX} ${-originY})`,
      ].join(" ");
      g.setAttribute("transform", transform);
      g.setAttribute("opacity", entity.style.opacity?.toString() ?? "1");

      if (def) {
        // Ensure path is absolute (starts with /)
        const imagePath = def.filePath.startsWith('/') ? def.filePath : `/${def.filePath}`;
        
        // Check cache first - use cached SVG synchronously for smooth playback
        const cachedSvg = this.svgCache.get(def.id);
        if (cachedSvg) {
          // Clone cached SVG and append immediately
          const clonedSvg = cachedSvg.cloneNode(true) as SVGElement;
          g.appendChild(clonedSvg);
        } else {
          // Not in cache - add placeholder immediately, then fetch in background
          const placeholder = createSvgElement("rect");
          placeholder.setAttribute("x", "0");
          placeholder.setAttribute("y", "0");
          placeholder.setAttribute("width", "128");
          placeholder.setAttribute("height", "128");
          placeholder.setAttribute("fill", "rgba(52, 225, 255, 0.2)");
          placeholder.setAttribute("stroke", "rgba(52, 225, 255, 0.5)");
          placeholder.setAttribute("stroke-width", "2");
          g.appendChild(placeholder);
          
          // Fetch and cache for next render
          fetch(imagePath)
            .then(response => {
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
              }
              return response.text();
            })
            .then(svgContent => {
              // Parse the SVG content and extract the inner content
              const parser = new DOMParser();
              const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
              const svgElement = svgDoc.documentElement;
              
              // Check for parsing errors
              const parserError = svgElement.querySelector('parsererror');
              if (parserError) {
                throw new Error('SVG parsing failed');
              }
              
              // Clone the SVG element and configure it
              const clonedSvg = svgElement.cloneNode(true) as SVGElement;
              
              // Get the original viewBox or dimensions
              const originalViewBox = clonedSvg.getAttribute("viewBox");
              const originalWidth = clonedSvg.getAttribute("width") || "1024";
              const originalHeight = clonedSvg.getAttribute("height") || "1024";
              
              // Calculate 1/8th scale
              const scale = 1/8;
              const displaySize = 1024 * scale; // 128
              
              // Set display dimensions to 1/8th
              clonedSvg.setAttribute("width", displaySize.toString());
              clonedSvg.setAttribute("height", displaySize.toString());
              
              // Preserve the original viewBox if it exists, otherwise create one
              if (originalViewBox) {
                clonedSvg.setAttribute("viewBox", originalViewBox);
              } else {
                clonedSvg.setAttribute("viewBox", `0 0 ${originalWidth} ${originalHeight}`);
              }
              
              clonedSvg.setAttribute("preserveAspectRatio", "xMidYMid slice");
              clonedSvg.setAttribute("x", "0");
              clonedSvg.setAttribute("y", "0");
              
              // Remove any existing transform that might interfere
              clonedSvg.removeAttribute("transform");
              
              // Cache the configured SVG for future renders
              this.svgCache.set(def.id, clonedSvg);
              
              // Trigger a re-render by calling render again if we have the scene
              // The next render call will use the cached version
              if (this.svg && this.svg.parentElement) {
                // Re-render will happen on next frame via SceneViewport's useEffect
              }
              
              if (import.meta.env.DEV) {
                console.log(`✅ Loaded and cached: ${def.id} from ${imagePath}`);
              }
            })
            .catch(err => {
              const fullUrl = window.location.origin + imagePath;
              console.error(`❌ Failed to load asset: ${def.id}`, {
                assetId: def.id,
                filePath: def.filePath,
                imagePath: imagePath,
                fullUrl: fullUrl,
                error: err
              });
            });
        }
      } else {
        const rect = createSvgElement("rect");
        rect.setAttribute("x", "0");
        rect.setAttribute("y", "0");
        rect.setAttribute("width", "120");
        rect.setAttribute("height", "120");
        rect.setAttribute("fill", "#ff7ad1");
        g.appendChild(rect);
        const text = createSvgElement("text");
        text.textContent = entity.assetId;
        text.setAttribute("x", "0");
        text.setAttribute("y", "140");
        text.setAttribute("font-size", "24");
        text.setAttribute("fill", "#ffffff");
        g.appendChild(text);
      }

      this.entityNodeMap.set(entity.id, g);
      this.svg.appendChild(g);
    });
  }

  async renderToImage(opts: { width: number; height: number; transparentBg?: boolean }): Promise<string> {
    if (!this.svg) throw new Error("Renderer not mounted");
    // Ensure latest scene is rendered before export
    return exportSvgElementAsPng(this.svg, opts);
  }

  setPlaybackTime(ms: number): void {
    this.playbackTimeMs = ms;
  }
}

export const createSvgRenderer = () => new SvgRenderer();
