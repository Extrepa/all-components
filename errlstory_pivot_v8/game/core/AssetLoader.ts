
/**
 * AssetLoader - Simple image loading utility
 * Loads and caches images for use in the game
 */
export class AssetLoader {
  private static cache: Map<string, HTMLImageElement> = new Map();

  /**
   * Load an image from a path
   * @param path - Path to the image file (relative to public folder or absolute URL)
   * @returns Promise that resolves to the loaded image
   */
  public static async loadImage(path: string): Promise<HTMLImageElement> {
    // Check cache first
    if (this.cache.has(path)) {
      return this.cache.get(path)!;
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.cache.set(path, img);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${path}`));
      };
      img.src = path;
    });
  }

  /**
   * Get a cached image (returns null if not loaded)
   */
  public static getImage(path: string): HTMLImageElement | null {
    return this.cache.get(path) || null;
  }

  /**
   * Preload multiple images
   */
  public static async loadImages(paths: string[]): Promise<void> {
    await Promise.all(paths.map(path => this.loadImage(path)));
  }

  /**
   * Clear the cache
   */
  public static clearCache(): void {
    this.cache.clear();
  }
}

