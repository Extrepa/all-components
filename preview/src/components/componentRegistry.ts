type ModuleLoader = () => Promise<Record<string, any>>;

const rawRegistry: Record<string, ModuleLoader> = {
  ...import.meta.glob('../../../component-vault/src/components/**/*.{tsx,jsx}', { eager: false }),
  ...import.meta.glob('../../../svg_editor/src/**/*.{tsx,jsx}', { eager: false }),
  ...import.meta.glob('../../../errl_scene_builder/src/**/*.{tsx,jsx}', { eager: false }),
  ...import.meta.glob('../../../errl-club-ui/**/*.{js,jsx,tsx}', { eager: false }),
  ...import.meta.glob('../../../figma-clone-engine/src/**/*.{tsx,jsx}', { eager: false }),
};

const registryEntries = Object.entries(rawRegistry).map(([key, loader]) => ({
  key,
  loader,
  normalizedKey: normalizeRegistryKey(key),
}));

function normalizeRegistryKey(key: string): string {
  let normalized = key.replace(/\\/g, '/');
  normalized = normalized.replace(/^\/@fs\//, '/');
  return normalized.toLowerCase();
}

function normalizeComponentTarget(projectName: string, componentPath: string): string {
  const normalizedPath = componentPath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `/${projectName}/${normalizedPath}`.toLowerCase();
}

export function getRegistryKey(projectName: string, componentPath: string): string {
  const normalizedPath = componentPath.replace(/\\/g, '/').replace(/^\/+/, '');
  return `../../../${projectName}/${normalizedPath}`;
}

export function findComponentLoader(projectName: string, componentPath: string): ModuleLoader | null {
  const registryKey = getRegistryKey(projectName, componentPath);
  let loader = rawRegistry[registryKey] || rawRegistry[registryKey.replace(/\\/g, '/')];
  if (loader) return loader;

  const normalizedTarget = normalizeComponentTarget(projectName, componentPath);
  const match = registryEntries.find((entry) => entry.normalizedKey.endsWith(normalizedTarget));
  if (match) return match.loader;

  const containsMatch = registryEntries.find((entry) => entry.normalizedKey.includes(normalizedTarget));
  return containsMatch ? containsMatch.loader : null;
}

export { rawRegistry as componentRegistry };
