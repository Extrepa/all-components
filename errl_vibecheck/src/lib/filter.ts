/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Round, ModeKey, ModelKey} from './types.ts'
import {values} from './utils.ts'

/**
 * Filters rounds based on search query and filter criteria.
 * 
 * @param rounds - Array of rounds to filter
 * @param searchQuery - Text to search for in prompts
 * @param filterMode - Filter type ('mode' | 'model' | null)
 * @param filterValue - Filter value (mode key, model key, or null)
 * @returns Filtered array of rounds
 */
export function filterRounds(
  rounds: Round[],
  searchQuery: string,
  filterMode: 'mode' | 'model' | null,
  filterValue: string | null
): Round[] {
  let filtered = rounds

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filtered = filtered.filter(round => 
      round.prompt.toLowerCase().includes(query) ||
      Object.values(round.outputs).some(output =>
        output.srcCode.toLowerCase().includes(query)
      )
    )
  }

  // Apply mode filter
  if (filterMode === 'mode' && filterValue) {
    filtered = filtered.filter(round => round.mode === filterValue)
  }

  // Apply model filter
  if (filterMode === 'model' && filterValue) {
    filtered = filtered.filter(round =>
      values(round.outputs).some(output => output.model === filterValue)
    )
  }

  return filtered
}

/**
 * Gets unique modes from rounds.
 * 
 * @param rounds - Array of rounds
 * @returns Array of unique mode keys
 */
export function getUniqueModes(rounds: Round[]): ModeKey[] {
  const modes = new Set<ModeKey>()
  rounds.forEach(round => {
    modes.add(round.mode)
  })
  return Array.from(modes)
}

/**
 * Gets unique models from rounds.
 * 
 * @param rounds - Array of rounds
 * @returns Array of unique model keys
 */
export function getUniqueModels(rounds: Round[]): ModelKey[] {
  const models = new Set<ModelKey>()
  rounds.forEach(round => {
    values(round.outputs).forEach(output => {
      models.add(output.model)
    })
  })
  return Array.from(models)
}

