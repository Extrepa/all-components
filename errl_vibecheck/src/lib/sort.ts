/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Round} from './types.ts'
import {values} from './utils.ts'
import models from './models.ts'

export type SortOption = 
  | 'newest'
  | 'oldest'
  | 'prompt-asc'
  | 'prompt-desc'
  | 'mode'
  | 'fastest'
  | 'slowest'

/**
 * Sorts rounds based on the specified option.
 * 
 * @param rounds - Array of rounds to sort
 * @param option - Sort option
 * @returns Sorted array of rounds
 */
export function sortRounds(rounds: Round[], option: SortOption): Round[] {
  const sorted = [...rounds]

  switch (option) {
    case 'newest':
      return sorted.sort((a, b) => b.createdAt - a.createdAt)

    case 'oldest':
      return sorted.sort((a, b) => a.createdAt - b.createdAt)

    case 'prompt-asc':
      return sorted.sort((a, b) => 
        a.prompt.localeCompare(b.prompt)
      )

    case 'prompt-desc':
      return sorted.sort((a, b) => 
        b.prompt.localeCompare(a.prompt)
      )

    case 'mode':
      return sorted.sort((a, b) => 
        a.mode.localeCompare(b.mode)
      )

    case 'fastest': {
      return sorted.sort((a, b) => {
        const aTime = Math.min(
          ...values(a.outputs)
            .filter(o => o.state === 'success' && o.totalTime > 0)
            .map(o => o.totalTime)
        )
        const bTime = Math.min(
          ...values(b.outputs)
            .filter(o => o.state === 'success' && o.totalTime > 0)
            .map(o => o.totalTime)
        )
        return (aTime || Infinity) - (bTime || Infinity)
      })
    }

    case 'slowest': {
      return sorted.sort((a, b) => {
        const aTime = Math.max(
          ...values(a.outputs)
            .filter(o => o.state === 'success' && o.totalTime > 0)
            .map(o => o.totalTime)
        )
        const bTime = Math.max(
          ...values(b.outputs)
            .filter(o => o.state === 'success' && o.totalTime > 0)
            .map(o => o.totalTime)
        )
        return (bTime || 0) - (aTime || 0)
      })
    }

    default:
      return sorted
  }
}

/**
 * Gets the default sort option.
 * 
 * @returns Default sort option
 */
export function getDefaultSort(): SortOption {
  return 'newest'
}

