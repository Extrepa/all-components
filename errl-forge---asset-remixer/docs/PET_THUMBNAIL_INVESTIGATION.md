# Pet Thumbnail Investigation Plan

## Overview
Investigate failing pet thumbnails by testing different URL endpoints for each pet and documenting which endpoints work.

## Tools Created

### 1. Console Logging (`components/AssetLibrary.tsx`)
- Added logging to track which pets fail to load
- Logs each endpoint tried and whether it succeeded
- Logs final failure if all endpoints fail

### 2. Pet URL Tester Utility (`utils/petUrlTester.ts`)
- `testPetUrls(petId, version)` - Tests all URL patterns for a single pet
- `testMultiplePets(petIds, version)` - Tests multiple pets
- `analyzePetUrlPatterns(results)` - Analyzes results to find patterns

### 3. Test Script (`scripts/testPetUrls.ts`)
- Command-line script to test pet URLs
- Usage: `npx tsx scripts/testPetUrls.ts [petId1] [petId2] ...`
- Example: `npx tsx scripts/testPetUrls.ts 5000004`

## Investigation Steps

### Step 1: Collect Failing Pet IDs
1. Open the app and navigate to the Pets category
2. Open browser console (F12)
3. Look for log messages like:
   - `[Pet Thumbnail] Pet {id} failed to load from: {url}`
   - `[Pet Thumbnail] Pet {id} failed all endpoints: [...]`
4. Note down the pet IDs that fail

### Step 2: Test Individual Pets
For each failing pet ID:
```bash
npx tsx scripts/testPetUrls.ts 5000004
```

This will test all URL patterns:
- `/pet/{id}/icon`
- `/pet/{id}/stand/0`
- `/pet/{id}/stand/1`
- `/pet/{id}/render`
- `/pet/{id}/render/stand`
- `/pet/{id}/render/0`
- `/pet/{id}/render/1`

### Step 3: Test Multiple Pets
```bash
npx tsx scripts/testPetUrls.ts 5000004 5000005 5000006
```

### Step 4: Analyze Patterns
The script will output:
- Which endpoint works for each pet
- Success rates for each endpoint pattern
- List of pets with no working endpoints

### Step 5: Update Code
Based on findings:
1. Update fallback order in `components/AssetLibrary.tsx` `handleError` function
2. If patterns found, reorder endpoints by success rate
3. If specific pets need special handling, create a mapping

## URL Patterns to Test

For pet ID `5000004` and version `210`, test:
1. `https://maplestory.io/api/GMS/210/pet/5000004/icon`
2. `https://maplestory.io/api/GMS/210/pet/5000004/stand/0`
3. `https://maplestory.io/api/GMS/210/pet/5000004/stand/1`
4. `https://maplestory.io/api/GMS/210/pet/5000004/render`
5. `https://maplestory.io/api/GMS/210/pet/5000004/render/stand`
6. `https://maplestory.io/api/GMS/210/pet/5000004/render/0`
7. `https://maplestory.io/api/GMS/210/pet/5000004/render/1`

## Investigation Results

### Key Finding
**Pets do NOT have separate image URL endpoints** (like `/pet/{id}/icon` or `/pet/{id}/stand/0`). All tested endpoints returned 404 errors.

### Root Cause
Pet images are embedded directly in the pet data object as base64 strings within `frameBooks`:
- Pet list endpoints (`/pet`) only return `{id, name}` objects
- Full pet data (`/pet/{id}`) contains `frameBooks` with animation frames
- Each frame has a base64 `image` property

### Solution Implemented
1. **Created `fetchPetImage()` function** in `services/mapleStoryService.ts`:
   - Fetches full pet data from `/pet/{id}`
   - Extracts image from `frameBooks` (tries: stand, alert, chat, angry, move)
   - Returns data URL: `data:image/png;base64,{image}`

2. **Updated `AssetGridItem` component**:
   - On mount, immediately fetches full pet data for pets
   - Extracts and displays image from frameBooks
   - Falls back to error handler if initial fetch fails
   - Error handler also tries fetching full pet data

3. **Updated `mapResponseToMapleData`**:
   - Checks if pet data includes frameBooks (for v62 cached data)
   - Extracts image if available during mapping

### Testing Results
- All URL endpoint patterns tested returned 404:
  - `/pet/{id}/icon` ❌
  - `/pet/{id}/stand/0` ❌
  - `/pet/{id}/render` ❌
  - `/pet/{id}/render/stand` ❌
- Full pet data endpoint works: `/pet/{id}` ✅
- Images successfully extracted from `frameBooks.stand[0].frames[0].image` ✅

## Next Steps

1. Run the app and collect failing pet IDs from console
2. Test those pet IDs using the test script
3. Document findings
4. Update code based on results

