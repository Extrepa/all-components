/**
 * Utility to test pet URL endpoints and identify which ones work
 */

const BASE_URL = 'https://maplestory.io/api/GMS';

export interface PetUrlTestResult {
  petId: number;
  version: string;
  endpoints: {
    url: string;
    works: boolean;
    status?: number;
    error?: string;
  }[];
  workingUrl?: string;
}

/**
 * Test all possible pet URL endpoints for a given pet ID
 */
export async function testPetUrls(
  petId: number,
  version: string = '210'
): Promise<PetUrlTestResult> {
  const apiBase = `${BASE_URL}/${version}`;
  
  const endpoints = [
    `${apiBase}/pet/${petId}/icon`,
    `${apiBase}/pet/${petId}/stand/0`,
    `${apiBase}/pet/${petId}/stand/1`,
    `${apiBase}/pet/${petId}/render`,
    `${apiBase}/pet/${petId}/render/stand`,
    `${apiBase}/pet/${petId}/render/0`,
    `${apiBase}/pet/${petId}/render/1`,
  ];
  
  const results: PetUrlTestResult['endpoints'] = [];
  let workingUrl: string | undefined;
  
  for (const url of endpoints) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const works = response.ok && response.headers.get('content-type')?.startsWith('image/');
      
      results.push({
        url,
        works,
        status: response.status
      });
      
      if (works && !workingUrl) {
        workingUrl = url;
      }
    } catch (error: any) {
      results.push({
        url,
        works: false,
        error: error.message || 'Network error'
      });
    }
  }
  
  return {
    petId,
    version,
    endpoints: results,
    workingUrl
  };
}

/**
 * Test multiple pet IDs and return results
 */
export async function testMultiplePets(
  petIds: number[],
  version: string = '210'
): Promise<PetUrlTestResult[]> {
  const results: PetUrlTestResult[] = [];
  
  for (const petId of petIds) {
    console.log(`Testing pet ${petId}...`);
    const result = await testPetUrls(petId, version);
    results.push(result);
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}

/**
 * Analyze test results to find patterns
 */
export function analyzePetUrlPatterns(results: PetUrlTestResult[]): {
  workingEndpoints: Map<string, number>; // endpoint pattern -> count
  failingPets: number[];
  patterns: {
    endpoint: string;
    successRate: number;
    petIds: number[];
  }[];
} {
  const workingEndpoints = new Map<string, number>();
  const failingPets: number[] = [];
  const endpointStats = new Map<string, { success: number; total: number; petIds: number[] }>();
  
  for (const result of results) {
    if (!result.workingUrl) {
      failingPets.push(result.petId);
    }
    
    for (const endpoint of result.endpoints) {
      const pattern = endpoint.url.replace(/\/\d+$/, '/{id}').replace(/\/pet\/\d+/, '/pet/{id}');
      
      if (!endpointStats.has(pattern)) {
        endpointStats.set(pattern, { success: 0, total: 0, petIds: [] });
      }
      
      const stats = endpointStats.get(pattern)!;
      stats.total++;
      
      if (endpoint.works) {
        stats.success++;
        stats.petIds.push(result.petId);
        workingEndpoints.set(endpoint.url, (workingEndpoints.get(endpoint.url) || 0) + 1);
      }
    }
  }
  
  const patterns = Array.from(endpointStats.entries()).map(([endpoint, stats]) => ({
    endpoint,
    successRate: stats.total > 0 ? stats.success / stats.total : 0,
    petIds: stats.petIds
  })).sort((a, b) => b.successRate - a.successRate);
  
  return {
    workingEndpoints,
    failingPets,
    patterns
  };
}

