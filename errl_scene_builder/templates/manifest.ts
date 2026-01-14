import { ErrlScene, createBaseScene, importScene } from "../scene/types";

export type TemplateSummary = {
  id: string;
  label: string;
  description: string;
  path: string;
};

export const templateSummaries: TemplateSummary[] = [
  { id: "LAB_INTRO", label: "Lab Intro", description: "Starter lab with Errl head and projector space", path: "/templates/LAB_INTRO.json" },
  { id: "GRANDMA_TV", label: "Grandma TV Shrine", description: "Cozy room with happy Errl and TV", path: "/templates/GRANDMA_TV.json" },
  { id: "FESTIVAL_STAGE", label: "Festival Stage", description: "Outdoor stage with flags and riser", path: "/templates/FESTIVAL_STAGE.json" },
  { id: "VOID_ORBS", label: "Void Orbs", description: "Minimal void with orbs and sparkles", path: "/templates/VOID_ORBS.json" },
  { id: "SHRINE_ALTAR", label: "Shrine Altar", description: "Ceremonial altar with halo and candles", path: "/templates/SHRINE_ALTAR.json" },
];

export const loadTemplate = async (summary: TemplateSummary): Promise<ErrlScene> => {
  const res = await fetch(summary.path);
  const text = await res.text();
  const scene = importScene(text);
  scene.id = "scene_" + Math.random().toString(36).slice(2, 8);
  scene.isTemplate = false;
  scene.createdAt = new Date().toISOString();
  scene.updatedAt = scene.createdAt;
  return scene;
};

export const createBlankScene = (): ErrlScene => createBaseScene({ name: "Blank Scene" });
