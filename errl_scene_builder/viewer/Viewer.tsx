import React, { useEffect } from "react";
import { ErrlScene } from "../scene/types";
import { SceneViewport } from "../components/SceneViewport";
import { PlaybackControls } from "../components/PlaybackControls";
import { useSceneStore } from "../scene/store";
import { useLoaderData } from "react-router-dom";

/**
 * Read-only viewer shell. In a real app, load scene by shareId and render without editor chrome.
 */
export const Viewer: React.FC = () => {
  const loaderScene = useLoaderData() as ErrlScene;
  const setScene = useSceneStore((s) => s.setScene);
  useEffect(() => {
    if (loaderScene) setScene(loaderScene);
  }, [loaderScene, setScene]);

  return (
    <div className="min-h-screen bg-[#0c0e18] text-white flex flex-col">
      <div className="h-12 flex items-center px-4 border-b border-white/10 bg-white/5">
        <div className="font-semibold">{scene.name || "Shared Scene"}</div>
        <div className="ml-2 text-sm text-white/60">{scene.description || ""}</div>
      </div>
      <div className="flex-1 min-h-0">
        <SceneViewport />
      </div>
      <PlaybackControls />
    </div>
  );
};
