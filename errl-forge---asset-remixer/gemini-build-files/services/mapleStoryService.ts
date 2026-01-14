
import { MapleData, MapleCategory, MapleVersion } from "../types";

const BASE_URL = 'https://maplestory.io/api/GMS';

// Cache for v62 full lists and v210 pages
// Keys: 
// v62: `${version}-${category}-FULL`
// v210: `${version}-${category}-${query}-${page}`
const cache: Record<string, any[]> = {};

const DEFAULT_QUERIES: Record<string, string> = {
  mob: 'Snail',
  npc: 'Admin',
  pet: 'Kino',
  map: 'Henesys',
  item: 'Potion',
  equip: 'Sword',
  hair: 'Black',
  face: 'Happy'
};

const getApiBase = (version: MapleVersion) => `${BASE_URL}/${version}`;

/**
 * Helper: Fetch with Retry Logic for 5xx errors AND Timeouts
 */
const fetchWithRetry = async (url: string, retries = 3, baseDelay = 1000): Promise<Response> => {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second strict timeout

    try {
      const res = await fetch(url, { 
          signal: controller.signal 
      });
      clearTimeout(timeoutId);

      // If successful or client error (4xx) that isn't a timeout, return immediately
      if (res.ok || (res.status >= 400 && res.status < 500)) {
        return res;
      }

      // If Server Error (5xx), wait and retry
      if (res.status >= 500 && res.status < 600) {
        console.warn(`[API] ${res.status} encountered. Retrying (${i + 1}/${retries})...`);
        if (i < retries - 1) {
           await new Promise(resolve => setTimeout(resolve, baseDelay * (i + 1)));
           continue;
        }
      }
      
      return res;
    } catch (e: any) {
      clearTimeout(timeoutId);
      
      const isTimeout = e.name === 'AbortError';
      console.warn(`[API] ${isTimeout ? 'Request Timed Out' : 'Network Error'}. Retrying (${i + 1}/${retries})...`, e);
      
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, baseDelay));
        continue;
      }
      throw isTimeout ? new Error("Request timed out (API slow)") : e;
    }
  }
  throw new Error("API Unreachable after retries");
};

/**
 * Returns the specific render/icon URL for a category/ID
 */
const getIconUrl = (id: number, category: MapleCategory, version: MapleVersion): string => {
  const apiBase = getApiBase(version);
  switch (category) {
    case 'mob': return `${apiBase}/mob/${id}/icon`;
    case 'npc': return `${apiBase}/npc/${id}/icon`;
    case 'pet': return `${apiBase}/pet/${id}/icon`; 
    case 'item':
    case 'equip': return `${apiBase}/item/${id}/icon`;
    case 'map': return `${apiBase}/map/${id}/minimap`; 
    case 'hair': return `${apiBase}/character/hair/${id}/icon`;
    case 'face': return `${apiBase}/character/face/${id}/icon`;
    default: return '';
  }
};

export const getMapleSpriteUrl = (id: number, category: MapleCategory, version: MapleVersion = '210'): string => {
  const apiBase = getApiBase(version);
  switch (category) {
    case 'mob': return `${apiBase}/mob/${id}/render/stand`;
    case 'npc': return `${apiBase}/npc/${id}/render/stand`;
    case 'pet': return `${apiBase}/pet/${id}/stand/0`;
    case 'item':
    case 'equip': return `${apiBase}/item/${id}/icon`;
    case 'map': return `${apiBase}/map/${id}/render`; 
    case 'hair': return `${apiBase}/character/hair/${id}/default`; 
    case 'face': return `${apiBase}/character/face/${id}/default`;
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

  // -- Strategy 2: GMS v210 (Modern) --
  // Massive dataset. Fetch PAGES from server. 
  // 'fetchAll' just means "Don't use a search query", effectively browsing the whole list.
  return getV210Data(category, page, limit, query, fetchAll);
};


// --- v62 Implementation (Client Side Filtering) ---

const getV62Data = async (category: MapleCategory, page: number, limit: number, query: string) => {
  const cacheKey = `62-${category}-FULL`;
  let fullList = cache[cacheKey];

  if (!fullList) {
    try {
      // v62 Logic: Fetch the entire list
      const endpoint = `${getApiBase('62')}/${mapCategoryToEndpoint(category, '62')}`;
      console.log(`[v62] Fetching full list: ${endpoint}`);
      
      const res = await fetchWithRetry(endpoint);
      if (!res.ok) throw new Error('Fetch failed');
      fullList = await res.json();
      
      // Cache it
      cache[cacheKey] = fullList;
    } catch (e) {
      console.error("[v62] Error:", e);
      return { items: [], hasMore: false };
    }
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

const getV210Data = async (category: MapleCategory, page: number, limit: number, query: string, fetchAll: boolean) => {
  // If fetchAll is FALSE and query is EMPTY, we use a Default Query to avoid loading the whole DB on init
  let effectiveQuery = query;
  if (!fetchAll && !query) {
     effectiveQuery = DEFAULT_QUERIES[category] || 'a';
  }
  
  // Cache key includes page for v210
  const cacheKey = `210-${category}-${effectiveQuery || 'ALL'}-${page}`;
  
  if (cache[cacheKey]) {
    return { 
      items: mapResponseToMapleData(cache[cacheKey], category, '210'),
      hasMore: cache[cacheKey].length === limit
    };
  }

  try {
    const url = buildV210Url(category, page, limit, effectiveQuery, fetchAll);
    console.log(`[v210] Fetching page: ${url}`);

    const res = await fetchWithRetry(url);
    if (!res.ok) {
        // v210 specific quirk: 404 sometimes means "No results found" for search
        if (res.status === 404) return { items: [], hasMore: false };
        if (res.status === 503) throw new Error("Service Unavailable (503)");
        throw new Error(`API Error ${res.status}`);
    }

    const data = await res.json();
    
    // Cache this page
    cache[cacheKey] = data;

    return {
      items: mapResponseToMapleData(data, category, '210'),
      hasMore: data.length === limit // If we got less than limit, we are at end
    };

  } catch (e) {
    console.error("[v210] Error:", e);
    // If it was a "Browse All" 500 error, retry with a safe fallback search
    if (fetchAll && !query) {
        console.warn("[v210] Browse All failed, retrying with fallback query...");
        // Fallback to a recursive call with a broad search "a" which is safer than no filter
        // But to avoid infinite loop, we only do this if we haven't already
        return getV210Data(category, page, limit, "a", false); 
    }
    throw e;
  }
};

/**
 * Builds the URL for v210 queries
 */
const buildV210Url = (category: MapleCategory, page: number, limit: number, query: string, fetchAll: boolean) => {
    const apiBase = getApiBase('210');
    let endpoint = `${apiBase}/${mapCategoryToEndpoint(category, '210')}`;
    
    const params = new URLSearchParams();
    params.append('count', limit.toString());
    params.append('start', (page * limit).toString());

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
    }

    if (category === 'equip') {
      params.append('overallCategoryFilter', 'Equip');
    } else if (category === 'item') {
      params.append('overallCategoryFilter', 'Use'); 
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
                // v210 Paged Loop
                const apiBase = getApiBase('210');
                const endpoint = `${apiBase}/${mapCategoryToEndpoint(category, '210')}`;
                const params = new URLSearchParams();
                params.append('count', limit.toString());
                params.append('start', (page * limit).toString());
                
                // Add filters for massive categories
                if (category === 'equip') params.append('overallCategoryFilter', 'Equip');
                if (category === 'item') params.append('overallCategoryFilter', 'Use');

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
        throw e;
    }
};

/**
 * Helper to map category to API endpoint path
 */
const mapCategoryToEndpoint = (category: MapleCategory, version: MapleVersion): string => {
  if (category === 'equip') return 'item'; // Equips are in /item
  if (category === 'hair' || category === 'face') return category; // Root endpoints
  return category;
};

/**
 * Helper to map raw API objects to our MapleData type
 */
const mapResponseToMapleData = (rawList: any[], category: MapleCategory, version: MapleVersion): MapleData[] => {
  if (!Array.isArray(rawList)) return [];
  return rawList.map(item => ({
    id: item.id,
    name: item.name || `Asset ${item.id}`,
    category: category,
    imgUrl: getIconUrl(item.id, category, version)
  }));
};

/**
 * Stub for full download compatibility
 */
export const getFullMapleData = async (category: MapleCategory, version: MapleVersion): Promise<MapleData[]> => {
    const { items } = await getPagedMapleData(category, version, 0, 1000, '', true);
    return items;
};
