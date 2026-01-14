/**
 * Simple virtual scrolling utilities
 * Renders only visible items for performance with large lists
 */

export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside viewport
}

export interface VirtualScrollResult<T> {
  visibleItems: Array<{ item: T; index: number }>;
  startIndex: number;
  endIndex: number;
  totalHeight: number;
  offsetY: number;
}

/**
 * Calculate which items should be visible in a virtual scroll
 */
export function calculateVisibleItems<T>(
  items: T[],
  scrollTop: number,
  config: VirtualScrollConfig
): VirtualScrollResult<T> {
  const { itemHeight, containerHeight, overscan = 3 } = config;
  
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems: Array<{ item: T; index: number }> = [];
  for (let i = startIndex; i <= endIndex; i++) {
    if (items[i]) {
      visibleItems.push({ item: items[i], index: i });
    }
  }
  
  return {
    visibleItems,
    startIndex,
    endIndex,
    totalHeight,
    offsetY: startIndex * itemHeight
  };
}

