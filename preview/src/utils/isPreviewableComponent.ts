export const UI_PATH_KEYWORDS = [
  '/components/',
  '/component/',
  '/ui/',
  '/screens/',
  '/screen/',
  '/views/',
  '/view/',
  '/panels/',
  '/panel/',
  '/widgets/',
  '/widget/',
  '/layouts/',
  '/layout/',
  '/modals/',
  '/modal/',
  '/dialogs/',
  '/dialog/',
  '/overlays/',
  '/overlay/',
  '/controls/',
  '/control/',
  '/forms/',
  '/form/',
  '/inputs/',
  '/input/',
  '/buttons/',
  '/button/',
  '/menus/',
  '/menu/',
  '/nav/',
  '/navbar/',
  '/sidebar/',
  '/header/',
  '/footer/',
  '/toolbar/',
  '/dock/',
  '/tray/'
];

export const UI_NAME_KEYWORDS = [
  'button', 'card', 'input', 'field', 'form', 'modal', 'dialog', 'panel', 'menu',
  'toolbar', 'header', 'footer', 'sidebar', 'nav', 'navbar', 'tabs', 'tab',
  'inspector', 'ruler', 'rulers',
  'list', 'grid', 'table', 'toast', 'tooltip', 'dropdown', 'select',
  'checkbox', 'radio', 'switch', 'slider', 'pagination', 'breadcrumb',
  'avatar', 'badge', 'chip', 'pill', 'tag', 'drawer', 'sheet', 'popover',
  'overlay', 'banner', 'carousel', 'dock', 'tray'
];

export function isPreviewableComponent(pathName: string, componentName: string): boolean {
  const normalizedPath = `/${pathName.replace(/\\/g, '/').toLowerCase()}`;
  const normalizedName = componentName.toLowerCase();

  if (normalizedName.startsWith('._')) {
    return false;
  }

  if (normalizedPath.includes('/tests/') || normalizedPath.includes('/__tests__/') || normalizedPath.includes('/spec/')) {
    return false;
  }

  if (normalizedName.endsWith('.spec') || normalizedName.endsWith('.test')) {
    return false;
  }

  if (UI_PATH_KEYWORDS.some((keyword) => normalizedPath.includes(keyword))) {
    return true;
  }

  return UI_NAME_KEYWORDS.some((keyword) => normalizedName.includes(keyword));
}
