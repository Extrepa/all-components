import type { ThemeTokens, RGB, ToastType } from './types.ts';

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calculate relative luminance for WCAG contrast
 */
export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate WCAG contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number | null {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  if (!rgb1 || !rgb2) return null;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch (err2) {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Show toast notification
 */
export function showToast(message: string, type: ToastType = 'info'): void {
  const icons = {
    success: '✓',
    error: '✗',
    warning: '⚠',
    info: 'ℹ'
  };
  
  const colors = {
    success: 'var(--success)',
    error: 'var(--danger)',
    warning: 'var(--accent)',
    info: 'var(--accent)'
  };
  
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `
    <span style="color: ${colors[type]}; margin-right: 0.5rem; font-weight: bold;">${icons[type]}</span>
    <span>${message}</span>
  `;
  
  toast.style.cssText = `
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    background: var(--surface-alt);
    color: var(--text);
    padding: 0.75rem 1rem;
    border-radius: 0.5rem;
    border: 1px solid ${colors[type]};
    box-shadow: var(--shadow-soft);
    z-index: 1000;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    animation: toastSlideIn 0.3s ease-out;
    max-width: 400px;
  `;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s ease-out";
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, type === 'error' ? 4000 : 2000);
}

/**
 * Get computed theme tokens from CSS
 */
export function getComputedThemeTokens(themeId: string): ThemeTokens {
  const htmlEl = document.documentElement;
  const originalTheme = htmlEl.getAttribute("data-theme");
  htmlEl.setAttribute("data-theme", themeId);
  
  const style = getComputedStyle(htmlEl);
  const tokens: ThemeTokens = {
    bg: style.getPropertyValue("--bg").trim(),
    'bg-alt': style.getPropertyValue("--bg-alt").trim(),
    surface: style.getPropertyValue("--surface").trim(),
    'surface-alt': style.getPropertyValue("--surface-alt").trim(),
    border: style.getPropertyValue("--border").trim(),
    'border-soft': style.getPropertyValue("--border-soft").trim(),
    'border-gradient-from': style.getPropertyValue("--border-gradient-from").trim(),
    'border-gradient-to': style.getPropertyValue("--border-gradient-to").trim(),
    accent: style.getPropertyValue("--accent").trim(),
    'accent-soft': style.getPropertyValue("--accent-soft").trim(),
    'accent-alt': style.getPropertyValue("--accent-alt").trim(),
    'accent-boost': style.getPropertyValue("--accent-boost").trim(),
    danger: style.getPropertyValue("--danger").trim(),
    success: style.getPropertyValue("--success").trim(),
    text: style.getPropertyValue("--text").trim(),
    muted: style.getPropertyValue("--muted").trim(),
  };
  
  htmlEl.setAttribute("data-theme", originalTheme || '');
  
  return tokens;
}

