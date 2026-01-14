import { GameAsset, AssetMetadata, MapleData, MapleVersion } from '../types';

const DB_NAME = 'ErrlForgeStorage';
const DB_VERSION = 2;
const ASSETS_STORE = 'assets';
const METADATA_STORE = 'metadata';
const HISTORY_STORE = 'history';
const PRESETS_STORE = 'presets';
const DATABASE_ASSETS_STORE = 'databaseAssets';

interface StoredAsset {
  id: string;
  asset: GameAsset;
  timestamp: number;
  version: number;
}

interface AssetHistoryEntry {
  id: string;
  assetId: string;
  asset: GameAsset;
  timestamp: number;
  version: number;
}

/**
 * Storage service for generated assets using IndexedDB
 */
class StorageService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  private async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[Storage] Failed to open IndexedDB');
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Assets store
        if (!db.objectStoreNames.contains(ASSETS_STORE)) {
          const assetsStore = db.createObjectStore(ASSETS_STORE, { keyPath: 'id' });
          assetsStore.createIndex('timestamp', 'timestamp', { unique: false });
          assetsStore.createIndex('name', 'asset.name', { unique: false });
        }
        
        // Metadata store (for efficient querying)
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          const metadataStore = db.createObjectStore(METADATA_STORE, { keyPath: 'assetId' });
          metadataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // History store
        if (!db.objectStoreNames.contains(HISTORY_STORE)) {
          const historyStore = db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: true });
          historyStore.createIndex('assetId', 'assetId', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Presets store
        if (!db.objectStoreNames.contains(PRESETS_STORE)) {
          const presetsStore = db.createObjectStore(PRESETS_STORE, { keyPath: 'id' });
          presetsStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        // Database assets store (for MapleStory database assets)
        if (!db.objectStoreNames.contains(DATABASE_ASSETS_STORE)) {
          const dbAssetsStore = db.createObjectStore(DATABASE_ASSETS_STORE, { keyPath: 'id' });
          dbAssetsStore.createIndex('timestamp', 'timestamp', { unique: false });
          dbAssetsStore.createIndex('category', 'asset.category', { unique: false });
          dbAssetsStore.createIndex('version', 'version', { unique: false });
          dbAssetsStore.createIndex('name', 'asset.name', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Save an asset
   */
  async saveAsset(asset: GameAsset): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const timestamp = Date.now();
    const storedAsset: StoredAsset = {
      id: asset.id,
      asset: {
        ...asset,
        timestamp,
        version: (asset.version || 0) + 1
      },
      timestamp,
      version: (asset.version || 0) + 1
    };

    // Save to history before updating
    await this.addToHistory(asset);

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSETS_STORE, METADATA_STORE], 'readwrite');
      
      // Save asset
      const assetsStore = transaction.objectStore(ASSETS_STORE);
      const assetRequest = assetsStore.put(storedAsset);
      
      // Save metadata separately for efficient querying
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const metadataRequest = metadataStore.put({
        assetId: asset.id,
        metadata: asset.metadata,
        timestamp
      });

      assetRequest.onsuccess = () => {
        metadataRequest.onsuccess = () => resolve();
        metadataRequest.onerror = () => reject(metadataRequest.error);
      };
      
      assetRequest.onerror = () => reject(assetRequest.error);
    });
  }

  /**
   * Get an asset by ID
   */
  async getAsset(id: string): Promise<GameAsset | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([ASSETS_STORE], 'readonly');
      const store = transaction.objectStore(ASSETS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const entry = request.result as StoredAsset | undefined;
        resolve(entry ? entry.asset : null);
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Get all saved assets
   */
  async getAllAssets(): Promise<GameAsset[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([ASSETS_STORE], 'readonly');
      const store = transaction.objectStore(ASSETS_STORE);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Most recent first

      const assets: GameAsset[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value as StoredAsset;
          assets.push(entry.asset);
          cursor.continue();
        } else {
          resolve(assets);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  /**
   * Delete an asset
   */
  async deleteAsset(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([ASSETS_STORE, METADATA_STORE, HISTORY_STORE], 'readwrite');
      
      // Delete asset
      const assetsStore = transaction.objectStore(ASSETS_STORE);
      const assetRequest = assetsStore.delete(id);
      
      // Delete metadata
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const metadataRequest = metadataStore.delete(id);
      
      // Delete history entries
      const historyStore = transaction.objectStore(HISTORY_STORE);
      const historyIndex = historyStore.index('assetId');
      const historyRequest = historyIndex.openKeyCursor(IDBKeyRange.only(id));
      
      historyRequest.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          historyStore.delete(cursor.primaryKey);
          cursor.continue();
        }
      };

      assetRequest.onsuccess = () => {
        metadataRequest.onsuccess = () => resolve();
        metadataRequest.onerror = () => reject(metadataRequest.error);
      };
      
      assetRequest.onerror = () => reject(assetRequest.error);
    });
  }

  /**
   * Add asset to history
   */
  private async addToHistory(asset: GameAsset): Promise<void> {
    await this.init();
    if (!this.db) return;

    const entry: AssetHistoryEntry = {
      id: '',
      assetId: asset.id,
      asset: { ...asset },
      timestamp: Date.now(),
      version: asset.version || 0
    };

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readwrite');
      const store = transaction.objectStore(HISTORY_STORE);
      const request = store.add(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve(); // Ignore errors
    });
  }

  /**
   * Get asset history
   */
  async getAssetHistory(assetId: string): Promise<GameAsset[]> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([HISTORY_STORE], 'readonly');
      const store = transaction.objectStore(HISTORY_STORE);
      const index = store.index('assetId');
      const request = index.openCursor(IDBKeyRange.only(assetId));

      const history: GameAsset[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value as AssetHistoryEntry;
          history.push(entry.asset);
          cursor.continue();
        } else {
          // Sort by timestamp descending (most recent first)
          history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          resolve(history);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  /**
   * Export assets as JSON
   */
  async exportAssets(assetIds?: string[]): Promise<string> {
    const assets = assetIds 
      ? await Promise.all(assetIds.map(id => this.getAsset(id)))
      : await this.getAllAssets();
    
    const validAssets = assets.filter((a): a is GameAsset => a !== null);
    return JSON.stringify(validAssets, null, 2);
  }

  /**
   * Import assets from JSON
   */
  async importAssets(json: string): Promise<number> {
    try {
      const assets: GameAsset[] = JSON.parse(json);
      let imported = 0;

      for (const asset of assets) {
        try {
          await this.saveAsset(asset);
          imported++;
        } catch (error) {
          console.warn(`Failed to import asset ${asset.id}:`, error);
        }
      }

      return imported;
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  }

  /**
   * Clear all stored assets
   */
  async clearAll(): Promise<void> {
    await this.init();
    if (!this.db) return;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([ASSETS_STORE, METADATA_STORE, HISTORY_STORE, PRESETS_STORE], 'readwrite');
      
      const assetsStore = transaction.objectStore(ASSETS_STORE);
      const metadataStore = transaction.objectStore(METADATA_STORE);
      const historyStore = transaction.objectStore(HISTORY_STORE);
      const presetsStore = transaction.objectStore(PRESETS_STORE);
      
      assetsStore.clear();
      metadataStore.clear();
      historyStore.clear();
      presetsStore.clear();
      
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => resolve(); // Ignore errors
    });
  }

  /**
   * Save a custom style preset
   */
  async savePreset(preset: { id: string; name: string; modifiers: string[]; description?: string }): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    const presetData = {
      ...preset,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRESETS_STORE], 'readwrite');
      const store = transaction.objectStore(PRESETS_STORE);
      const request = store.put(presetData);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Get all custom presets
   */
  async getAllPresets(): Promise<Array<{ id: string; name: string; modifiers: string[]; description?: string; timestamp: number }>> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([PRESETS_STORE], 'readonly');
      const store = transaction.objectStore(PRESETS_STORE);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');

      const presets: Array<{ id: string; name: string; modifiers: string[]; description?: string; timestamp: number }> = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          presets.push(cursor.value);
          cursor.continue();
        } else {
          resolve(presets);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  /**
   * Delete a custom preset
   */
  async deletePreset(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([PRESETS_STORE], 'readwrite');
      const store = transaction.objectStore(PRESETS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Save a database asset (MapleStory asset) to archive
   */
  async saveDatabaseAsset(asset: MapleData, version: MapleVersion, imageUrl?: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    // Check if the store exists - if not, we need to upgrade the database
    if (!this.db.objectStoreNames.contains(DATABASE_ASSETS_STORE)) {
      // Close and reopen to trigger upgrade
      this.db.close();
      this.db = null;
      this.initPromise = null;
      await this.init();
      if (!this.db || !this.db.objectStoreNames.contains(DATABASE_ASSETS_STORE)) {
        throw new Error('Database store not found. Please refresh the page to upgrade the database.');
      }
    }

    const id = `${version}-${asset.category}-${asset.id}`;
    const timestamp = Date.now();
    
    const storedAsset = {
      id,
      asset: {
        ...asset,
        imgUrl: imageUrl || asset.imgUrl
      },
      version,
      timestamp
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Save operation timed out after 5 seconds'));
      }, 5000); // 5 second timeout

      try {
        const transaction = this.db!.transaction([DATABASE_ASSETS_STORE], 'readwrite');
        
        transaction.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Transaction failed: ${transaction.error?.message || 'Unknown error'}`));
        };
        
        transaction.oncomplete = () => {
          clearTimeout(timeout);
          resolve();
        };
        
        const store = transaction.objectStore(DATABASE_ASSETS_STORE);
        const request = store.put(storedAsset);
        
        request.onerror = () => {
          clearTimeout(timeout);
          reject(new Error(`Failed to save: ${request.error?.message || 'Unknown error'}`));
        };
        
        // Don't resolve on request.onsuccess - wait for transaction.oncomplete
        // This ensures the data is actually committed
      } catch (error) {
        clearTimeout(timeout);
        reject(error instanceof Error ? error : new Error('Unknown error'));
      }
    });
  }

  /**
   * Get a database asset by ID
   */
  async getDatabaseAsset(id: string): Promise<{ asset: MapleData; version: MapleVersion; timestamp: number } | null> {
    await this.init();
    if (!this.db) return null;

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DATABASE_ASSETS_STORE], 'readonly');
      const store = transaction.objectStore(DATABASE_ASSETS_STORE);
      const request = store.get(id);

      request.onsuccess = () => {
        const entry = request.result;
        if (entry) {
          resolve({
            asset: entry.asset,
            version: entry.version,
            timestamp: entry.timestamp
          });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    });
  }

  /**
   * Get all archived database assets
   */
  async getAllDatabaseAssets(category?: string, version?: MapleVersion): Promise<Array<{ asset: MapleData; version: MapleVersion; timestamp: number }>> {
    await this.init();
    if (!this.db) return [];

    return new Promise((resolve) => {
      const transaction = this.db!.transaction([DATABASE_ASSETS_STORE], 'readonly');
      const store = transaction.objectStore(DATABASE_ASSETS_STORE);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Most recent first

      const assets: Array<{ asset: MapleData; version: MapleVersion; timestamp: number }> = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          const entry = cursor.value;
          // Filter by category and version if provided
          if ((!category || entry.asset.category === category) && 
              (!version || entry.version === version)) {
            assets.push({
              asset: entry.asset,
              version: entry.version,
              timestamp: entry.timestamp
            });
          }
          cursor.continue();
        } else {
          resolve(assets);
        }
      };

      request.onerror = () => resolve([]);
    });
  }

  /**
   * Delete a database asset from archive
   */
  async deleteDatabaseAsset(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([DATABASE_ASSETS_STORE], 'readwrite');
      const store = transaction.objectStore(DATABASE_ASSETS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Check if a database asset is archived
   */
  async isDatabaseAssetArchived(asset: MapleData, version: MapleVersion): Promise<boolean> {
    const id = `${version}-${asset.category}-${asset.id}`;
    const stored = await this.getDatabaseAsset(id);
    return stored !== null;
  }

  /**
   * Export database assets as JSON
   */
  async exportDatabaseAssets(assetIds?: string[]): Promise<string> {
    const allAssets = await this.getAllDatabaseAssets();
    const assets = assetIds
      ? allAssets.filter(a => assetIds.includes(`${a.version}-${a.asset.category}-${a.asset.id}`))
      : allAssets;
    
    return JSON.stringify(assets, null, 2);
  }
}

// Export singleton
export const storageService = new StorageService();

