
import { MapleData, MapleCategory, MapleVersion, AppError } from "../types";
import { createAppError } from "../utils";
import { mapleCacheService } from "./mapleCacheService";

const BASE_URL = 'https://maplestory.io/api/GMS';

// Cache for v62 full lists and v210 pages
// Keys: 
// v62: `${version}-${category}-FULL`
// v210: `${version}-${category}-${query}-${page}`
const cache: Record<string, any[]> = {};

// Failed request cache (temporary cache to avoid repeated failures)
const failedRequests: Record<string, { timestamp: number; count: number }> = {};
const FAILED_REQUEST_TTL = 60000; // 1 minute

// Circuit breaker state
interface CircuitBreakerState {
  isOpen: boolean;
  failures: number;
  lastFailureTime: number;
  successCount: number;
}

const circuitBreakers: Record<string, CircuitBreakerState> = {};
const CIRCUIT_BREAKER_THRESHOLD = 5; // Open after 5 failures
const CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds before half-open
const CIRCUIT_BREAKER_SUCCESS_THRESHOLD = 2; // Close after 2 successes

// Request queue for v210 API
const requestQueue: Array<() => Promise<any>> = [];
let isProcessingQueue = false;
const MAX_CONCURRENT_REQUESTS = 3;
let activeRequests = 0;

// Loading lock to ensure only one version+category loads at a time
let currentLoadingKey: string | null = null;
const loadingLock: Map<string, Promise<any>> = new Map();

const DEFAULT_QUERIES: Record<string, string> = {
  mob: 'Snail',
  npc: 'Admin',
  pet: 'Kino',
  map: 'Henesys',
  item: 'Potion',
  equip: 'Sword',
  hair: 'Black',
  glasses: 'Glasses',
  earrings: 'Earrings',
  hat: 'Hat',
  cape: 'Cape',
  top: 'Top',
  bottom: 'Bottom',
  overall: 'Overall',
  face: 'Face',
  skin: 'Skin',
  character: 'Character',
  gloves: 'Gloves',
  shoes: 'Shoes',
  ring: 'Ring',
  pendant: 'Pendant'
};

const getApiBase = (version: MapleVersion) => `${BASE_URL}/${version}`;

/**
 * Exponential backoff with jitter
 */
const calculateBackoff = (attempt: number, baseDelay: number): number => {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
  return exponentialDelay + jitter;
};

/**
 * Circuit breaker management
 */
const getCircuitBreaker = (key: string): CircuitBreakerState => {
  if (!circuitBreakers[key]) {
    circuitBreakers[key] = {
      isOpen: false,
      failures: 0,
      lastFailureTime: 0,
      successCount: 0
    };
  }
  return circuitBreakers[key];
};

const recordFailure = (key: string): void => {
  const breaker = getCircuitBreaker(key);
  breaker.failures++;
  breaker.lastFailureTime = Date.now();
  breaker.successCount = 0;
  
  if (breaker.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    breaker.isOpen = true;
    console.warn(`[Circuit Breaker] ${key} is now OPEN after ${breaker.failures} failures`);
  }
};

const recordSuccess = (key: string): void => {
  const breaker = getCircuitBreaker(key);
  breaker.failures = 0;
  breaker.successCount++;
  
  if (breaker.isOpen && breaker.successCount >= CIRCUIT_BREAKER_SUCCESS_THRESHOLD) {
    breaker.isOpen = false;
    breaker.successCount = 0;
    console.info(`[Circuit Breaker] ${key} is now CLOSED after ${breaker.successCount} successes`);
  }
};

const isCircuitOpen = (key: string): boolean => {
  const breaker = getCircuitBreaker(key);
  
  if (!breaker.isOpen) return false;
  
  // Check if we should transition to half-open
  const timeSinceLastFailure = Date.now() - breaker.lastFailureTime;
  if (timeSinceLastFailure > CIRCUIT_BREAKER_TIMEOUT) {
    breaker.isOpen = false; // Half-open state
    breaker.successCount = 0;
    console.info(`[Circuit Breaker] ${key} is now HALF-OPEN`);
    return false;
  }
  
  return true;
};

/**
 * Check if request should be skipped due to recent failures
 */
const shouldSkipRequest = (url: string): boolean => {
  const now = Date.now();
  const key = url;
  
  if (failedRequests[key]) {
    const { timestamp, count } = failedRequests[key];
    if (now - timestamp < FAILED_REQUEST_TTL && count >= 3) {
      return true; // Skip if failed 3+ times in the last minute
    }
    // Clean up old entries
    if (now - timestamp >= FAILED_REQUEST_TTL) {
      delete failedRequests[key];
    }
  }
  return false;
};

const recordFailedRequest = (url: string): void => {
  const key = url;
  if (!failedRequests[key]) {
    failedRequests[key] = { timestamp: Date.now(), count: 0 };
  }
  failedRequests[key].count++;
};

/**
 * Request queue processor
 */
const processQueue = async (): Promise<void> => {
  if (isProcessingQueue || requestQueue.length === 0) return;
  
  isProcessingQueue = true;
  
  while (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
    const request = requestQueue.shift();
    if (!request) break;
    
    activeRequests++;
    request()
      .finally(() => {
        activeRequests--;
        if (requestQueue.length > 0) {
          processQueue();
        } else {
          isProcessingQueue = false;
        }
      });
  }
  
  if (requestQueue.length === 0) {
    isProcessingQueue = false;
  }
};

/**
 * Queue a request for v210 API
 */
const queueRequest = <T>(requestFn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

/**
 * Helper: Fetch with Retry Logic, Exponential Backoff, and Circuit Breaker
 */
const fetchWithRetry = async (
  url: string, 
  retries = 3, 
  baseDelay = 1000,
  useCircuitBreaker = true,
  circuitBreakerKey?: string
): Promise<Response> => {
  const cbKey = circuitBreakerKey || url;
  
  // Check circuit breaker
  if (useCircuitBreaker && isCircuitOpen(cbKey)) {
    const error = createAppError(
      new Error("Service temporarily unavailable (circuit breaker open)"),
      { operation: 'maple-api-fetch' }
    );
    throw error;
  }
  
  // Check failed request cache
  if (shouldSkipRequest(url)) {
    const error = createAppError(
      new Error("Request skipped due to recent failures"),
      { operation: 'maple-api-fetch' }
    );
    throw error;
  }
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second strict timeout

    try {
      const res = await fetch(url, { 
          signal: controller.signal 
      });
      clearTimeout(timeoutId);

      // If successful, record success and return
      if (res.ok) {
        if (useCircuitBreaker) {
          recordSuccess(cbKey);
        }
        return res;
      }

      // If client error (4xx), return immediately (don't retry)
      if (res.status >= 400 && res.status < 500) {
        return res;
      }

      // If Server Error (5xx), wait with exponential backoff and retry
      if (res.status >= 500 && res.status < 600) {
        if (useCircuitBreaker) {
          recordFailure(cbKey);
        }
        console.warn(`[API] ${res.status} encountered. Retrying (${i + 1}/${retries})...`);
        if (i < retries - 1) {
          const backoff = calculateBackoff(i, baseDelay);
          await new Promise(resolve => setTimeout(resolve, backoff));
          continue;
        }
      }
      
      return res;
    } catch (e: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = e.name === 'AbortError';
      if (useCircuitBreaker) {
        recordFailure(cbKey);
      }
      recordFailedRequest(url);
      
      console.warn(`[API] ${isTimeout ? 'Request Timed Out' : 'Network Error'}. Retrying (${i + 1}/${retries})...`, e);
      
      if (i < retries - 1) {
        const backoff = calculateBackoff(i, baseDelay);
        await new Promise(resolve => setTimeout(resolve, backoff));
        continue;
      }
      const error = createAppError(
        isTimeout ? new Error("Request timed out (API slow)") : e,
        { operation: 'maple-api-fetch' }
      );
      throw error;
    }
  }
  const error = createAppError(
    new Error("API Unreachable after retries"),
    { operation: 'maple-api-fetch' }
  );
  throw error;
};

/**
 * Returns the specific render/icon URL for a category/ID
 */
export const getIconUrl = (id: number, category: MapleCategory, version: MapleVersion): string => {
  const apiBase = getApiBase(version);
  switch (category) {
    case 'mob': return `${apiBase}/mob/${id}/icon`;
    case 'npc': return `${apiBase}/npc/${id}/icon`;
    case 'pet': 
      // Try /icon first (works for most pets), error handler will try /render as fallback
      return `${apiBase}/pet/${id}/icon`;
    case 'item':
    case 'equip':
    case 'glasses':
    case 'earrings':
    case 'hat':
    case 'cape':
    case 'gloves':
    case 'shoes':
    case 'ring':
    case 'pendant':
    case 'top':
    case 'bottom':
    case 'overall':
    case 'face':
    case 'skin':
    case 'hair':
    case 'character': return `${apiBase}/item/${id}/icon`;
    case 'map': return `${apiBase}/map/${id}/minimap`; 
    default: return '';
  }
};

export const getMapleSpriteUrl = (id: number, category: MapleCategory, version: MapleVersion = '210'): string => {
  const apiBase = getApiBase(version);
  switch (category) {
    case 'mob': return `${apiBase}/mob/${id}/render/stand`;
    case 'npc': return `${apiBase}/npc/${id}/render/stand`;
    case 'pet': 
      // Use /stand/0 endpoint for pets (sprite render, different from icon for fallback)
      return `${apiBase}/pet/${id}/stand/0`;
    case 'item':
    case 'equip':
    case 'glasses':
    case 'earrings':
    case 'hat':
    case 'cape':
    case 'gloves':
    case 'shoes':
    case 'ring':
    case 'pendant':
    case 'top':
    case 'bottom':
    case 'overall':
    case 'face':
    case 'skin':
    case 'hair':
    case 'character': return `${apiBase}/item/${id}/icon`;
    case 'map': return `${apiBase}/map/${id}/render`; 
    default: return `${apiBase}/mob/${id}/render/stand`;
  }
};

/**
 * Main Data Fetcher
 * Handles the logic split between v62 (Client-side) and v210 (Server-side)
 */
export const getPagedMapleData = async (
  category: MapleCategory, 
  version: MapleVersion,
  page: number, 
  limit: number, 
  query: string = '',
  fetchAll: boolean = false
): Promise<{ items: MapleData[], hasMore: boolean }> => {
  
  // -- Strategy 1: GMS v62 (Classic) --
  // Small dataset. Fetch ONCE, cache locally, slice locally.
  if (version === '62') {
    return getV62Data(category, page, limit, query);
  } 

  // -- Strategy 2: Modern versions (v83, v95, v177, v210) --
  // Massive dataset. Fetch PAGES from server. 
  // 'fetchAll' just means "Don't use a search query", effectively browsing the whole list.
  return getV210Data(category, page, limit, query, fetchAll, true, version);
};


// --- v62 Implementation (Client Side Filtering) ---

const getV62Data = async (category: MapleCategory, page: number, limit: number, query: string) => {
  const loadingKey = `v62-${category}`;
  
  // Check if another version+category is currently loading
  if (currentLoadingKey && currentLoadingKey !== loadingKey) {
    // Wait for current load to complete or timeout
    const currentLoad = loadingLock.get(currentLoadingKey);
    if (currentLoad) {
      try {
        await Promise.race([
          currentLoad,
          new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout
        ]);
      } catch (e) {
        // Ignore errors from other loads
      }
    }
  }
  
  // If this version+category is already loading, wait for it
  const existingLoad = loadingLock.get(loadingKey);
  if (existingLoad) {
    await existingLoad;
    // After waiting, check cache again
    const cachedData = await mapleCacheService.get('62', category, '', 0);
    if (cachedData && cachedData.length > 0) {
      const fullList = cachedData.map(item => ({
        id: item.id,
        name: item.name
      }));
      const filtered = query ? fullList.filter((d: any) => d.name && d.name.toLowerCase().includes(query.toLowerCase())) : fullList;
      const start = page * limit;
      const end = start + limit;
      const slice = filtered.slice(start, end);
      return {
        items: mapResponseToMapleData(slice, category, '62'),
        hasMore: end < filtered.length
      };
    }
  }
  
  const cacheKey = `62-${category}-FULL`;
  
  // Check IndexedDB cache first (v62 stores full list, so we check page 0)
  const cachedData = await mapleCacheService.get('62', category, '', 0);
  let fullList: any[] | null = null;
  
  if (cachedData && cachedData.length > 0) {
    // Reconstruct full list from cached data (v62 caches the full list)
    fullList = cachedData.map(item => ({
      id: item.id,
      name: item.name
    }));
  }
  
  // Fallback to memory cache
  if (!fullList) {
    fullList = cache[cacheKey];
  }

  if (!fullList) {
    // Create loading promise and lock
    currentLoadingKey = loadingKey;
    const loadPromise = (async () => {
      try {
        // v62 Logic: Fetch the entire list
        const endpoint = `${getApiBase('62')}/${mapCategoryToEndpoint(category, '62')}`;
        console.log(`[v62] Fetching full list: ${endpoint}`);
        
        // Use circuit breaker for v62 as well
        const circuitBreakerKey = `v62-${category}`;
        const res = await fetchWithRetry(endpoint, 3, 1000, true, circuitBreakerKey);
        if (!res.ok) {
          if (isCircuitOpen(circuitBreakerKey)) {
            recordFailure(circuitBreakerKey);
          }
          throw new Error('Fetch failed');
        }
        fullList = await res.json();
        
        // Record success for circuit breaker
        recordSuccess(circuitBreakerKey);
        
        // Cache in both memory and IndexedDB
        cache[cacheKey] = fullList;
        const mappedData = mapResponseToMapleData(fullList, category, '62');
        await mapleCacheService.set('62', category, '', 0, mappedData).catch(err => {
          console.warn('[Cache] Failed to store in IndexedDB:', err);
        });
        
        // Save successful load state to localStorage
        try {
          const loadState = JSON.parse(localStorage.getItem('mapleLoadState') || '{}');
          loadState[loadingKey] = { success: true, timestamp: Date.now() };
          localStorage.setItem('mapleLoadState', JSON.stringify(loadState));
        } catch (e) {
          console.warn('[Load State] Failed to save to localStorage:', e);
        }
      } catch (e) {
        console.error("[v62] Error:", e);
        const error = createAppError(e, { operation: `v62-${category}-fetch` });
        throw error;
      } finally {
        currentLoadingKey = null;
        loadingLock.delete(loadingKey);
      }
    })();
    
    loadingLock.set(loadingKey, loadPromise);
    await loadPromise;
  }

  // Filter
  let filtered = fullList;
  if (query) {
    const lower = query.toLowerCase();
    filtered = fullList.filter((d: any) => d.name && d.name.toLowerCase().includes(lower));
  }

  // Paginate
  const start = page * limit;
  const end = start + limit;
  const slice = filtered.slice(start, end);

  return {
    items: mapResponseToMapleData(slice, category, '62'),
    hasMore: end < filtered.length
  };
};


// --- v210 Implementation (Server Side Pagination) ---

// Maximum pages for maps to prevent glitches
const MAX_MAP_PAGES = 50; // Limit maps to 50 pages (50 * limit items)

const getV210Data = async (
  category: MapleCategory, 
  page: number, 
  limit: number, 
  query: string, 
  fetchAll: boolean,
  fallbackToV62 = true,
  version: MapleVersion = '210'
): Promise<{ items: MapleData[], hasMore: boolean }> => {
  // Maps have a maximum page limit to prevent glitches
  if (category === 'map' && page >= MAX_MAP_PAGES) {
    return { items: [], hasMore: false };
  }
  
  // If fetchAll is FALSE and query is EMPTY, we use a Default Query to avoid loading the whole DB on init
  let effectiveQuery = query;
  if (!fetchAll && !query) {
     effectiveQuery = DEFAULT_QUERIES[category] || 'a';
  }
  
  const loadingKey = `v${version}-${category}`;
  
  // Check if another version+category is currently loading
  if (currentLoadingKey && currentLoadingKey !== loadingKey) {
    // Wait for current load to complete or timeout
    const currentLoad = loadingLock.get(currentLoadingKey);
    if (currentLoad) {
      try {
        await Promise.race([
          currentLoad,
          new Promise(resolve => setTimeout(resolve, 5000)) // 5 second timeout
        ]);
      } catch (e) {
        // Ignore errors from other loads
      }
    }
  }
  
  // Check IndexedDB cache first
  const cachedData = await mapleCacheService.get(version, category, effectiveQuery || 'ALL', page);
  if (cachedData) {
    return {
      items: cachedData,
      hasMore: cachedData.length === limit
    };
  }
  
  // Fallback to memory cache
  const cacheKey = `${version}-${category}-${effectiveQuery || 'ALL'}-${page}`;
  if (cache[cacheKey]) {
    return { 
      items: mapResponseToMapleData(cache[cacheKey], category, version),
      hasMore: cache[cacheKey].length === limit
    };
  }

  // Use circuit breaker for all versions
  const useCircuitBreaker = true;
  const circuitBreakerKey = `v${version}-${category}`;
  const url = buildV210Url(category, page, limit, effectiveQuery, fetchAll, version);
  
  // If this version+category is already loading, wait for it
  const existingLoad = loadingLock.get(loadingKey);
  if (existingLoad && page === 0) {
    // Only wait for page 0 loads (initial loads)
    try {
      await existingLoad;
      // After waiting, check cache again
      const cachedDataAfterWait = await mapleCacheService.get(version, category, effectiveQuery || 'ALL', page);
      if (cachedDataAfterWait) {
        return {
          items: cachedDataAfterWait,
          hasMore: cachedDataAfterWait.length === limit
        };
      }
    } catch (e) {
      // Continue with new load if waiting failed
    }
  }
  
  try {
    // Use request queue for v210 to respect rate limits
    const result = await queueRequest(async () => {
      // Create loading promise and lock for page 0 (initial loads)
      if (page === 0) {
        currentLoadingKey = loadingKey;
        const loadPromise = (async () => {
          try {
            console.log(`[${version}] Fetching page: ${url}`);
            const res = await fetchWithRetry(url, 3, 1000, useCircuitBreaker, circuitBreakerKey);
            
            if (!res.ok) {
              // v210 specific quirk: 404 sometimes means "No results found" for search
              if (res.status === 404) {
                return { items: [], hasMore: false };
              }
              if (res.status === 503) {
                const error = createAppError(
                  new Error("Service Unavailable (503)"),
                  { operation: `v210-${category}-fetch` }
                );
                throw error;
              }
              const error = createAppError(
                new Error(`API Error ${res.status}`),
                { operation: `v210-${category}-fetch` }
              );
              throw error;
            }

            const data = await res.json();
            
            // Cache in both memory and IndexedDB
            cache[cacheKey] = data;
            const mappedData = mapResponseToMapleData(data, category, version);
            await mapleCacheService.set(version, category, effectiveQuery || 'ALL', page, mappedData).catch(err => {
              console.warn('[Cache] Failed to store in IndexedDB:', err);
            });
            if (useCircuitBreaker) {
              recordSuccess(circuitBreakerKey);
            }

            // Save successful load state to localStorage
            try {
              const loadState = JSON.parse(localStorage.getItem('mapleLoadState') || '{}');
              loadState[loadingKey] = { success: true, timestamp: Date.now() };
              localStorage.setItem('mapleLoadState', JSON.stringify(loadState));
            } catch (e) {
              console.warn('[Load State] Failed to save to localStorage:', e);
            }

            // For maps, enforce maximum page limit
            const hasMoreData = category === 'map' 
              ? data.length === limit && page < MAX_MAP_PAGES - 1
              : data.length === limit;
            
            return {
              items: mappedData,
              hasMore: hasMoreData
            };
          } finally {
            currentLoadingKey = null;
            loadingLock.delete(loadingKey);
          }
        })();
        
        loadingLock.set(loadingKey, loadPromise);
        return await loadPromise;
      } else {
        // For subsequent pages, just fetch normally
        console.log(`[${version}] Fetching page: ${url}`);
        const res = await fetchWithRetry(url, 3, 1000, useCircuitBreaker, circuitBreakerKey);
        
        if (!res.ok) {
          if (res.status === 404) {
            return { items: [], hasMore: false };
          }
          if (res.status === 503) {
            const error = createAppError(
              new Error("Service Unavailable (503)"),
              { operation: `v210-${category}-fetch` }
            );
            throw error;
          }
          const error = createAppError(
            new Error(`API Error ${res.status}`),
            { operation: `v210-${category}-fetch` }
          );
          throw error;
        }

        const data = await res.json();
        
        cache[cacheKey] = data;
        const mappedData = mapResponseToMapleData(data, category, version);
        await mapleCacheService.set(version, category, effectiveQuery || 'ALL', page, mappedData).catch(err => {
          console.warn('[Cache] Failed to store in IndexedDB:', err);
        });
        if (useCircuitBreaker) {
          recordSuccess(circuitBreakerKey);
        }

        const hasMoreData = category === 'map' 
          ? data.length === limit && page < MAX_MAP_PAGES - 1
          : data.length === limit;
        
        return {
          items: mappedData,
          hasMore: hasMoreData
        };
      }
    });
    
    return result;
  } catch (e) {
    console.error("[v210] Error:", e);
    
    // Fallback to v62 if current version is consistently failing (only for non-v62 versions)
    if (useCircuitBreaker && version !== '62' && fallbackToV62 && isCircuitOpen(circuitBreakerKey)) {
      console.warn(`[v${version}] Circuit breaker open, falling back to v62 for ${category}`);
      try {
        const v62Result = await getV62Data(category, page, limit, effectiveQuery);
        return v62Result;
      } catch (v62Error) {
        console.error("[v62] Fallback also failed:", v62Error);
        // Continue to throw original error
      }
    }
    
    // If it was a "Browse All" 500 error, retry with a safe fallback search
    if (fetchAll && !query) {
        console.warn("[v210] Browse All failed, retrying with fallback query...");
        // Fallback to a recursive call with a broad search "a" which is safer than no filter
        // But to avoid infinite loop, we only do this if we haven't already
        return getV210Data(category, page, limit, "a", false, fallbackToV62); 
    }
    // Re-throw if it's already an AppError, otherwise wrap it
    if (e && typeof e === 'object' && 'category' in e) {
      throw e;
    }
    const error = createAppError(e, { operation: `v210-${category}-fetch` });
    throw error;
  }
};

/**
 * Builds the URL for modern version queries (v83, v95, v177, v210)
 */
const buildV210Url = (category: MapleCategory, page: number, limit: number, query: string, fetchAll: boolean, version: MapleVersion = '210') => {
    const apiBase = getApiBase(version);
    let endpoint = `${apiBase}/${mapCategoryToEndpoint(category, version)}`;
    
    const params = new URLSearchParams();
    params.append('count', limit.toString());
    params.append('start', (page * limit).toString());

    // Item subcategories - use proper API structure: overallCategory, category, subCategory
    const itemSubcategoryMap: Record<string, { overallCategory: string; category?: string; subCategory: string }> = {
      'glasses': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Face Accessory' },
      'earrings': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Earrings' },
      'hat': { overallCategory: 'Equip', category: 'Hat', subCategory: 'Hat' },
      'cape': { overallCategory: 'Equip', category: 'Cape', subCategory: 'Cape' },
      'gloves': { overallCategory: 'Equip', category: 'Glove', subCategory: 'Glove' },
      'shoes': { overallCategory: 'Equip', category: 'Shoe', subCategory: 'Shoe' },
      'ring': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Ring' },
      'pendant': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Pendant' },
      'top': { overallCategory: 'Equip', category: 'Top', subCategory: 'Top' },
      'bottom': { overallCategory: 'Equip', category: 'Bottom', subCategory: 'Bottom' },
      'overall': { overallCategory: 'Equip', category: 'Overall', subCategory: 'Overall' },
      // Character subcategories
      'face': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Face' },
      'skin': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Skin' },
      'hair': { overallCategory: 'Equip', category: 'Hair', subCategory: 'Hair' }
    };
    
    // Equip subcategories - use proper API structure
    const equipSubcategoryMap: Record<string, { overallCategory: string; category: string }> = {
      'weapon': { overallCategory: 'Equip', category: 'Weapon' },
      'armor': { overallCategory: 'Equip', category: 'Armor' },
      'shield': { overallCategory: 'Equip', category: 'Shield' },
      'cash': { overallCategory: 'Equip', category: 'Cash' }
    };
    
    // Apply filters based on category type
    if (itemSubcategoryMap[category]) {
      const filter = itemSubcategoryMap[category];
      params.append('overallCategoryFilter', filter.overallCategory);
      if (filter.category) {
        params.append('categoryFilter', filter.category);
      }
      params.append('subCategoryFilter', filter.subCategory);
    } else if (equipSubcategoryMap[category]) {
      const filter = equipSubcategoryMap[category];
      params.append('overallCategoryFilter', filter.overallCategory);
      params.append('categoryFilter', filter.category);
    } else if (category === 'equip') {
      params.append('overallCategoryFilter', 'Equip');
    } else if (category === 'item') {
      params.append('overallCategoryFilter', 'Use');
    }

    // Search Query
    if (query) {
      params.append('searchFor', query);
    } 
    // Browse All Optimizations (prevent timeouts on massive lists)
    else if (fetchAll) {
      if (category === 'mob') {
        params.append('minLevel', '0');
        params.append('maxLevel', '275');
      }
      // Maps are huge - limit to first 1000 results even when browsing all
      if (category === 'map') {
        // Maps will be limited in the getV210Data function
      }
    }

    return `${endpoint}?${params.toString()}`;
};

/**
 * BULK DOWNLOADER UTILITY
 * Iterates through pages to build a full dataset without timing out
 */
export const downloadCategoryArchive = async (
    category: MapleCategory, 
    version: MapleVersion,
    onProgress: (count: number) => void
) => {
    const allItems: any[] = [];
    // CRITICAL: Reduced from 1000 to 100 to prevent API timeouts during bulk fetch
    // v62 uses full list fetch, other versions use pagination
    const limit = version === '62' ? 1000 : 100; 
    let page = 0;
    let keepFetching = true;

    try {
        while (keepFetching) {
            let url = '';
            if (version === '62') {
                 const endpoint = `${getApiBase('62')}/${mapCategoryToEndpoint(category, '62')}`;
                 const res = await fetchWithRetry(endpoint);
                 const data = await res.json();
                 allItems.push(...data);
                 keepFetching = false;
            } else {
                // Modern versions (v83, v95, v177, v210) Paged Loop
                const apiBase = getApiBase(version);
                const endpoint = `${apiBase}/${mapCategoryToEndpoint(category, version)}`;
                const params = new URLSearchParams();
                params.append('count', limit.toString());
                params.append('start', (page * limit).toString());
                
                // Item subcategories - use proper API structure: overallCategory, category, subCategory
                const itemSubcategoryMap: Record<string, { overallCategory: string; category?: string; subCategory: string }> = {
                  'glasses': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Face Accessory' },
                  'earrings': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Earrings' },
                  'hat': { overallCategory: 'Equip', category: 'Hat', subCategory: 'Hat' },
                  'cape': { overallCategory: 'Equip', category: 'Cape', subCategory: 'Cape' },
                  'gloves': { overallCategory: 'Equip', category: 'Glove', subCategory: 'Glove' },
                  'shoes': { overallCategory: 'Equip', category: 'Shoe', subCategory: 'Shoe' },
                  'ring': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Ring' },
                  'pendant': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Pendant' },
                  'top': { overallCategory: 'Equip', category: 'Top', subCategory: 'Top' },
                  'bottom': { overallCategory: 'Equip', category: 'Bottom', subCategory: 'Bottom' },
                  'overall': { overallCategory: 'Equip', category: 'Overall', subCategory: 'Overall' },
                  // Character subcategories
                  'face': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Face' },
                  'skin': { overallCategory: 'Equip', category: 'Accessory', subCategory: 'Skin' },
                  'hair': { overallCategory: 'Equip', category: 'Hair', subCategory: 'Hair' }
                };
                
                // Equip subcategories - use proper API structure
                const equipSubcategoryMap: Record<string, { overallCategory: string; category: string }> = {
                  'weapon': { overallCategory: 'Equip', category: 'Weapon' },
                  'armor': { overallCategory: 'Equip', category: 'Armor' },
                  'shield': { overallCategory: 'Equip', category: 'Shield' },
                  'cash': { overallCategory: 'Equip', category: 'Cash' }
                };
                
                // Apply filters based on category type
                if (itemSubcategoryMap[category]) {
                  const filter = itemSubcategoryMap[category];
                  params.append('overallCategoryFilter', filter.overallCategory);
                  if (filter.category) {
                    params.append('categoryFilter', filter.category);
                  }
                  params.append('subCategoryFilter', filter.subCategory);
                } else if (equipSubcategoryMap[category]) {
                  const filter = equipSubcategoryMap[category];
                  params.append('overallCategoryFilter', filter.overallCategory);
                  params.append('categoryFilter', filter.category);
                } else if (category === 'equip') {
                  params.append('overallCategoryFilter', 'Equip');
                } else if (category === 'item') {
                  params.append('overallCategoryFilter', 'Use');
                }

                url = `${endpoint}?${params.toString()}`;
                
                const res = await fetchWithRetry(url);
                if (!res.ok) throw new Error('Fetch failed');
                const data = await res.json();
                
                allItems.push(...data);
                onProgress(allItems.length);

                if (data.length < limit) {
                    keepFetching = false;
                }
                page++;
                
                // Safety break - 500 pages of 100 = 50,000 items
                if (page > 500) keepFetching = false; 
            }
        }
        
        // Trigger Download
        const blob = new Blob([JSON.stringify(allItems, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `maplestory_${version}_${category}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        return allItems.length;
    } catch (e) {
        console.error("Archive download failed:", e);
        const error = createAppError(e, { operation: `archive-download-${category}` });
        throw error;
    }
};

/**
 * Helper to map category to API endpoint path
 */
const mapCategoryToEndpoint = (category: MapleCategory, version: MapleVersion): string => {
  if (category === 'equip') return 'item'; // Equips are in /item
  // Item subcategories all use the item endpoint
  if (category === 'glasses' || category === 'earrings' || category === 'hat' || category === 'cape' || category === 'gloves' || category === 'shoes' || category === 'ring' || category === 'pendant' || category === 'top' || category === 'bottom' || category === 'overall') return 'item';
  // Character subcategories use the item endpoint
  if (category === 'character' || category === 'face' || category === 'skin' || category === 'pose' || category === 'hair') return 'item';
  // Equip subcategories also use the item endpoint
  if (category === 'weapon' || category === 'armor' || category === 'shield') return 'item';
  return category;
};

/**
 * Extract image from pet frameBooks data
 * Pets have images embedded in frameBooks, not separate URLs
 */
const extractPetImage = (petData: any): string | null => {
  if (!petData || !petData.frameBooks) return null;
  
  // Try to get image from common animation types in order of preference
  const animationTypes = ['stand', 'alert', 'chat', 'angry', 'move'];
  
  for (const animType of animationTypes) {
    const anim = petData.frameBooks[animType];
    if (anim && Array.isArray(anim) && anim.length > 0) {
      const frameBook = anim[0];
      if (frameBook && frameBook.frames && Array.isArray(frameBook.frames) && frameBook.frames.length > 0) {
        const frame = frameBook.frames[0];
        if (frame && frame.image) {
          // Return as data URL
          return `data:image/png;base64,${frame.image}`;
        }
      }
    }
  }
  
  return null;
};

/**
 * Fetch full pet data and extract image
 * This is needed because pet list endpoints only return {id, name}
 */
export const fetchPetImage = async (petId: number, version: MapleVersion = '210'): Promise<string | null> => {
  try {
    const apiBase = getApiBase(version);
    const url = `${apiBase}/pet/${petId}`;
    const res = await fetchWithRetry(url);
    if (!res.ok) return null;
    const petData = await res.json();
    return extractPetImage(petData);
  } catch (e) {
    console.warn(`[Pet Image] Failed to fetch pet ${petId}:`, e);
    return null;
  }
};

/**
 * Helper to map raw API objects to our MapleData type
 */
const mapResponseToMapleData = (rawList: any[], category: MapleCategory, version: MapleVersion): MapleData[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(item => {
    // For pets, try to extract image from frameBooks if available
    let imgUrl = getIconUrl(item.id, category, version);
    if (category === 'pet' && item.frameBooks) {
      const petImage = extractPetImage(item);
      if (petImage) {
        imgUrl = petImage;
      }
    }
    
    return {
      id: item.id,
      name: item.name || `Asset ${item.id}`,
      category: category,
      imgUrl: imgUrl
    };
  });
};

/**
 * Stub for full download compatibility
 */
export const getFullMapleData = async (category: MapleCategory, version: MapleVersion): Promise<MapleData[]> => {
    const { items } = await getPagedMapleData(category, version, 0, 1000, '', true);
    return items;
};
