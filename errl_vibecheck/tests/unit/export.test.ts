/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest'
import {
  exportOutput,
  exportRound,
  downloadFile,
  copyToClipboard,
  exportOutputCode,
  exportRoundJSON
} from '../../src/lib/export.ts'
import type {Round, Output} from '../../src/lib/types.ts'

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url')
global.URL.revokeObjectURL = vi.fn()

// Mock document.createElement and appendChild
const mockLink = {
  href: '',
  download: '',
  click: vi.fn(),
  remove: vi.fn()
}

const mockTextArea = {
  value: '',
  style: {
    position: '',
    opacity: ''
  },
  select: vi.fn(),
  remove: vi.fn()
}

beforeEach(() => {
  vi.clearAllMocks()
  document.createElement = vi.fn((tag: string) => {
    if (tag === 'a') return mockLink as any
    if (tag === 'textarea') return mockTextArea as any
    return {} as any
  })
  document.body.appendChild = vi.fn()
  document.body.removeChild = vi.fn()
  document.execCommand = vi.fn().mockReturnValue(true)
  Object.assign(navigator, {
    clipboard: {
      writeText: vi.fn().mockResolvedValue(undefined)
    }
  })
})

afterEach(() => {
  vi.restoreAllMocks()
})

const createMockRound = (): Round => ({
  id: 'round-1' as any,
  prompt: 'test prompt',
  inputImage: null,
  systemInstructions: 'test instructions',
  mode: 'p5',
  createdBy: 'test',
  createdAt: 1000,
  outputs: {}
})

const createMockOutput = (): Output => ({
  id: 'output-1' as any,
  model: 'flash',
  mode: 'p5',
  srcCode: 'function setup() {}',
  state: 'success',
  startTime: 1000,
  totalTime: 2000
})

describe('export', () => {
  describe('exportOutput', () => {
    it('should export output in correct format', () => {
      const round = createMockRound()
      const output = createMockOutput()
      const result = exportOutput(round, output)

      expect(result.id).toBe(output.id)
      expect(result.batchId).toBe(round.id)
      expect(result.type).toBe(round.mode)
      expect(result.prompt).toBe(round.prompt)
      expect(result.code).toBe(output.srcCode)
      expect(result.generateionTime).toBe(output.totalTime)
    })
  })

  describe('exportRound', () => {
    it('should export round as JSON string', () => {
      const round = createMockRound()
      const output = createMockOutput()
      round.outputs = {[output.id]: output}

      const result = exportRound(round)
      const parsed = JSON.parse(result)

      expect(parsed.round.id).toBe(round.id)
      expect(parsed.outputs).toHaveLength(1)
      expect(parsed.outputs[0].id).toBe(output.id)
    })

    it('should only export successful outputs', () => {
      const round = createMockRound()
      const successOutput = createMockOutput()
      const errorOutput: Output = {
        ...createMockOutput(),
        id: 'output-2' as any,
        state: 'error'
      }
      round.outputs = {
        [successOutput.id]: successOutput,
        [errorOutput.id]: errorOutput
      }

      const result = exportRound(round)
      const parsed = JSON.parse(result)

      expect(parsed.outputs).toHaveLength(1)
      expect(parsed.outputs[0].id).toBe(successOutput.id)
    })
  })

  describe('downloadFile', () => {
    it('should create and click download link', () => {
      const content = 'test content'
      const filename = 'test.txt'

      downloadFile(content, filename)

      expect(document.createElement).toHaveBeenCalledWith('a')
      expect(mockLink.download).toBe(filename)
      expect(mockLink.href).toBe('blob:mock-url')
      expect(mockLink.click).toHaveBeenCalled()
      expect(document.body.appendChild).toHaveBeenCalled()
      expect(document.body.removeChild).toHaveBeenCalled()
    })

    it('should handle Blob content', () => {
      const blob = new Blob(['test'], {type: 'text/plain'})
      downloadFile(blob, 'test.txt')

      expect(global.URL.createObjectURL).toHaveBeenCalledWith(blob)
    })
  })

  describe('copyToClipboard', () => {
    it('should copy text to clipboard', async () => {
      const text = 'test code'
      await copyToClipboard(text)

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text)
    })

    it('should fallback to execCommand if clipboard API fails', async () => {
      const text = 'test code'
      const execCommand = vi.fn().mockReturnValue(true)
      document.execCommand = execCommand

      // Mock clipboard API to fail
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockRejectedValue(new Error('Clipboard API failed'))
        }
      })

      await copyToClipboard(text)

      expect(document.createElement).toHaveBeenCalledWith('textarea')
      expect(mockTextArea.value).toBe(text)
      expect(execCommand).toHaveBeenCalledWith('copy')
    })
  })

  describe('exportOutputCode', () => {
    it('should download code with correct extension', () => {
      const round = createMockRound()
      const output = createMockOutput()
      round.mode = 'p5'
      output.mode = 'p5'

      exportOutputCode(round, output, 'auto')

      expect(mockLink.download).toContain('.js')
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should use specified format', () => {
      const round = createMockRound()
      const output = createMockOutput()

      exportOutputCode(round, output, 'html')

      expect(mockLink.download).toContain('.html')
    })
  })

  describe('exportRoundJSON', () => {
    it('should download round as JSON', () => {
      const round = createMockRound()
      exportRoundJSON(round)

      expect(mockLink.download).toContain('.json')
      expect(mockLink.click).toHaveBeenCalled()
    })
  })
})

