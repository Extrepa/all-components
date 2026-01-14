/**
 * Script to test pet URL endpoints
 * Run with: npx tsx scripts/testPetUrls.ts [petId1] [petId2] ...
 * Or test example: npx tsx scripts/testPetUrls.ts 5000004
 */

import { testPetUrls, testMultiplePets, analyzePetUrlPatterns } from '../utils/petUrlTester';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Test the example pet ID
    console.log('Testing example pet: 5000004');
    const result = await testPetUrls(5000004, '210');
    
    console.log('\n=== Test Results ===');
    console.log(`Pet ID: ${result.petId}`);
    console.log(`Version: ${result.version}`);
    console.log('\nEndpoint Results:');
    result.endpoints.forEach(endpoint => {
      const status = endpoint.works ? '✓ WORKS' : '✗ FAILED';
      console.log(`  ${status}: ${endpoint.url}`);
      if (endpoint.status) console.log(`    Status: ${endpoint.status}`);
      if (endpoint.error) console.log(`    Error: ${endpoint.error}`);
    });
    
    if (result.workingUrl) {
      console.log(`\n✓ Working URL: ${result.workingUrl}`);
    } else {
      console.log('\n✗ No working URL found for this pet');
    }
  } else {
    // Test multiple pet IDs
    const petIds = args.map(arg => parseInt(arg, 10)).filter(id => !isNaN(id));
    
    if (petIds.length === 0) {
      console.error('Invalid pet IDs provided');
      process.exit(1);
    }
    
    console.log(`Testing ${petIds.length} pet(s)...\n`);
    const results = await testMultiplePets(petIds, '210');
    
    console.log('\n=== Individual Results ===');
    results.forEach(result => {
      console.log(`\nPet ${result.petId}:`);
      if (result.workingUrl) {
        console.log(`  ✓ Working: ${result.workingUrl}`);
      } else {
        console.log(`  ✗ No working endpoint found`);
        result.endpoints.forEach(ep => {
          if (ep.works) console.log(`    ✓ ${ep.url}`);
        });
      }
    });
    
    console.log('\n=== Pattern Analysis ===');
    const analysis = analyzePetUrlPatterns(results);
    
    console.log('\nEndpoint Success Rates:');
    analysis.patterns.forEach(pattern => {
      const percentage = (pattern.successRate * 100).toFixed(1);
      console.log(`  ${pattern.endpoint}: ${percentage}% (${pattern.petIds.length} pets)`);
    });
    
    if (analysis.failingPets.length > 0) {
      console.log(`\n✗ Pets with no working endpoints: ${analysis.failingPets.join(', ')}`);
    }
  }
}

main().catch(console.error);

