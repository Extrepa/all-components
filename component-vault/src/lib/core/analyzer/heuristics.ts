export const COMPONENT_HEURISTICS = {
  NAV: { tags: ['nav', 'header'], keywords: ['navbar', 'menu', 'navigation'], roles: ['navigation'], minChildren: 2 },
  HERO: { tags: ['section', 'header', 'div'], keywords: ['hero', 'banner', 'intro'], minTextLength: 20 },
  CARD: { tags: ['article', 'div', 'li'], keywords: ['card', 'tile', 'item'], requiredChildren: ['img', 'h2', 'h3'] },
  BUTTON: { tags: ['button', 'a', 'input'], keywords: ['btn', 'button', 'cta'], roles: ['button'], maxLength: 50 },
  FOOTER: { tags: ['footer'], keywords: ['footer', 'copyright'], roles: ['contentinfo'] },
};
export type ComponentType = keyof typeof COMPONENT_HEURISTICS;
