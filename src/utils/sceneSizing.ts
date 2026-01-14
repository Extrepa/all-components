import type { Asset, Project, SceneObject } from '../state/types';
import { getBoundingBox } from './measurementUtils';

const DEFAULT_SIZE = { width: 100, height: 100 };

const getSvgSize = (svg: string): { width: number; height: number } => {
  const bounds = getBoundingBox(svg);
  if (!bounds) return DEFAULT_SIZE;
  const width = bounds.width || DEFAULT_SIZE.width;
  const height = bounds.height || DEFAULT_SIZE.height;
  return { width, height };
};

export const getAssetDimensions = (asset?: Asset): { width: number; height: number } => {
  if (!asset) return DEFAULT_SIZE;
  if (asset.type !== 'svg') return DEFAULT_SIZE;
  return getSvgSize(asset.data);
};

export const getObjectDimensions = (
  object: SceneObject,
  project: Project
): { width: number; height: number } => {
  const component = project.library.components.find((c) => c.id === object.ref);
  const asset = component
    ? project.library.assets.find((a) => a.id === component.base_asset)
    : project.library.assets.find((a) => a.id === object.ref);
  if (!asset) return DEFAULT_SIZE;

  if (object.current_state && asset.states) {
    const state = asset.states.find((s) => s.name === object.current_state);
    if (state) {
      return getSvgSize(state.data);
    }
  }

  return getAssetDimensions(asset);
};
