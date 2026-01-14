import { useEffect, useRef } from "react";
import { ISceneRenderer, SceneRendererFactory } from "./interface";
import { ErrlScene } from "../scene/types";

/**
 * useSceneRenderer
 *
 * Hook that wires a concrete ISceneRenderer implementation to a DOM container.
 *
 * Responsibilities:
 * - Allocate a renderer via the provided factory.
 * - Mount/unmount the renderer to/from `containerRef` lifecycle.
 * - Expose a `rendererRef` so React components can update playback time, re-render,
 *   or export via renderer methods.
 *
 * This hook does not own scene state; it just bridges React layout to the renderer.
 */

type UseSceneRendererOpts = {
  factory: SceneRendererFactory;
  scene: ErrlScene;
  parallaxEnabled?: boolean;
};

export const useSceneRenderer = ({ factory, scene, parallaxEnabled }: UseSceneRendererOpts) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<ISceneRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const renderer = factory();
    rendererRef.current = renderer;
    renderer.mount(containerRef.current);
    renderer.render(scene);
    if (typeof parallaxEnabled === "boolean") {
      renderer.setParallaxEnabled(parallaxEnabled);
    }
    return () => {
      renderer.unmount();
      rendererRef.current = null;
    };
  }, [factory]);

  useEffect(() => {
    rendererRef.current?.render(scene);
  }, [scene]);

  useEffect(() => {
    if (typeof parallaxEnabled === "boolean") {
      rendererRef.current?.setParallaxEnabled(parallaxEnabled);
    }
  }, [parallaxEnabled]);

  return { containerRef, rendererRef };
};
