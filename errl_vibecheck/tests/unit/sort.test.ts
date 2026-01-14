/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {describe, it, expect} from 'vitest'
import {sortRounds, getDefaultSort} from '../../src/lib/sort.ts'
import type {Round} from '../../src/lib/types.ts'

const createMockRound = (
  prompt: string,
  createdAt: number = Date.now(),
  mode: string = 'p5',
  totalTime: number = 1000
): Round => {
  const outputId = 'output-1' as any
  return {
    id: 'round-1' as any,
    prompt,
    inputImage: null,
    systemInstructions: 'test',
    mode: mode as any,
    createdBy: 'test',
    createdAt,
    outputs: {
      [outputId]: {
        id: outputId,
        model: 'flash' as any,
        mode: mode as any,
        srcCode: 'test',
        state: 'success',
        startTime: createdAt,
        totalTime
      }
    }
  }
}

describe('sort', () => {
  describe('sortRounds', () => {
    it('should sort by newest first', () => {
      const rounds = [
        createMockRound('old', 1000),
        createMockRound('new', 2000),
        createMockRound('middle', 1500)
      ]
      const result = sortRounds(rounds, 'newest')
      expect(result[0]?.createdAt).toBe(2000)
      expect(result[2]?.createdAt).toBe(1000)
    })

    it('should sort by oldest first', () => {
      const rounds = [
        createMockRound('old', 1000),
        createMockRound('new', 2000),
        createMockRound('middle', 1500)
      ]
      const result = sortRounds(rounds, 'oldest')
      expect(result[0]?.createdAt).toBe(1000)
      expect(result[2]?.createdAt).toBe(2000)
    })

    it('should sort by prompt ascending', () => {
      const rounds = [
        createMockRound('zebra'),
        createMockRound('apple'),
        createMockRound('banana')
      ]
      const result = sortRounds(rounds, 'prompt-asc')
      expect(result[0]?.prompt).toBe('apple')
      expect(result[1]?.prompt).toBe('banana')
      expect(result[2]?.prompt).toBe('zebra')
    })

    it('should sort by prompt descending', () => {
      const rounds = [
        createMockRound('apple'),
        createMockRound('zebra'),
        createMockRound('banana')
      ]
      const result = sortRounds(rounds, 'prompt-desc')
      expect(result[0]?.prompt).toBe('zebra')
      expect(result[1]?.prompt).toBe('banana')
      expect(result[2]?.prompt).toBe('apple')
    })

    it('should sort by mode', () => {
      const rounds = [
        createMockRound('test', Date.now(), 'svg'),
        createMockRound('test', Date.now(), 'p5'),
        createMockRound('test', Date.now(), 'html')
      ]
      const result = sortRounds(rounds, 'mode')
      expect(result[0]?.mode).toBe('html')
      expect(result[1]?.mode).toBe('p5')
      expect(result[2]?.mode).toBe('svg')
    })

    it('should sort by fastest', () => {
      const rounds = [
        createMockRound('slow', Date.now(), 'p5', 3000),
        createMockRound('fast', Date.now(), 'p5', 500),
        createMockRound('medium', Date.now(), 'p5', 1500)
      ]
      const result = sortRounds(rounds, 'fastest')
      expect(result[0]?.prompt).toBe('fast')
      expect(result[2]?.prompt).toBe('slow')
    })

    it('should sort by slowest', () => {
      const rounds = [
        createMockRound('fast', Date.now(), 'p5', 500),
        createMockRound('slow', Date.now(), 'p5', 3000),
        createMockRound('medium', Date.now(), 'p5', 1500)
      ]
      const result = sortRounds(rounds, 'slowest')
      expect(result[0]?.prompt).toBe('slow')
      expect(result[2]?.prompt).toBe('fast')
    })
  })

  describe('getDefaultSort', () => {
    it('should return newest as default', () => {
      expect(getDefaultSort()).toBe('newest')
    })
  })
})

