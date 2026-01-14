/**
 * Theme Lab - Main Application
 * TypeScript implementation of the Theme Lab design system playground
 */

import { THEMES, PRESETS_KEY } from './constants.js';
import type { CodeSnippetFormat, ValidationResults, ValidationIssue, Preset, LayoutState, ShareData, TokenControl } from './types.js';
import { getComputedThemeTokens, copyToClipboard, showToast, getContrastRatio } from './utils.js';

// DOM Elements - with null checks
const htmlEl = document.documentElement;

function getElementByIdSafe<T extends HTMLElement>(id: string): T | null {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element with id "${id}" not found`);
    return null;
  }
  return element as T;
}

// Initialize DOM elements after DOM is ready
let themeListEl: HTMLElement | null = null;
let randomBtn: HTMLButtonElement | null = null;
let themeSearchInput: HTMLInputElement | null = null;

function initDOMElements(): void {
  themeListEl = getElementByIdSafe<HTMLElement>("themeList");
  randomBtn = getElementByIdSafe<HTMLButtonElement>("randomTheme");
  themeSearchInput = getElementByIdSafe<HTMLInputElement>("themeSearch");
  
  // Don't return early - some elements might be in tabs that aren't loaded yet
  if (!randomBtn) {
    console.warn("Random button not found");
  }
  if (!themeSearchInput) {
    console.warn("Theme search input not found");
  }
}

// Theme Management
function setTheme(id: string): void {
  htmlEl.setAttribute("data-theme", id);
  // Update active state in theme list
  const themesTab = document.getElementById('themes-tab');
  const listContainer = themesTab?.querySelector('#themeList') as HTMLElement || themeListEl;
  if (listContainer) {
    Array.from(listContainer.children).forEach((btn) => {
      const element = btn as HTMLElement;
      if (element.dataset.themeId) {
        element.classList.toggle("theme-item-active", element.dataset.themeId === id);
      }
    });
  }
}

function buildThemeList(filter: string = ''): void {
  // Get the correct container - prefer themes tab (most reliable), then themeListEl, then fallback
  const themesTab = document.getElementById('themes-tab');
  let listContainer: HTMLElement | null = null;
  
  // First try: themes tab container (most reliable)
  if (themesTab) {
    listContainer = themesTab.querySelector('#themeList') as HTMLElement | null;
  }
  
  // Second try: use cached themeListEl if it exists
  if (!listContainer && themeListEl) {
    listContainer = themeListEl;
  }
  
  // Third try: find it anywhere in the document
  if (!listContainer) {
    listContainer = document.getElementById('themeList') as HTMLElement | null;
  }
  
  if (!listContainer) {
    console.error('Theme list container not found. Themes tab:', themesTab, 'themeListEl:', themeListEl);
    // Try again after a short delay - but only retry once to avoid infinite loops
    if (!(window as any).__themeListRetryCount) {
      (window as any).__themeListRetryCount = 0;
    }
    if ((window as any).__themeListRetryCount < 3) {
      (window as any).__themeListRetryCount++;
      setTimeout(() => {
        buildThemeList(filter);
      }, 100);
    } else {
      console.error('Theme list container not found after multiple retries');
    }
    return;
  }
  
  // Reset retry count on success
  (window as any).__themeListRetryCount = 0;
  
  // Update themeListEl to point to the found container
  if (listContainer !== themeListEl) {
    themeListEl = listContainer;
  }
  
  // Clear existing content
  listContainer.innerHTML = '';
  
  // Filter themes
  const filtered = THEMES.filter(theme => {
    if (!filter) return true;
    const searchTerm = filter.toLowerCase();
    return theme.label.toLowerCase().includes(searchTerm) ||
           theme.id.toLowerCase().includes(searchTerm);
  });
  
  // Create theme buttons
  filtered.forEach((theme) => {
    try {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.themeId = theme.id;
      btn.className = "theme-item";
      
      // Get theme tokens and apply them as inline styles to preview the theme
      const themeTokens = getComputedThemeTokens(theme.id);
      
      // Apply theme colors to the button
      btn.style.background = `linear-gradient(120deg, ${themeTokens.surface}, ${themeTokens['surface-alt']})`;
      btn.style.borderColor = themeTokens.border;
      btn.style.color = themeTokens.text;
      btn.style.borderWidth = '1px';
      btn.style.borderStyle = 'solid';
      
      // Create dot with theme accent colors
      const dotStyle = `background: radial-gradient(circle at 20% 0%, ${themeTokens['accent-boost']}, ${themeTokens.accent}); box-shadow: 0 0 8px ${themeTokens.accent}40;`;
      
      btn.innerHTML = `<span class="theme-dot" style="${dotStyle}"></span><span>${theme.label}</span>`;
      
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        setTheme(theme.id);
        if (filter) {
          if (themeSearchInput) {
            themeSearchInput.value = '';
          }
          buildThemeList('');
        }
      });
      
      listContainer.appendChild(btn);
    } catch (error) {
      console.error(`Error creating theme button for ${theme.id}:`, error);
    }
  });
  
  if (filtered.length === 0) {
    const noResults = document.createElement("div");
    noResults.className = "theme-no-results";
    noResults.textContent = `No themes found${filter ? ` matching "${filter}"` : ''}`;
    listContainer.appendChild(noResults);
  }
  
  // Update active state
  const currentTheme = htmlEl.getAttribute("data-theme");
  if (currentTheme) {
    setTheme(currentTheme);
  }
  
  console.log(`Built theme list: ${filtered.length} themes displayed`);
}

// Initialize app when DOM is ready - ensure it runs after script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializeApp, 0);
  });
} else {
  setTimeout(initializeApp, 0);
}

// Initialize everything when DOM is ready
function initializeApp(): void {
  console.log('Initializing app...');
  initDOMElements();
  
  // Initialize tab switching FIRST to ensure tabs are set up correctly
  initTabSwitching();
  
  // Ensure themes tab is visible and active
  const themesTab = getElementByIdSafe<HTMLElement>('themes-tab');
  if (themesTab) {
    themesTab.classList.add('active');
    // Force display to ensure visibility
    (themesTab as HTMLElement).style.display = 'flex';
  }
  
  // Initialize theme list - use themes tab container
  const themeListContainer = themesTab?.querySelector('#themeList') as HTMLElement;
  if (themeListContainer) {
    // Update themeListEl to point to the correct container
    themeListEl = themeListContainer;
    console.log('Theme list container found in themes tab');
  } else {
    // Fallback to original location if themes tab doesn't exist
    themeListEl = getElementByIdSafe<HTMLElement>("themeList");
    if (themeListEl) {
      console.log('Theme list container found in original location');
    } else {
      console.warn("Theme list container not found in initial attempt");
    }
  }
  
  // Build theme list - this will retry if container not found
  if (themeListEl) {
    console.log('Building theme list...');
    buildThemeList();
  } else {
    console.error("Theme list container not found, retrying...");
    // Retry after a short delay to ensure DOM is ready
    setTimeout(() => {
      const retryTab = document.getElementById('themes-tab');
      const retryContainer = retryTab?.querySelector('#themeList') as HTMLElement;
      if (retryContainer) {
        themeListEl = retryContainer;
        console.log('Theme list container found on retry');
        buildThemeList();
      } else {
        console.error("Theme list container still not found after retry");
        // Final fallback - try to find it anywhere
        const fallback = document.getElementById('themeList');
        if (fallback) {
          themeListEl = fallback;
          console.log('Theme list container found in fallback');
          buildThemeList();
        }
      }
    }, 200);
  }
  
  // Theme search
  if (themeSearchInput) {
    themeSearchInput.addEventListener("input", (e) => {
      const target = e.target as HTMLInputElement;
      buildThemeList(target.value);
    });
  } else {
    // Try to get it again in case it wasn't ready
    setTimeout(() => {
      themeSearchInput = getElementByIdSafe<HTMLInputElement>("themeSearch");
      if (themeSearchInput) {
        themeSearchInput.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          buildThemeList(target.value);
        });
      }
    }, 100);
  }
  
  // Set default theme
  setTheme("errl-core");
  
  // Random theme - ensure it works
  if (!randomBtn) {
    randomBtn = getElementByIdSafe<HTMLButtonElement>("randomTheme");
  }
  if (randomBtn) {
    // Remove any existing listeners
    const newRandomBtn = randomBtn.cloneNode(true) as HTMLButtonElement;
    randomBtn.parentNode?.replaceChild(newRandomBtn, randomBtn);
    randomBtn = newRandomBtn;
    
    randomBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = Math.floor(Math.random() * THEMES.length);
      setTheme(THEMES[idx].id);
      showToast(`Random theme: ${THEMES[idx].label}`, "info");
    });
  } else {
    console.error("Random button not found after retry");
  }
  
  // Initialize all button event listeners
  initAllButtonListeners();
}

// Initialize all button event listeners with null checks
function initAllButtonListeners(): void {
  // Modal buttons
  const openModalBtn = getElementByIdSafe<HTMLButtonElement>("openModal");
  const closeModalBtn = getElementByIdSafe<HTMLButtonElement>("closeModal");
  const modalBackdrop = getElementByIdSafe<HTMLElement>("modalBackdrop");
  
  if (openModalBtn && closeModalBtn && modalBackdrop) {
    function closeModal(): void {
      if (modalBackdrop) {
        modalBackdrop.hidden = true;
      }
    }
    
    openModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      modalBackdrop.hidden = false;
    });
    
    closeModalBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      closeModal();
    });
    
    modalBackdrop.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) {
        closeModal();
      }
    });
    
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !modalBackdrop.hidden) {
        closeModal();
      }
    });
    
    const modal = modalBackdrop.querySelector(".modal");
    if (modal) {
      modal.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

// Collapsible sidebar sections
function setupCollapsibleSections(): void {
  const sectionToggles = document.querySelectorAll('.sidebar-section-toggle');
  
  sectionToggles.forEach(toggle => {
    const element = toggle as HTMLElement;
    const sectionId = element.dataset.section;
    if (!sectionId) return;
    
    const content = document.getElementById(`${sectionId}-section`) as HTMLElement;
    
    if (content) {
      // Default to expanded
      element.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
      
      element.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const isExpanded = element.getAttribute('aria-expanded') === 'true';
        const newState = !isExpanded;
        
        element.setAttribute('aria-expanded', String(newState));
        content.setAttribute('aria-hidden', String(!newState));
      });
    }
  });
}

  // Initialize collapsible sections (if any remain)
  setupCollapsibleSections();
  
  // Initialize layout controls
  initLayoutControls();
  
  // Initialize layout controls
  initLayoutControls();
  
  // Initialize layout controls
  initLayoutControls();
  
  // Export buttons
  const exportThemeBtn = getElementByIdSafe<HTMLButtonElement>("exportTheme");
  if (exportThemeBtn) {
    exportThemeBtn.addEventListener("click", () => {
      const themeId = getCurrentThemeId();
      const json = getThemeAsJSON(themeId);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${themeId}-theme.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast("Theme exported!", "success");
    });
  }
  
  const copyThemeBtn = getElementByIdSafe<HTMLButtonElement>("copyTheme");
  if (copyThemeBtn) {
    copyThemeBtn.addEventListener("click", async () => {
      const themeId = getCurrentThemeId();
      const css = getThemeAsCSS(themeId);
      const success = await copyToClipboard(css);
      if (success) {
        showToast("Theme CSS copied to clipboard!", "success");
      } else {
        showToast("Failed to copy. Check browser permissions.", "error");
      }
    });
  }
  
  // Code snippet dropdown
  initCodeSnippetDropdown();
  
  // Theme action buttons
  const editThemeBtn = getElementByIdSafe<HTMLButtonElement>("editTheme");
  if (editThemeBtn) {
    editThemeBtn.addEventListener("click", showThemeEditor);
  }
  
  const validateThemeBtn = getElementByIdSafe<HTMLButtonElement>("validateTheme");
  if (validateThemeBtn) {
    validateThemeBtn.addEventListener("click", () => {
      const themeId = getCurrentThemeId();
      const results = validateTheme(themeId);
      showValidationResults(results);
    });
  }
  
  const compareThemesBtn = getElementByIdSafe<HTMLButtonElement>("compareThemes");
  if (compareThemesBtn) {
    compareThemesBtn.addEventListener("click", showThemeComparison);
  }
  
  const showTokenReferenceBtn = getElementByIdSafe<HTMLButtonElement>("showTokenReference");
  if (showTokenReferenceBtn) {
    showTokenReferenceBtn.addEventListener("click", showTokenReference);
  }
  
  const importThemeBtn = getElementByIdSafe<HTMLButtonElement>("importTheme");
  if (importThemeBtn) {
    importThemeBtn.addEventListener("click", showImportDialog);
  }
  
  const shareThemeBtn = getElementByIdSafe<HTMLButtonElement>("shareTheme");
  if (shareThemeBtn) {
    shareThemeBtn.addEventListener("click", shareTheme);
  }
  
  const savePresetBtn = getElementByIdSafe<HTMLButtonElement>("savePreset");
  if (savePresetBtn) {
    savePresetBtn.addEventListener("click", showSavePresetDialog);
  }
  
  const componentPlaygroundBtn = getElementByIdSafe<HTMLButtonElement>("componentPlayground");
  if (componentPlaygroundBtn) {
    componentPlaygroundBtn.addEventListener("click", showComponentPlayground);
  }
  
  const animationPlaygroundBtn = getElementByIdSafe<HTMLButtonElement>("animationPlayground");
  if (animationPlaygroundBtn) {
    animationPlaygroundBtn.addEventListener("click", showAnimationPlayground);
  }
  
  // Initialize token controls
  initTokenControls();
  
  // Tab switching is already initialized in initializeApp() - don't call again
  
  // Load shared theme from URL
  loadSharedTheme();
}

// Tab switching functionality
function initTabSwitching(): void {
  console.log('Initializing tab switching...');
  const tabs = document.querySelectorAll('.sidebar-tab');
  const tabContents = document.querySelectorAll('.sidebar-tab-content');
  
  console.log(`Found ${tabs.length} tabs and ${tabContents.length} tab contents`);
  
  // Ensure initial active tab is visible
  const activeTab = document.querySelector('.sidebar-tab.active') as HTMLElement;
  if (activeTab) {
    const tabId = activeTab.dataset.tab;
    console.log(`Initial active tab: ${tabId}`);
    if (tabId) {
      const content = document.getElementById(`${tabId}-tab`);
      if (content) {
        content.classList.add('active');
        // Force display to ensure visibility
        (content as HTMLElement).style.display = 'flex';
        console.log(`Activated content for tab: ${tabId}`);
      } else {
        console.warn(`Content not found for tab: ${tabId}`);
      }
    }
  } else {
    // If no active tab, make the first one active
    const firstTab = tabs[0] as HTMLElement;
    if (firstTab) {
      firstTab.classList.add('active');
      const tabId = firstTab.dataset.tab;
      if (tabId) {
        const content = document.getElementById(`${tabId}-tab`);
        if (content) {
          content.classList.add('active');
          (content as HTMLElement).style.display = 'flex';
          console.log(`Set first tab as active: ${tabId}`);
        }
      }
    }
  }
  
  // Remove any existing event listeners by cloning nodes
  tabs.forEach((tab) => {
    const tabElement = tab as HTMLElement;
    const newTab = tabElement.cloneNode(true) as HTMLElement;
    tabElement.parentNode?.replaceChild(newTab, tabElement);
    
    // Add click event listener
    newTab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const tabId = newTab.dataset.tab;
      console.log(`Tab clicked: ${tabId}`);
      
      if (!tabId) {
        console.warn('Tab missing data-tab attribute');
        return;
      }
      
      // Remove active from all tabs and contents
      document.querySelectorAll('.sidebar-tab').forEach(t => {
        t.classList.remove('active');
      });
      document.querySelectorAll('.sidebar-tab-content').forEach(content => {
        content.classList.remove('active');
        (content as HTMLElement).style.display = 'none';
      });
      
      // Add active to clicked tab and corresponding content
      newTab.classList.add('active');
      const content = document.getElementById(`${tabId}-tab`);
      if (content) {
        content.classList.add('active');
        (content as HTMLElement).style.display = 'flex';
        console.log(`Switched to tab: ${tabId}`);
        
        // If switching to themes tab, rebuild theme list to ensure it's visible
        if (tabId === 'themes' && themeListEl) {
          const currentFilter = themeSearchInput?.value || '';
          buildThemeList(currentFilter);
        }
      } else {
        console.warn(`Content not found for tab: ${tabId}`);
      }
    });
  });
  
  console.log('Tab switching initialized');
}

// Token Controls System
const TOKEN_CONTROLS: TokenControl[] = [
  // Spacing Controls
  { name: 'Sidebar Width', token: '--layout-sidebar-width', type: 'range', min: 200, max: 400, step: 10, default: 280, unit: 'px', category: 'Spacing' },
  { name: 'Sidebar Padding', token: '--layout-sidebar-padding', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1, unit: 'rem', category: 'Spacing' },
  { name: 'Preview Padding', token: '--layout-preview-padding', type: 'range', min: 0.5, max: 3, step: 0.1, default: 1.5, unit: 'rem', category: 'Spacing' },
  { name: 'Preview Gap', token: '--layout-preview-gap', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1.25, unit: 'rem', category: 'Spacing' },
  { name: 'Card Padding X', token: '--layout-card-padding-x', type: 'range', min: 0.5, max: 2, step: 0.1, default: 1, unit: 'rem', category: 'Spacing' },
  { name: 'Card Padding Y', token: '--layout-card-padding-y', type: 'range', min: 0.5, max: 2, step: 0.1, default: 0.8, unit: 'rem', category: 'Spacing' },
  { name: 'Card Gap', token: '--layout-card-gap', type: 'range', min: 0.25, max: 1.5, step: 0.05, default: 0.7, unit: 'rem', category: 'Spacing' },
  
  // Border Controls
  { name: 'Border Width', token: '--border-width', type: 'range', min: 0, max: 4, step: 0.5, default: 1, unit: 'px', category: 'Borders' },
  { name: 'Border', token: '--border', type: 'color', default: '#163a4a', category: 'Borders' },
  { name: 'Border Soft', token: '--border-soft', type: 'color', default: '#0c2732', category: 'Borders' },
  { name: 'Gradient From', token: '--border-gradient-from', type: 'color', default: '#34e1ff', category: 'Borders' },
  { name: 'Gradient To', token: '--border-gradient-to', type: 'color', default: '#ff34f5', category: 'Borders' },
  
  // Border Radius Controls
  { name: 'Radius Small', token: '--radius-sm', type: 'range', min: 0, max: 1, step: 0.1, default: 0.4, unit: 'rem', category: 'Radius' },
  { name: 'Radius Medium', token: '--radius-md', type: 'range', min: 0, max: 1.5, step: 0.1, default: 0.8, unit: 'rem', category: 'Radius' },
  { name: 'Radius Large', token: '--radius-lg', type: 'range', min: 0, max: 2, step: 0.1, default: 1.2, unit: 'rem', category: 'Radius' },
  { name: 'Card Radius', token: '--border-radius-card', type: 'range', min: 0, max: 2, step: 0.1, default: 1.2, unit: 'rem', category: 'Radius' },
  
  // Transition Controls
  { name: 'Transition Fast', token: '--transition-fast', type: 'range', min: 50, max: 300, step: 10, default: 150, unit: 'ms', category: 'Transitions' },
  { name: 'Transition Medium', token: '--transition-med', type: 'range', min: 100, max: 500, step: 10, default: 220, unit: 'ms', category: 'Transitions' },
];

// Store original values for reset
const originalTokenValues: Map<string, string> = new Map();
let tokenOverridesStyle: HTMLStyleElement | null = null;

function getComputedTokenValue(token: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim();
}

function updateTokenValue(token: string, value: string): void {
  // Update directly on root for immediate real-time effect
  document.documentElement.style.setProperty(token, value);
  
  // Also store in style element for export
  if (!tokenOverridesStyle) {
    tokenOverridesStyle = document.createElement('style');
    tokenOverridesStyle.id = 'token-overrides';
    document.head.appendChild(tokenOverridesStyle);
  }
  
  const currentRules = tokenOverridesStyle.textContent || '';
  const tokenRegex = new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*[^;]+;?`, 'g');
  const newRule = `${token}: ${value};`;
  
  if (currentRules.includes(token)) {
    tokenOverridesStyle.textContent = currentRules.replace(tokenRegex, newRule);
  } else {
    const rootMatch = currentRules.match(/:root\s*\{([^}]*)\}/);
    if (rootMatch) {
      tokenOverridesStyle.textContent = currentRules.replace(/:root\s*\{([^}]*)\}/, `:root {\n  ${newRule}\n$1}`);
    } else {
      tokenOverridesStyle.textContent = (currentRules ? currentRules + '\n' : '') + `:root {\n  ${newRule}\n}`;
    }
  }
}

function resetTokenValue(token: string): void {
  const original = originalTokenValues.get(token);
  if (original !== undefined) {
    updateTokenValue(token, original);
  } else {
    // Remove override to use default
    if (tokenOverridesStyle) {
      const tokenRegex = new RegExp(`${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\s*[^;]+;?`, 'g');
      tokenOverridesStyle.textContent = (tokenOverridesStyle.textContent || '').replace(tokenRegex, '');
    }
    document.documentElement.style.removeProperty(token);
  }
}

function resetAllTokens(): void {
  TOKEN_CONTROLS.forEach(control => {
    resetTokenValue(control.token);
    const input = document.querySelector(`[data-token="${control.token}"]`) as HTMLInputElement;
    if (input) {
      if (control.type === 'range') {
        input.value = String(control.default);
        const valueDisplay = input.parentElement?.querySelector('.token-value-display');
        if (valueDisplay) {
          valueDisplay.textContent = `${control.default}${control.unit || ''}`;
        }
      } else if (control.type === 'color') {
        input.value = String(control.default);
      }
    }
  });
  showToast('All tokens reset to defaults', 'success');
}

function exportTokenChanges(): void {
  const changes: string[] = [];
  TOKEN_CONTROLS.forEach(control => {
    const input = document.querySelector(`[data-token="${control.token}"]`) as HTMLInputElement;
    if (input) {
      const currentValue = control.type === 'range' ? input.value + (control.unit || '') : input.value;
      const original = originalTokenValues.get(control.token) || String(control.default);
      if (currentValue !== original) {
        changes.push(`  ${control.token}: ${currentValue};`);
      }
    }
  });
  
  if (changes.length === 0) {
    showToast('No token changes to export', 'info');
    return;
  }
  
  const css = `:root {\n${changes.join('\n')}\n}`;
  copyToClipboard(css).then(success => {
    if (success) {
      showToast('Token changes copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy. Check browser permissions.', 'error');
    }
  });
}

function initTokenControls(): void {
  const container = getElementByIdSafe<HTMLElement>('tokenControlsContainer');
  if (!container) {
    console.warn('Token controls container not found');
    return;
  }
  
  // Store original values
  TOKEN_CONTROLS.forEach(control => {
    const computed = getComputedTokenValue(control.token);
    originalTokenValues.set(control.token, computed || String(control.default));
  });
  
  // Group by category
  const categories = new Map<string, TokenControl[]>();
  TOKEN_CONTROLS.forEach(control => {
    if (!categories.has(control.category)) {
      categories.set(control.category, []);
    }
    categories.get(control.category)!.push(control);
  });
  
  container.innerHTML = '';
  
  categories.forEach((controls, category) => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'token-category';
    categoryDiv.style.marginBottom = '1rem';
    
    const categoryTitle = document.createElement('div');
    categoryTitle.className = 'token-category-title';
    categoryTitle.textContent = category;
    categoryTitle.style.cssText = 'font-size: 0.75rem; font-weight: 600; color: var(--accent); margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;';
    categoryDiv.appendChild(categoryTitle);
    
    controls.forEach(control => {
      const controlDiv = document.createElement('div');
      controlDiv.className = 'token-control';
      controlDiv.style.marginBottom = '0.75rem';
      
      const label = document.createElement('label');
      label.className = 'token-control-label';
      label.style.cssText = 'display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 0.25rem;';
      label.textContent = control.name;
      controlDiv.appendChild(label);
      
      const inputWrapper = document.createElement('div');
      inputWrapper.style.cssText = 'display: flex; align-items: center; gap: 0.5rem;';
      
      if (control.type === 'range') {
        const input = document.createElement('input');
        input.type = 'range';
        input.min = String(control.min);
        input.max = String(control.max);
        input.step = String(control.step);
        input.value = String(control.default);
        input.dataset.token = control.token;
        input.style.cssText = 'flex: 1;';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'token-value-display';
        valueDisplay.style.cssText = 'font-size: 0.7rem; color: var(--text); min-width: 3.5rem; text-align: right; font-family: monospace;';
        // For transitions, show the full value with timing function
        const displayValue = control.token.includes('transition')
          ? `${control.default}${control.unit || ''} ease-out`
          : `${control.default}${control.unit || ''}`;
        valueDisplay.textContent = displayValue;
        
        input.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          // For transitions, append "ease-out" timing function
          const displayValue = control.token.includes('transition') 
            ? `${value}${control.unit || ''} ease-out`
            : `${value}${control.unit || ''}`;
          valueDisplay.textContent = displayValue;
          updateTokenValue(control.token, displayValue);
        });
        
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(valueDisplay);
      } else if (control.type === 'color') {
        const input = document.createElement('input');
        input.type = 'color';
        input.value = String(control.default);
        input.dataset.token = control.token;
        input.style.cssText = 'width: 2.5rem; height: 2rem; border: 1px solid var(--border-soft); border-radius: 0.25rem; cursor: pointer;';
        
        const valueDisplay = document.createElement('span');
        valueDisplay.className = 'token-value-display';
        valueDisplay.style.cssText = 'font-size: 0.7rem; color: var(--text); flex: 1; font-family: monospace;';
        valueDisplay.textContent = String(control.default);
        
        input.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          const value = target.value;
          valueDisplay.textContent = value;
          updateTokenValue(control.token, value);
        });
        
        inputWrapper.appendChild(input);
        inputWrapper.appendChild(valueDisplay);
      }
      
      const resetBtn = document.createElement('button');
      resetBtn.className = 'btn btn-sm btn-ghost';
      resetBtn.textContent = '↺';
      resetBtn.title = 'Reset to default';
      resetBtn.style.cssText = 'padding: 0.25rem 0.5rem; font-size: 0.7rem;';
      resetBtn.addEventListener('click', () => {
        resetTokenValue(control.token);
        const input = controlDiv.querySelector(`[data-token="${control.token}"]`) as HTMLInputElement;
        if (input) {
          if (control.type === 'range') {
            input.value = String(control.default);
            const valueDisplay = input.parentElement?.querySelector('.token-value-display');
            if (valueDisplay) {
              const displayValue = control.token.includes('transition')
                ? `${control.default}${control.unit || ''} ease-out`
                : `${control.default}${control.unit || ''}`;
              valueDisplay.textContent = displayValue;
            }
          } else if (control.type === 'color') {
            input.value = String(control.default);
            const valueDisplay = input.parentElement?.querySelector('.token-value-display');
            if (valueDisplay) {
              valueDisplay.textContent = String(control.default);
            }
          }
        }
      });
      
      inputWrapper.appendChild(resetBtn);
      controlDiv.appendChild(inputWrapper);
      categoryDiv.appendChild(controlDiv);
    });
    
    container.appendChild(categoryDiv);
  });
  
  // Reset all button
  const resetAllBtn = getElementByIdSafe<HTMLButtonElement>('resetAllTokens');
  if (resetAllBtn) {
    resetAllBtn.addEventListener('click', resetAllTokens);
  }
  
  // Export changes button
  const exportBtn = getElementByIdSafe<HTMLButtonElement>('exportTokenChanges');
  if (exportBtn) {
    exportBtn.addEventListener('click', exportTokenChanges);
  }
}

// Layout Controls
function setLayout(attribute: string, value: string): void {
  htmlEl.setAttribute(`data-${attribute}`, value);
  
  const layoutToggles = document.querySelectorAll(".layout-toggle");
  layoutToggles.forEach((toggle) => {
    const element = toggle as HTMLElement;
    if (element.dataset.layout === attribute) {
      element.setAttribute("aria-pressed", element.dataset.value === value ? "true" : "false");
    }
  });
}

function initLayoutControls(): void {
  const layoutToggles = document.querySelectorAll(".layout-toggle");
  
  layoutToggles.forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const element = toggle as HTMLElement;
      const layout = element.dataset.layout;
      const value = element.dataset.value;
      if (layout && value) {
        setLayout(layout, value);
      }
    });
  });
  
  // Initialize default layout
  setLayout("density", "cozy");
  setLayout("borders", "on");
  setLayout("shadows", "on");
  setLayout("sidebar-bg", "gradient");
  setLayout("header", "show");
}

// Theme Export Functions
function getCurrentThemeId(): string {
  return htmlEl.getAttribute("data-theme") || "errl-core";
}

function getThemeAsJSON(themeId: string): string {
  const theme = getComputedThemeTokens(themeId);
  const themeData = {
    id: themeId,
    label: THEMES.find(t => t.id === themeId)?.label || themeId,
    tokens: theme
  };
  return JSON.stringify(themeData, null, 2);
}

function getThemeAsCSS(themeId: string): string {
  const theme = getComputedThemeTokens(themeId);
  const themeLabel = THEMES.find(t => t.id === themeId)?.label || themeId;
  
  let css = `/* ${themeLabel} Theme */\n`;
  css += `:root[data-theme="${themeId}"] {\n`;
  
  Object.entries(theme).forEach(([key, value]) => {
    css += `  --${key}: ${value};\n`;
  });
  
  css += `}\n`;
  return css;
}

// Code Snippet Generation
function generateCodeSnippet(format: CodeSnippetFormat): string {
  const themeId = getCurrentThemeId();
  const theme = getComputedThemeTokens(themeId);
  
  switch(format) {
    case 'react':
      return `// React Theme Object
const theme = {
  colors: {
    bg: '${theme.bg}',
    bgAlt: '${theme['bg-alt']}',
    surface: '${theme.surface}',
    surfaceAlt: '${theme['surface-alt']}',
    border: '${theme.border}',
    borderSoft: '${theme['border-soft']}',
    accent: '${theme.accent}',
    accentAlt: '${theme['accent-alt']}',
    accentSoft: '${theme['accent-soft']}',
    accentBoost: '${theme['accent-boost']}',
    text: '${theme.text}',
    muted: '${theme.muted}',
    danger: '${theme.danger}',
    success: '${theme.success}',
  },
  gradients: {
    borderFrom: '${theme['border-gradient-from']}',
    borderTo: '${theme['border-gradient-to']}',
  }
};

export default theme;`;

    case 'tailwind':
      return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg: '${theme.bg}',
        'bg-alt': '${theme['bg-alt']}',
        surface: '${theme.surface}',
        'surface-alt': '${theme['surface-alt']}',
        border: '${theme.border}',
        'border-soft': '${theme['border-soft']}',
        accent: '${theme.accent}',
        'accent-alt': '${theme['accent-alt']}',
        'accent-soft': '${theme['accent-soft']}',
        'accent-boost': '${theme['accent-boost']}',
        text: '${theme.text}',
        muted: '${theme.muted}',
        danger: '${theme.danger}',
        success: '${theme.success}',
      },
    },
  },
};`;

    case 'styled-components':
      return `// styled-components theme
import { ThemeProvider } from 'styled-components';

const theme = {
  colors: {
    bg: '${theme.bg}',
    bgAlt: '${theme['bg-alt']}',
    surface: '${theme.surface}',
    surfaceAlt: '${theme['surface-alt']}',
    border: '${theme.border}',
    borderSoft: '${theme['border-soft']}',
    accent: '${theme.accent}',
    accentAlt: '${theme['accent-alt']}',
    accentSoft: '${theme['accent-soft']}',
    accentBoost: '${theme['accent-boost']}',
    text: '${theme.text}',
    muted: '${theme.muted}',
    danger: '${theme.danger}',
    success: '${theme.success}',
  },
  gradients: {
    borderFrom: '${theme['border-gradient-from']}',
    borderTo: '${theme['border-gradient-to']}',
  }
};

export default theme;`;

    case 'emotion':
      return `// Emotion theme
import '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      bg: string;
      bgAlt: string;
      surface: string;
      surfaceAlt: string;
      border: string;
      borderSoft: string;
      accent: string;
      accentAlt: string;
      accentSoft: string;
      accentBoost: string;
      text: string;
      muted: string;
      danger: string;
      success: string;
    };
    gradients: {
      borderFrom: string;
      borderTo: string;
    };
  }
}

export const theme = {
  colors: {
    bg: '${theme.bg}',
    bgAlt: '${theme['bg-alt']}',
    surface: '${theme.surface}',
    surfaceAlt: '${theme['surface-alt']}',
    border: '${theme.border}',
    borderSoft: '${theme['border-soft']}',
    accent: '${theme.accent}',
    accentAlt: '${theme['accent-alt']}',
    accentSoft: '${theme['accent-soft']}',
    accentBoost: '${theme['accent-boost']}',
    text: '${theme.text}',
    muted: '${theme.muted}',
    danger: '${theme.danger}',
    success: '${theme.success}',
  },
  gradients: {
    borderFrom: '${theme['border-gradient-from']}',
    borderTo: '${theme['border-gradient-to']}',
  }
};`;

    case 'typescript':
      return `// TypeScript theme types
export interface Theme {
  colors: {
    bg: string;
    bgAlt: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    borderSoft: string;
    accent: string;
    accentAlt: string;
    accentSoft: string;
    accentBoost: string;
    text: string;
    muted: string;
    danger: string;
    success: string;
  };
  gradients: {
    borderFrom: string;
    borderTo: string;
  };
}

export const ${themeId.replace(/-/g, '_')}: Theme = {
  colors: {
    bg: '${theme.bg}',
    bgAlt: '${theme['bg-alt']}',
    surface: '${theme.surface}',
    surfaceAlt: '${theme['surface-alt']}',
    border: '${theme.border}',
    borderSoft: '${theme['border-soft']}',
    accent: '${theme.accent}',
    accentAlt: '${theme['accent-alt']}',
    accentSoft: '${theme['accent-soft']}',
    accentBoost: '${theme['accent-boost']}',
    text: '${theme.text}',
    muted: '${theme.muted}',
    danger: '${theme.danger}',
    success: '${theme.success}',
  },
  gradients: {
    borderFrom: '${theme['border-gradient-from']}',
    borderTo: '${theme['border-gradient-to']}',
  }
};`;

    default:
      return '';
  }
}

// Code snippet dropdown initialization - proper dropdown behavior
function initCodeSnippetDropdown(): void {
  const codeSnippetBtn = getElementByIdSafe<HTMLButtonElement>("codeSnippetBtn");
  const codeSnippetMenu = getElementByIdSafe<HTMLElement>("codeSnippetMenu");
  const codeSnippetItems = document.querySelectorAll(".code-snippet-item");
  
  if (!codeSnippetBtn || !codeSnippetMenu) return;
  
  // Ensure menu starts hidden
  codeSnippetMenu.hidden = true;
  
  codeSnippetBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isHidden = codeSnippetMenu.hidden;
    
    // Close all other dropdowns first
    document.querySelectorAll('.code-snippet-menu').forEach(menu => {
      const menuEl = menu as HTMLElement;
      menuEl.hidden = true;
    });
    
    // Toggle this menu
    codeSnippetMenu.hidden = !isHidden;
  });
  
  // Close menu when clicking outside
  document.addEventListener("click", (e) => {
    const target = e.target as Node;
    const dropdown = codeSnippetBtn.closest('.code-snippet-dropdown');
    if (dropdown && !dropdown.contains(target)) {
      codeSnippetMenu.hidden = true;
    }
  });
  
  // Close menu on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !codeSnippetMenu.hidden) {
      codeSnippetMenu.hidden = true;
    }
  });
  
  codeSnippetItems.forEach(item => {
    item.addEventListener("click", async (e) => {
      e.stopPropagation();
      const element = item as HTMLElement;
      const format = element.dataset.format as CodeSnippetFormat;
      const snippet = generateCodeSnippet(format);
      const success = await copyToClipboard(snippet);
      if (success) {
        showToast(`${format} code copied to clipboard!`, "success");
        codeSnippetMenu.hidden = true;
      } else {
        showToast("Failed to copy. Check browser permissions.", "error");
      }
    });
  });
}

// Theme Validation
function validateTheme(themeId: string): ValidationResults {
  const theme = getComputedThemeTokens(themeId);
  const issues: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];
  
  const textOnBg = getContrastRatio(theme.text, theme.bg);
  const textOnSurface = getContrastRatio(theme.text, theme.surface);
  const mutedOnBg = getContrastRatio(theme.muted, theme.bg);
  
  if (textOnBg && textOnBg < 4.5) {
    issues.push({
      type: 'error',
      message: `Text on background contrast: ${textOnBg.toFixed(2)}:1 (needs 4.5:1 for AA)`,
      fix: 'Increase text brightness or darken background'
    });
  } else if (textOnBg && textOnBg < 7) {
    warnings.push({
      type: 'warning',
      message: `Text on background contrast: ${textOnBg.toFixed(2)}:1 (needs 7:1 for AAA)`,
      fix: 'Consider increasing contrast for better accessibility'
    });
  }
  
  if (textOnSurface && textOnSurface < 4.5) {
    issues.push({
      type: 'error',
      message: `Text on surface contrast: ${textOnSurface.toFixed(2)}:1 (needs 4.5:1 for AA)`,
      fix: 'Adjust text or surface colors'
    });
  }
  
  if (mutedOnBg && mutedOnBg < 3) {
    warnings.push({
      type: 'warning',
      message: `Muted text contrast: ${mutedOnBg.toFixed(2)}:1 (may be hard to read)`,
      fix: 'Consider increasing muted text brightness'
    });
  }
  
  const accentOnBg = getContrastRatio(theme.accent, theme.bg);
  if (accentOnBg && accentOnBg < 3) {
    warnings.push({
      type: 'warning',
      message: `Accent on background contrast: ${accentOnBg.toFixed(2)}:1 (may be hard to see)`,
      fix: 'Increase accent color brightness'
    });
  }
  
  const darkTextOnAccent = getContrastRatio('#050510', theme.accent);
  if (darkTextOnAccent && darkTextOnAccent < 4.5) {
    issues.push({
      type: 'error',
      message: `Button text on accent contrast: ${darkTextOnAccent.toFixed(2)}:1 (needs 4.5:1)`,
      fix: 'Use lighter accent color or lighter button text'
    });
  }
  
  const bgSurfaceContrast = getContrastRatio(theme.bg, theme.surface);
  if (bgSurfaceContrast && bgSurfaceContrast < 1.5) {
    warnings.push({
      type: 'warning',
      message: `Background and surface are very similar (${bgSurfaceContrast.toFixed(2)}:1)`,
      fix: 'Increase contrast between background and surface for better depth'
    });
  }
  
  const linkContrast = getContrastRatio(theme.accent, theme.bg);
  if (linkContrast && linkContrast < 4.5) {
    issues.push({
      type: 'error',
      message: `Link color contrast: ${linkContrast.toFixed(2)}:1 (needs 4.5:1)`,
      fix: 'Increase accent color brightness for better link visibility'
    });
  }
  
  const borderContrast = getContrastRatio(theme.border, theme.surface);
  if (borderContrast && borderContrast < 2) {
    warnings.push({
      type: 'warning',
      message: `Border contrast: ${borderContrast.toFixed(2)}:1 (may be hard to see)`,
      fix: 'Increase border color contrast'
    });
  }
  
  const requiredTokens = ['bg', 'surface', 'accent', 'text', 'muted', 'danger', 'success'];
  const missingTokens = requiredTokens.filter(token => !theme[token as keyof typeof theme] || theme[token as keyof typeof theme] === '');
  if (missingTokens.length > 0) {
    issues.push({
      type: 'error',
      message: `Missing required tokens: ${missingTokens.join(', ')}`,
      fix: 'Define all required color tokens'
    });
  }
  
  const totalChecks = issues.length + warnings.length;
  const passedChecks = totalChecks - issues.length - warnings.length;
  const scorePercentage = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 100;
  
  return {
    themeId,
    themeLabel: THEMES.find(t => t.id === themeId)?.label || themeId,
    issues,
    warnings,
    passed: issues.length === 0,
    score: issues.length === 0 && warnings.length === 0 ? 'AAA' : 
           issues.length === 0 ? 'AA' : 'Fail',
    scorePercentage,
    totalChecks: issues.length + warnings.length
  };
}

function showValidationResults(results: ValidationResults): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '500px';
  
  let html = `
    <header class="modal-header">
      <h3>Theme Validation: ${results.themeLabel}</h3>
    </header>
    <div class="modal-body">
      <div style="margin-bottom: 1rem;">
        <strong>Status:</strong> 
        <span style="color: ${results.passed ? 'var(--success)' : 'var(--danger)'};">
          ${results.score}
        </span>
      </div>
  `;
  
  if (results.issues.length > 0) {
    html += `
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--danger);">Errors (${results.issues.length}):</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
    `;
    results.issues.forEach(issue => {
      html += `<li style="margin-bottom: 0.5rem;">
        <div>${issue.message}</div>
        <div style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
          💡 ${issue.fix}
        </div>
      </li>`;
    });
    html += `</ul></div>`;
  }
  
  if (results.warnings.length > 0) {
    html += `
      <div style="margin-bottom: 1rem;">
        <strong style="color: var(--accent);">Warnings (${results.warnings.length}):</strong>
        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
    `;
    results.warnings.forEach(warning => {
      html += `<li style="margin-bottom: 0.5rem;">
        <div>${warning.message}</div>
        <div style="font-size: 0.8rem; color: var(--muted); margin-top: 0.25rem;">
          💡 ${warning.fix}
        </div>
      </li>`;
    });
    html += `</ul></div>`;
  }
  
  if (results.issues.length === 0 && results.warnings.length === 0) {
    html += `
      <div style="color: var(--success);">
        ✓ All contrast checks passed! This theme meets WCAG AAA standards.
      </div>
    `;
  }
  
  html += `
      <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-soft);">
        <div style="font-size: 0.85rem; color: var(--muted);">
          <strong>Summary:</strong> ${results.issues.length} errors, ${results.warnings.length} warnings
        </div>
        ${results.scorePercentage !== undefined ? `
          <div style="margin-top: 0.5rem;">
            <div style="font-size: 0.75rem; color: var(--muted); margin-bottom: 0.25rem;">Accessibility Score</div>
            <div style="
              width: 100%;
              height: 1rem;
              background: var(--surface-alt);
              border-radius: 0.5rem;
              overflow: hidden;
              border: 1px solid var(--border-soft);
            ">
              <div style="
                width: ${results.scorePercentage}%;
                height: 100%;
                background: ${results.passed ? 'linear-gradient(90deg, var(--success), var(--accent))' : 'linear-gradient(90deg, var(--danger), var(--accent))'};
                transition: width 0.5s ease-out;
              "></div>
            </div>
            <div style="font-size: 0.75rem; color: var(--muted); margin-top: 0.25rem;">
              ${results.scorePercentage}% passing
            </div>
          </div>
        ` : ''}
      </div>
      </div>
      <footer class="modal-footer">
        <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
          Close
        </button>
      </footer>
  `;
  
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Validate theme button
const validateThemeBtn = document.getElementById("validateTheme") as HTMLButtonElement;
validateThemeBtn.addEventListener("click", () => {
  const themeId = getCurrentThemeId();
  const results = validateTheme(themeId);
  showValidationResults(results);
});

// Token Reference Viewer
function showTokenReference(): void {
  const themeId = getCurrentThemeId();
  const theme = getComputedThemeTokens(themeId);
  const themeLabel = THEMES.find(t => t.id === themeId)?.label || themeId;
  
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '700px';
  (content as HTMLElement).style.maxHeight = '90vh';
  (content as HTMLElement).style.overflowY = 'auto';
  
  const tokenCategories = {
    'Backgrounds': [
      { key: 'bg', label: 'Background', value: theme.bg },
      { key: 'bg-alt', label: 'Background Alt', value: theme['bg-alt'] },
    ],
    'Surfaces': [
      { key: 'surface', label: 'Surface', value: theme.surface },
      { key: 'surface-alt', label: 'Surface Alt', value: theme['surface-alt'] },
    ],
    'Borders': [
      { key: 'border', label: 'Border', value: theme.border },
      { key: 'border-soft', label: 'Border Soft', value: theme['border-soft'] },
    ],
    'Accents': [
      { key: 'accent', label: 'Accent', value: theme.accent },
      { key: 'accent-alt', label: 'Accent Alt', value: theme['accent-alt'] },
      { key: 'accent-soft', label: 'Accent Soft', value: theme['accent-soft'] },
      { key: 'accent-boost', label: 'Accent Boost', value: theme['accent-boost'] },
    ],
    'Text': [
      { key: 'text', label: 'Text', value: theme.text },
      { key: 'muted', label: 'Muted', value: theme.muted },
    ],
    'Semantic': [
      { key: 'danger', label: 'Danger', value: theme.danger },
      { key: 'success', label: 'Success', value: theme.success },
    ],
    'Gradients': [
      { key: 'border-gradient-from', label: 'Gradient From', value: theme['border-gradient-from'] },
      { key: 'border-gradient-to', label: 'Gradient To', value: theme['border-gradient-to'] },
    ],
  };
  
  let html = `
    <header class="modal-header">
      <h3>Token Reference: ${themeLabel}</h3>
    </header>
    <div class="modal-body" style="padding: 1.5rem;">
  `;
  
  Object.entries(tokenCategories).forEach(([category, tokens]) => {
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">${category}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;">
    `;
    
    tokens.forEach(token => {
      html += `
        <div class="token-card" style="
          background: var(--surface);
          border: 1px solid var(--border-soft);
          border-radius: 0.5rem;
          padding: 0.75rem;
          cursor: pointer;
          transition: transform var(--transition-fast);
        " onclick="navigator.clipboard.writeText('var(--${token.key})').then(() => {
          const toast = document.createElement('div');
          toast.textContent = 'Copied!';
          toast.style.cssText = 'position: fixed; bottom: 1rem; right: 1rem; background: var(--surface-alt); color: var(--text); padding: 0.5rem 1rem; border-radius: 0.5rem; z-index: 3000;';
          document.body.appendChild(toast);
          setTimeout(() => toast.remove(), 1500);
        })">
          <div style="
            width: 100%;
            height: 3rem;
            background: ${token.value};
            border-radius: 0.25rem;
            margin-bottom: 0.5rem;
            border: 1px solid var(--border-soft);
          "></div>
          <div style="font-size: 0.75rem; color: var(--muted); margin-bottom: 0.25rem;">${token.label}</div>
          <div style="font-size: 0.7rem; font-family: monospace; color: var(--text); word-break: break-all;">--${token.key}</div>
          <div style="font-size: 0.7rem; font-family: monospace; color: var(--muted); margin-top: 0.25rem;">${token.value}</div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  html += `
      </div>
      <footer class="modal-footer">
        <div style="font-size: 0.8rem; color: var(--muted); margin-right: auto;">
          Click any token to copy CSS variable name
        </div>
        <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
          Close
        </button>
      </footer>
  `;
  
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

const showTokenReferenceBtn = document.getElementById("showTokenReference") as HTMLButtonElement;
showTokenReferenceBtn.addEventListener("click", showTokenReference);

// Theme Import
function showImportDialog(): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '600px';
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Import Theme</h3>
    </header>
    <div class="modal-body">
      <p style="margin-bottom: 1rem; color: var(--muted);">
        Paste your theme JSON below. Format should match:
      </p>
      <pre style="background: var(--surface); padding: 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; overflow-x: auto; margin-bottom: 1rem;">{
  "id": "my-theme",
  "label": "My Theme",
  "tokens": {
    "bg": "#02070a",
    "accent": "#34e1ff",
    ...
  }
}</pre>
      <textarea 
        id="importThemeTextarea" 
        class="input" 
        rows="12" 
        placeholder='Paste theme JSON here...'
        style="width: 100%; font-family: monospace; font-size: 0.8rem; resize: vertical;"
      ></textarea>
      <div id="importError" style="color: var(--danger); font-size: 0.8rem; margin-top: 0.5rem; display: none;"></div>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-subtle" onclick="this.closest('.modal-backdrop').remove()">
        Cancel
      </button>
      <button id="confirmImport" class="btn btn-primary">
        Import Theme
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const confirmBtn = content.querySelector('#confirmImport') as HTMLButtonElement;
  const textarea = content.querySelector('#importThemeTextarea') as HTMLTextAreaElement;
  const errorDiv = content.querySelector('#importError') as HTMLElement;
  
  confirmBtn.addEventListener('click', () => {
    try {
      const json = JSON.parse(textarea.value);
      
      if (!json.id || !json.tokens) {
        throw new Error('Theme must have "id" and "tokens" properties');
      }
      
      const requiredTokens = ['bg', 'surface', 'accent', 'text'];
      const missing = requiredTokens.filter(t => !json.tokens[t]);
      if (missing.length > 0) {
        throw new Error(`Missing required tokens: ${missing.join(', ')}`);
      }
      
      const style = document.createElement('style');
      style.id = `theme-${json.id}`;
      
      let css = `:root[data-theme="${json.id}"] {\n`;
      Object.entries(json.tokens).forEach(([key, value]) => {
        css += `  --${key}: ${value};\n`;
      });
      css += `}\n`;
      
      const existing = document.getElementById(style.id);
      if (existing) existing.remove();
      
      style.textContent = css;
      document.head.appendChild(style);
      
      if (!THEMES.find(t => t.id === json.id)) {
        THEMES.push({
          id: json.id,
          label: json.label || json.id
        });
        
        if (themeSearchInput) {
          buildThemeList(themeSearchInput.value);
        }
        
        showToast(`Theme "${json.label || json.id}" imported successfully!`, "success");
      } else {
        showToast(`Theme "${json.id}" updated!`, "success");
      }
      
      modal.remove();
    } catch (err) {
      const error = err as Error;
      errorDiv.textContent = `Error: ${error.message}`;
      errorDiv.style.display = 'block';
      showToast(`Import failed: ${error.message}`, "error");
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

const importThemeBtn = document.getElementById("importTheme") as HTMLButtonElement;
importThemeBtn.addEventListener("click", showImportDialog);

// Theme Comparison
function showThemeComparison(): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '900px';
  (content as HTMLElement).style.maxHeight = '90vh';
  (content as HTMLElement).style.overflowY = 'auto';
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Compare Themes</h3>
    </header>
    <div class="modal-body">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
          <label class="field-label" style="display: block; margin-bottom: 0.5rem;">Theme 1</label>
          <select id="compareTheme1" class="input">
            ${THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <label class="field-label" style="display: block; margin-bottom: 0.5rem;">Theme 2</label>
          <select id="compareTheme2" class="input">
            ${THEMES.map(t => `<option value="${t.id}">${t.label}</option>`).join('')}
          </select>
        </div>
      </div>
      <div id="comparisonResults" style="margin-top: 1.5rem;"></div>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
        Close
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const theme1Select = content.querySelector('#compareTheme1') as HTMLSelectElement;
  const theme2Select = content.querySelector('#compareTheme2') as HTMLSelectElement;
  const resultsDiv = content.querySelector('#comparisonResults') as HTMLElement;
  
  function updateComparison(): void {
    const theme1 = getComputedThemeTokens(theme1Select.value);
    const theme2 = getComputedThemeTokens(theme2Select.value);
    const label1 = THEMES.find(t => t.id === theme1Select.value)?.label;
    const label2 = THEMES.find(t => t.id === theme2Select.value)?.label;
    
    const allKeys = new Set([...Object.keys(theme1), ...Object.keys(theme2)]);
    
    let html = `
      <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.5rem; margin-bottom: 0.5rem; font-weight: 600; border-bottom: 1px solid var(--border-soft); padding-bottom: 0.5rem;">
        <div>Token</div>
        <div>${label1}</div>
        <div>${label2}</div>
      </div>
    `;
    
    allKeys.forEach(key => {
      const val1 = theme1[key as keyof typeof theme1] || '—';
      const val2 = theme2[key as keyof typeof theme2] || '—';
      const isDifferent = val1 !== val2;
      
      html += `
        <div style="
          display: grid; 
          grid-template-columns: 2fr 1fr 1fr; 
          gap: 0.5rem; 
          padding: 0.75rem; 
          background: ${isDifferent ? 'rgba(255, 255, 0, 0.05)' : 'transparent'};
          border-radius: 0.25rem;
          margin-bottom: 0.25rem;
        ">
          <div style="font-family: monospace; font-size: 0.8rem; color: var(--text);">--${key}</div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${String(val1).startsWith('#') ? `<div style="width: 1.5rem; height: 1.5rem; background: ${val1}; border: 1px solid var(--border-soft); border-radius: 0.25rem;"></div>` : ''}
            <span style="font-family: monospace; font-size: 0.75rem; color: var(--muted);">${val1}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            ${String(val2).startsWith('#') ? `<div style="width: 1.5rem; height: 1.5rem; background: ${val2}; border: 1px solid var(--border-soft); border-radius: 0.25rem;"></div>` : ''}
            <span style="font-family: monospace; font-size: 0.75rem; color: var(--muted);">${val2}</span>
          </div>
        </div>
      `;
    });
    
    resultsDiv.innerHTML = html;
  }
  
  theme1Select.addEventListener('change', updateComparison);
  theme2Select.addEventListener('change', updateComparison);
  updateComparison();
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

const compareThemesBtn = document.getElementById("compareThemes") as HTMLButtonElement;
compareThemesBtn.addEventListener("click", showThemeComparison);

// Visual Theme Editor
function showThemeEditor(): void {
  const themeId = getCurrentThemeId();
  const theme = getComputedThemeTokens(themeId);
  const themeLabel = THEMES.find(t => t.id === themeId)?.label || themeId;
  
  let editorStyle = document.getElementById('theme-editor-style') as HTMLStyleElement;
  if (!editorStyle) {
    editorStyle = document.createElement('style');
    editorStyle.id = 'theme-editor-style';
    document.head.appendChild(editorStyle);
  }
  
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '700px';
  (content as HTMLElement).style.maxHeight = '90vh';
  (content as HTMLElement).style.overflowY = 'auto';
  
  const editableTokens = [
    { key: 'bg', label: 'Background', category: 'Backgrounds' },
    { key: 'bg-alt', label: 'Background Alt', category: 'Backgrounds' },
    { key: 'surface', label: 'Surface', category: 'Surfaces' },
    { key: 'surface-alt', label: 'Surface Alt', category: 'Surfaces' },
    { key: 'border', label: 'Border', category: 'Borders' },
    { key: 'border-soft', label: 'Border Soft', category: 'Borders' },
    { key: 'accent', label: 'Accent', category: 'Accents' },
    { key: 'accent-alt', label: 'Accent Alt', category: 'Accents' },
    { key: 'accent-soft', label: 'Accent Soft', category: 'Accents' },
    { key: 'accent-boost', label: 'Accent Boost', category: 'Accents' },
    { key: 'text', label: 'Text', category: 'Text' },
    { key: 'muted', label: 'Muted', category: 'Text' },
    { key: 'danger', label: 'Danger', category: 'Semantic' },
    { key: 'success', label: 'Success', category: 'Semantic' },
    { key: 'border-gradient-from', label: 'Gradient From', category: 'Gradients' },
    { key: 'border-gradient-to', label: 'Gradient To', category: 'Gradients' },
  ];
  
  const categories: Record<string, typeof editableTokens> = {};
  editableTokens.forEach(token => {
    if (!categories[token.category]) {
      categories[token.category] = [];
    }
    categories[token.category].push(token);
  });
  
  let html = `
    <header class="modal-header">
      <h3>Edit Theme: ${themeLabel}</h3>
    </header>
    <div class="modal-body" style="padding: 1.5rem;">
  `;
  
  Object.entries(categories).forEach(([category, tokens]) => {
    html += `
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">${category}</h4>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
    `;
    
    tokens.forEach(token => {
      const value = theme[token.key as keyof typeof theme] || '';
      html += `
        <div>
          <label style="display: block; font-size: 0.75rem; color: var(--muted); margin-bottom: 0.5rem;">
            ${token.label}
          </label>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input 
              type="color" 
              data-token="${token.key}"
              value="${value}"
              style="
                width: 3rem;
                height: 2.5rem;
                border: 1px solid var(--border);
                border-radius: 0.25rem;
                cursor: pointer;
                background: ${value};
              "
            />
            <input 
              type="text" 
              data-token="${token.key}"
              value="${value}"
              class="input"
              style="flex: 1; font-family: monospace; font-size: 0.8rem;"
              placeholder="#000000"
            />
          </div>
          <div style="
            width: 100%;
            height: 1.5rem;
            background: ${value};
            border-radius: 0.25rem;
            margin-top: 0.5rem;
            border: 1px solid var(--border-soft);
          "></div>
        </div>
      `;
    });
    
    html += `</div></div>`;
  });
  
  html += `
      </div>
      <footer class="modal-footer">
        <button id="resetThemeEditor" class="btn btn-subtle">
          Reset
        </button>
        <button id="exportEditedTheme" class="btn btn-outline">
          Export as New Theme
        </button>
        <button id="applyThemeEditor" class="btn btn-primary">
          Apply Changes
        </button>
      </footer>
  `;
  
  content.innerHTML = html;
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const originalValues = { ...theme };
  
  function updatePreview(): void {
    let css = `:root[data-theme="${themeId}"] {\n`;
    content.querySelectorAll('input[type="color"]').forEach(input => {
      const element = input as HTMLInputElement;
      const token = element.dataset.token;
      const value = element.value;
      if (token) {
        css += `  --${token}: ${value};\n`;
      }
    });
    css += `}\n`;
    editorStyle.textContent = css;
  }
  
  content.querySelectorAll('input[type="color"]').forEach(input => {
    input.addEventListener('input', (e) => {
      const element = e.target as HTMLInputElement;
      const textInput = content.querySelector(`input[type="text"][data-token="${element.dataset.token}"]`) as HTMLInputElement;
      if (textInput) {
        textInput.value = element.value;
      }
      updatePreview();
    });
  });
  
  content.querySelectorAll('input[type="text"][data-token]').forEach(input => {
    input.addEventListener('input', (e) => {
      const element = e.target as HTMLInputElement;
      const colorInput = content.querySelector(`input[type="color"][data-token="${element.dataset.token}"]`) as HTMLInputElement;
      if (colorInput && /^#[0-9A-F]{6}$/i.test(element.value)) {
        colorInput.value = element.value;
        updatePreview();
      }
    });
  });
  
  const resetBtn = content.querySelector('#resetThemeEditor') as HTMLButtonElement;
  resetBtn.addEventListener('click', () => {
    content.querySelectorAll('input[type="color"]').forEach(input => {
      const element = input as HTMLInputElement;
      const token = element.dataset.token;
      if (token) {
        element.value = originalValues[token as keyof typeof originalValues] || '';
        const textInput = content.querySelector(`input[type="text"][data-token="${token}"]`) as HTMLInputElement;
        if (textInput) {
          textInput.value = element.value;
        }
      }
    });
    updatePreview();
  });
  
  const applyBtn = content.querySelector('#applyThemeEditor') as HTMLButtonElement;
  applyBtn.addEventListener('click', () => {
    showToast('Changes applied! (Temporary - export to save permanently)', "success");
    modal.remove();
  });
  
  const exportBtn = content.querySelector('#exportEditedTheme') as HTMLButtonElement;
  exportBtn.addEventListener('click', () => {
    const editedTheme: Record<string, string> = {};
    content.querySelectorAll('input[type="color"]').forEach(input => {
      const element = input as HTMLInputElement;
      const token = element.dataset.token;
      if (token) {
        editedTheme[token] = element.value;
      }
    });
    
    const themeData = {
      id: `${themeId}-edited-${Date.now()}`,
      label: `${themeLabel} (Edited)`,
      tokens: editedTheme
    };
    
    const json = JSON.stringify(themeData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${themeData.id}-theme.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Edited theme exported! Import it to use permanently.', "success");
    modal.remove();
  });
  
  updatePreview();
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      editorStyle.textContent = '';
      modal.remove();
    }
  });
}

const editThemeBtn = document.getElementById("editTheme") as HTMLButtonElement;
editThemeBtn.addEventListener("click", showThemeEditor);

// Presets System
function getPresets(): Preset[] {
  try {
    const stored = localStorage.getItem(PRESETS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function savePreset(preset: Omit<Preset, 'id' | 'createdAt'>): Preset {
  const presets = getPresets();
  const newPreset: Preset = {
    ...preset,
    id: `preset-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  presets.push(newPreset);
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  return newPreset;
}

function loadPreset(preset: Preset): void {
  if (preset.themeId) {
    setTheme(preset.themeId);
  }
  
  if (preset.layout) {
    Object.entries(preset.layout).forEach(([key, value]) => {
      setLayout(key, value);
    });
  }
  
  showToast(`Preset "${preset.name}" loaded!`, "success");
}

function showSavePresetDialog(): void {
  const themeId = getCurrentThemeId();
  const layout: LayoutState = {
    density: (htmlEl.getAttribute('data-density') || 'cozy') as 'compact' | 'cozy' | 'spacious',
    borders: (htmlEl.getAttribute('data-borders') || 'on') as 'on' | 'off',
    shadows: (htmlEl.getAttribute('data-shadows') || 'on') as 'on' | 'off',
    'sidebar-bg': (htmlEl.getAttribute('data-sidebar-bg') || 'gradient') as 'gradient' | 'solid',
    header: (htmlEl.getAttribute('data-header') || 'show') as 'show' | 'hide',
  };
  
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '500px';
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Save Preset</h3>
    </header>
    <div class="modal-body">
      <label class="field">
        <span class="field-label">Preset Name</span>
        <input type="text" id="presetName" class="input" placeholder="My Preset" />
      </label>
      <div style="margin-top: 1rem; padding: 0.75rem; background: var(--surface-alt); border-radius: 0.5rem; font-size: 0.85rem; color: var(--muted);">
        <div><strong>Theme:</strong> ${THEMES.find(t => t.id === themeId)?.label || themeId}</div>
        <div style="margin-top: 0.5rem;"><strong>Layout:</strong> ${Object.entries(layout).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
      </div>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-subtle" onclick="this.closest('.modal-backdrop').remove()">
        Cancel
      </button>
      <button id="confirmSavePreset" class="btn btn-primary">
        Save Preset
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const confirmBtn = content.querySelector('#confirmSavePreset') as HTMLButtonElement;
  confirmBtn.addEventListener('click', () => {
    const nameInput = content.querySelector('#presetName') as HTMLInputElement;
    const name = nameInput.value.trim() || `Preset ${new Date().toLocaleString()}`;
    const preset = {
      name,
      themeId,
      layout
    };
    
    savePreset(preset);
    showToast(`Preset "${name}" saved!`, "success");
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

const savePresetBtn = document.getElementById("savePreset") as HTMLButtonElement;
savePresetBtn.addEventListener("click", showSavePresetDialog);

// Theme Sharing
function shareTheme(): void {
  const themeId = getCurrentThemeId();
  const layout: LayoutState = {
    density: (htmlEl.getAttribute('data-density') || 'cozy') as 'compact' | 'cozy' | 'spacious',
    borders: (htmlEl.getAttribute('data-borders') || 'on') as 'on' | 'off',
    shadows: (htmlEl.getAttribute('data-shadows') || 'on') as 'on' | 'off',
    'sidebar-bg': (htmlEl.getAttribute('data-sidebar-bg') || 'gradient') as 'gradient' | 'solid',
    header: (htmlEl.getAttribute('data-header') || 'show') as 'show' | 'hide',
  };
  
  const shareData: ShareData = {
    theme: themeId,
    layout: layout,
    timestamp: Date.now()
  };
  
  const encoded = btoa(JSON.stringify(shareData));
  const shareUrl = `${window.location.origin}${window.location.pathname}?share=${encoded}`;
  
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '600px';
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Share Theme</h3>
    </header>
    <div class="modal-body">
      <p style="margin-bottom: 1rem; color: var(--muted);">
        Share this theme and layout configuration with others. Anyone with this link will see your exact setup.
      </p>
      <label class="field">
        <span class="field-label">Share URL</span>
        <div style="display: flex; gap: 0.5rem;">
          <input 
            type="text" 
            id="shareUrlInput" 
            class="input" 
            value="${shareUrl}"
            readonly
            style="flex: 1; font-family: monospace; font-size: 0.8rem;"
          />
          <button id="copyShareUrl" class="btn btn-primary">Copy</button>
        </div>
      </label>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
        Close
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const copyBtn = content.querySelector('#copyShareUrl') as HTMLButtonElement;
  copyBtn.addEventListener('click', async () => {
    const input = content.querySelector('#shareUrlInput') as HTMLInputElement;
    input.select();
    const success = await copyToClipboard(input.value);
    if (success) {
      showToast('Share URL copied to clipboard!', "success");
    }
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

function loadSharedTheme(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const shareParam = urlParams.get('share');
  
  if (shareParam) {
    try {
      const shareData: ShareData = JSON.parse(atob(shareParam));
      
      if (shareData.theme) {
        setTheme(shareData.theme);
        showToast(`Loaded shared theme: ${THEMES.find(t => t.id === shareData.theme)?.label || shareData.theme}`, "success");
      }
      
      if (shareData.layout) {
        Object.entries(shareData.layout).forEach(([key, value]) => {
          setLayout(key, value);
        });
      }
      
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      console.error('Failed to load shared theme:', err);
      showToast('Failed to load shared theme. Invalid URL format.', "error");
    }
  }
}

loadSharedTheme();

// Animation Playground
function showAnimationPlayground(): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '800px';
  (content as HTMLElement).style.maxHeight = '90vh';
  (content as HTMLElement).style.overflowY = 'auto';
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Animation Playground</h3>
    </header>
    <div class="modal-body" style="padding: 1.5rem;">
      <p style="margin-bottom: 1.5rem; color: var(--muted);">
        Preview transition timings and animation curves. All animations use theme tokens.
      </p>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">Transition Timings</h4>
        <div style="display: grid; gap: 1rem;">
          <div>
            <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--muted);">Fast (--transition-fast)</div>
            <div class="anim-demo-box" style="
              width: 100%;
              height: 3rem;
              background: var(--accent);
              border-radius: 0.5rem;
              transition: transform var(--transition-fast), background var(--transition-fast);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              Hover me (150ms)
            </div>
          </div>
          <div>
            <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--muted);">Medium (--transition-med)</div>
            <div class="anim-demo-box" style="
              width: 100%;
              height: 3rem;
              background: var(--accent);
              border-radius: 0.5rem;
              transition: transform var(--transition-med), background var(--transition-med);
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              Hover me (220ms)
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">Button Animations</h4>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <button class="btn btn-primary">Hover Me</button>
          <button class="btn btn-outline">Hover Me</button>
          <button class="btn btn-ghost">Hover Me</button>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">Card Hover Effects</h4>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem;">
          <div class="card" style="transition: transform var(--transition-fast), box-shadow var(--transition-med); cursor: pointer;">
            <div class="card-body">
              <div style="font-size: 0.85rem;">Hover for elevation</div>
            </div>
          </div>
          <div class="card" style="transition: transform var(--transition-fast), box-shadow var(--transition-med); cursor: pointer;">
            <div class="card-body">
              <div style="font-size: 0.85rem;">Hover for elevation</div>
            </div>
          </div>
          <div class="card" style="transition: transform var(--transition-fast), box-shadow var(--transition-med); cursor: pointer;">
            <div class="card-body">
              <div style="font-size: 0.85rem;">Hover for elevation</div>
            </div>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 2rem;">
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">Loading Spinner</h4>
        <div style="display: flex; gap: 2rem; align-items: center;">
          <div class="spinner"></div>
          <div style="font-size: 0.85rem; color: var(--muted);">
            Uses --accent and --border-soft tokens
          </div>
        </div>
      </div>
      
      <div>
        <h4 style="margin: 0 0 1rem; font-size: 1rem; color: var(--accent);">Reduced Motion</h4>
        <div style="padding: 1rem; background: var(--surface-alt); border-radius: 0.5rem; font-size: 0.85rem; color: var(--muted);">
          Respects <code style="background: var(--accent-soft); padding: 0.15rem 0.3rem; border-radius: 0.25rem;">prefers-reduced-motion</code> media query.
          All animations should honor user motion preferences.
        </div>
      </div>
    </div>
    <footer class="modal-footer">
      <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
        Close
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  // Add hover effects to demo boxes
  content.querySelectorAll('.anim-demo-box').forEach(box => {
    const element = box as HTMLElement;
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateX(20px)';
      element.style.background = 'var(--accent-alt)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateX(0)';
      element.style.background = 'var(--accent)';
    });
  });
  
  // Add hover effects to cards
  content.querySelectorAll('.card').forEach(card => {
    const element = card as HTMLElement;
    element.addEventListener('mouseenter', () => {
      element.style.transform = 'translateY(-4px)';
      element.style.boxShadow = 'var(--shadow-strong)';
    });
    element.addEventListener('mouseleave', () => {
      element.style.transform = 'translateY(0)';
      element.style.boxShadow = 'var(--shadow-soft)';
    });
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Component Playground
function showComponentPlayground(): void {
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  (modal as HTMLElement).style.zIndex = '2000';
  
  const content = document.createElement('div');
  content.className = 'modal';
  (content as HTMLElement).style.maxWidth = '1000px';
  (content as HTMLElement).style.maxHeight = '90vh';
  (content as HTMLElement).style.display = 'flex';
  (content as HTMLElement).style.flexDirection = 'column';
  
  const defaultHTML = `<button class="btn btn-primary">Click me</button>
<button class="btn btn-outline">Outline</button>
<div class="card" style="margin-top: 1rem;">
  <div class="card-body">
    <h3 style="margin: 0 0 0.5rem;">Card Title</h3>
    <p style="margin: 0; color: var(--muted);">Edit the HTML above to see live preview.</p>
  </div>
</div>`;
  
  content.innerHTML = `
    <header class="modal-header">
      <h3>Component Playground</h3>
    </header>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; flex: 1; overflow: hidden; padding: 1rem;">
      <div style="display: flex; flex-direction: column;">
        <label style="font-size: 0.85rem; color: var(--muted); margin-bottom: 0.5rem;">HTML Editor</label>
        <textarea 
          id="playgroundHTML" 
          class="input" 
          style="
            flex: 1;
            font-family: 'Monaco', 'Courier New', monospace;
            font-size: 0.85rem;
            resize: none;
            min-height: 300px;
          "
        >${defaultHTML}</textarea>
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
          <button id="copyPlaygroundCode" class="btn btn-sm btn-outline">Copy HTML</button>
          <button id="resetPlayground" class="btn btn-sm btn-ghost">Reset</button>
        </div>
      </div>
      <div style="display: flex; flex-direction: column;">
        <label style="font-size: 0.85rem; color: var(--muted); margin-bottom: 0.5rem;">Live Preview</label>
        <div 
          id="playgroundPreview" 
          style="
            flex: 1;
            background: var(--surface);
            border: 1px solid var(--border-soft);
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-y: auto;
          "
        ></div>
      </div>
    </div>
    <footer class="modal-footer">
      <div style="font-size: 0.75rem; color: var(--muted); margin-right: auto;">
        Uses all theme tokens and component classes
      </div>
      <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove()">
        Close
      </button>
    </footer>
  `;
  
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  const htmlEditor = content.querySelector('#playgroundHTML') as HTMLTextAreaElement;
  const preview = content.querySelector('#playgroundPreview') as HTMLElement;
  
  function updatePreview(): void {
    try {
      if (preview && htmlEditor) {
        preview.innerHTML = htmlEditor.value;
      }
    } catch (err) {
      const error = err as Error;
      if (preview) {
        preview.innerHTML = `<div style="color: var(--danger);">Error: ${error.message}</div>`;
      }
    }
  }
  
  if (htmlEditor) {
    htmlEditor.addEventListener('input', updatePreview);
    updatePreview();
  }
  
  const copyBtn = content.querySelector('#copyPlaygroundCode') as HTMLButtonElement;
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (htmlEditor) {
        const success = await copyToClipboard(htmlEditor.value);
        if (success) {
          showToast('HTML copied to clipboard!', "success");
        }
      }
    });
  }
  
  const resetBtn = content.querySelector('#resetPlayground') as HTMLButtonElement;
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (htmlEditor) {
        htmlEditor.value = defaultHTML;
        updatePreview();
      }
    });
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

// Add toast animations
const style = document.createElement("style");
style.textContent = `
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  @keyframes toastSlideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Export for use in other modules if needed
export { setTheme, getCurrentThemeId, getThemeAsJSON, getThemeAsCSS, generateCodeSnippet, validateTheme, setLayout, loadPreset };

