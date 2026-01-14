import { ErrlScene } from "../scene/types";

export interface ISceneRenderer {
  mount(container: HTMLElement): void;
  unmount(): void;
  render(scene: ErrlScene): void;
  setParallaxEnabled(enabled: boolean): void;
  handlePointerEvent(evt: PointerEvent): void;
  // Optional export hook; if not implemented, fall back to DOM-based export
  renderToImage?: (opts: { width: number; height: number; transparentBg?: boolean }) => Promise<string>;
  setPlaybackTime?: (ms: number) => void;
}

export type SceneRendererFactory = () => ISceneRenderer;
