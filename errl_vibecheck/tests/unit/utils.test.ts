/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {describe, it, expect} from 'vitest'
import {keys, values, entries, fromEntries, identity, scrollToPosition} from '../../src/lib/utils.ts'

describe('utils', () => {
  describe('keys', () => {
    it('should return type-safe keys', () => {
      const obj = {a: 1, b: 2, c: 3}
      const result = keys(obj)
      expect(result).toEqual(['a', 'b', 'c'])
      expect(result[0]).toBe('a')
    })
  })

  describe('values', () => {
    it('should return type-safe values', () => {
      const obj = {a: 1, b: 2, c: 3}
      const result = values(obj)
      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('entries', () => {
    it('should return type-safe entries', () => {
      const obj = {a: 1, b: 2}
      const result = entries(obj)
      expect(result).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('fromEntries', () => {
    it('should reconstruct object from entries', () => {
      const entries: [string, number][] = [['a', 1], ['b', 2]]
      const result = fromEntries(entries as any)
      expect(result).toEqual({a: 1, b: 2})
    })
  })

  describe('identity', () => {
    it('should return input unchanged', () => {
      expect(identity(5)).toBe(5)
      expect(identity('test')).toBe('test')
      expect(identity({a: 1})).toEqual({a: 1})
    })
  })

  describe('scrollToPosition', () => {
    it('should scroll element to position', async () => {
      const element = document.createElement('div')
      element.style.height = '1000px'
      element.style.overflow = 'auto'
      document.body.appendChild(element)

      // Mock scrollTop
      Object.defineProperty(element, 'scrollTop', {
        writable: true,
        value: 0,
      })

      const promise = scrollToPosition(element, 500, 100)
      await promise

      expect(element.scrollTop).toBe(500)
      document.body.removeChild(element)
    })
  })
})

