/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/**
 * Type-safe wrapper for Object.keys().
 * 
 * @param obj - Object to get keys from
 * @returns Array of keys with proper typing
 * @template O - Object type
 */
export const keys = <O extends object>(obj: O) =>
  Object.keys(obj) as (keyof O)[]

/**
 * Type-safe wrapper for Object.values().
 * 
 * @param obj - Object to get values from
 * @returns Array of values with proper typing
 * @template O - Object type
 */
export const values = <O extends object>(obj: O) =>
  Object.values(obj) as O[keyof O][]

/**
 * Type-safe wrapper for Object.entries().
 * 
 * @param obj - Object to get entries from
 * @returns Array of [key, value] tuples with proper typing
 * @template O - Object type
 */
export const entries = <O extends object>(obj: O) =>
  Object.entries(obj) as [keyof O, O[keyof O]][]

/**
 * Type-safe wrapper for Object.fromEntries().
 * 
 * @param entries - Array of [key, value] tuples
 * @returns Object reconstructed from entries with proper typing
 * @template O - Object type
 */
export const fromEntries = <O extends object>(
  entries: [keyof O, O[keyof O]][]
) => Object.fromEntries(entries) as O

/**
 * Identity function - returns the input unchanged.
 * 
 * @param x - Value to return
 * @returns The input value unchanged
 * @template T - Value type
 */
export const identity = <T>(x: T) => x

/**
 * Smoothly scrolls a container to a target Y position.
 * 
 * Uses requestAnimationFrame for smooth animation with easeInOutQuad easing.
 * 
 * @param container - The HTML element to scroll
 * @param targetY - Target scroll position in pixels
 * @param duration - Animation duration in milliseconds (default: 300)
 * @returns Promise that resolves when scroll animation completes
 * 
 * @example
 * ```typescript
 * await scrollToPosition(element, element.scrollHeight, 2000)
 * ```
 */
export function scrollToPosition(
  container: HTMLElement,
  targetY: number,
  duration: number = 300
): Promise<void> {
  return new Promise((resolve) => {
    const start = container.scrollTop;
    const distance = targetY - start;
    const startTime = performance.now();

    function step(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // easeInOutQuad easing
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      container.scrollTop = start + distance * ease;

      if (elapsed < duration) {
        requestAnimationFrame(step);
      } else {
        container.scrollTop = targetY; // snap exactly
        resolve();
      }
    }

    requestAnimationFrame(step);
  });
}
