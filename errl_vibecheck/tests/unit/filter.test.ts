/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {describe, it, expect} from 'vitest'
import {filterRounds, getUniqueModes, getUniqueModels} from '../../src/lib/filter.ts'
import type {Round} from '../../src/lib/types.ts'

const createMockRound = (
  prompt: string,
  mode: string = 'p5',
  model: string = 'flash'
): Round => {
  const outputId = 'output-1' as any
  return {
    id: 'test-id-1' as any,
    prompt,
    inputImage: null,
    systemInstructions: 'test',
    mode: mode as any,
    createdBy: 'test',
    createdAt: Date.now(),
    outputs: {
      [outputId]: {
        id: outputId,
        model: model as any,
        mode: mode as any,
        srcCode: 'test code',
        state: 'success',
        startTime: Date.now(),
        totalTime: 1000,
      },
    },
  }
}

describe('filter', () => {
  describe('filterRounds', () => {
    it('should filter by search query', () => {
      const rounds = [
        createMockRound('bouncing ball'),
        createMockRound('flying cat'),
        createMockRound('dancing robot'),
      ]
      const result = filterRounds(rounds, 'ball', null, null)
      expect(result).toHaveLength(1)
      expect(result[0]?.prompt).toBe('bouncing ball')
    })

    it('should filter by mode', () => {
      const rounds = [
        createMockRound('test 1', 'p5'),
        createMockRound('test 2', 'svg'),
        createMockRound('test 3', 'p5'),
      ]
      const result = filterRounds(rounds, '', 'mode', 'p5')
      expect(result).toHaveLength(2)
      expect(result.every(r => r.mode === 'p5')).toBe(true)
    })

    it('should filter by model', () => {
      const rounds = [
        createMockRound('test 1', 'p5', 'flash'),
        createMockRound('test 2', 'p5', 'pro'),
        createMockRound('test 3', 'p5', 'flash'),
      ]
      const result = filterRounds(rounds, '', 'model', 'flash')
      expect(result).toHaveLength(2)
    })

    it('should combine search and filter', () => {
      const rounds = [
        createMockRound('bouncing ball', 'p5', 'flash'),
        createMockRound('flying ball', 'svg', 'flash'),
        createMockRound('bouncing cat', 'p5', 'pro'),
      ]
      const result = filterRounds(rounds, 'ball', 'mode', 'p5')
      expect(result).toHaveLength(1)
      expect(result[0]?.prompt).toBe('bouncing ball')
    })
  })

  describe('getUniqueModes', () => {
    it('should return unique modes', () => {
      const rounds = [
        createMockRound('test 1', 'p5'),
        createMockRound('test 2', 'svg'),
        createMockRound('test 3', 'p5'),
      ]
      const result = getUniqueModes(rounds)
      expect(result).toHaveLength(2)
      expect(result).toContain('p5')
      expect(result).toContain('svg')
    })
  })

  describe('getUniqueModels', () => {
    it('should return unique models', () => {
      const rounds = [
        createMockRound('test 1', 'p5', 'flash'),
        createMockRound('test 2', 'p5', 'pro'),
        createMockRound('test 3', 'p5', 'flash'),
      ]
      const result = getUniqueModels(rounds)
      expect(result).toHaveLength(2)
      expect(result).toContain('flash')
      expect(result).toContain('pro')
    })
  })
})

