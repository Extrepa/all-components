import { MapleData, MapleCategory, MapleVersion } from '../types';

const DB_NAME = 'ErrlForgeCache';
const DB_VERSION = 1;
const STORE_NAME = 'mapleData';

interface CacheEntry {
  key: string;
  data: MapleData[];
  timestamp: number;
  version: MapleVersion;
  category: MapleCategory;
}

/**
 * IndexedDB service for caching MapleStory data
 */
class MapleCacheService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.warn('[Cache] IndexedDB not available, using memory cache only');
        resolve(); // Gracefully degrade
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Generate cache key
   */
  private getCacheKey(
    version: MapleVersion,
    category: MapleCategory,
    query: string,
    page: number
  ): string {
    return `${version}-${category}-${query || 'ALL'}-${page}`;
  }

  /**
   * Get cached data
   */
  async get(
    version: MapleVersion,
    category: MapleCategory,
    query: string,
    page: number
  ): Promise<MapleData[] | null> {
    await this.init();
    if (!this.db) return null;

    const key = this.getCacheKey(version, category, query, page);

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
        const entry = request.result as CacheEntry | undefined;
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if cache is expired
        const age = Date.now() - entry.timestamp;
        if (age > this.CACHE_TTL) {
          // Delete expired entry
          this.delete(key);
          resolve(null);
          return;
        }

        resolve(entry.data);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  }

  /**
   * Store data in cache
   */
  async set(
    version: MapleVersion,
    category: MapleCategory,
    query: string,
    page: number,
    data: MapleData[]
  ): Promise<void> {
    await this.init();
    if (!this.db) return;

    const key = this.getCacheKey(version, category, query, page);
    const entry: CacheEntry = {
      key,
      data,
      timestamp: Date.now(),
      version,
      category
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Delete a specific cache entry
   */
  private async delete(key: string): Promise<void> {
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Ignore errors
    });
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Ignore errors
    });
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const now = Date.now();
      const request = index.openCursor();

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value as CacheEntry;
          if (now - entry.timestamp > this.CACHE_TTL) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => resolve(); // Ignore errors
    });
  }
}

// Export singleton
export const mapleCacheService = new MapleCacheService();

