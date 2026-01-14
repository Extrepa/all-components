/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Round, Output, ExportFormat} from './types.ts'
import models from './models.ts'

/**
 * Exports a single output to the ExportFormat.
 * 
 * @param round - The round containing the output
 * @param output - The output to export
 * @returns ExportFormat object
 */
export function exportOutput(round: Round, output: Output): ExportFormat {
  return {
    id: output.id,
    batchId: round.id,
    type: round.mode,
    inputImage: round.inputImage,
    createdAt: round.createdAt,
    prompt: round.prompt,
    systemInstructions: round.systemInstructions,
    code: output.srcCode,
    model: models[output.model]?.modelString || output.model,
    createdBy: round.createdBy,
    generateionTime: output.totalTime
  }
}

/**
 * Exports a round (all outputs) to JSON format.
 * 
 * @param round - The round to export
 * @returns JSON string
 */
export function exportRound(round: Round): string {
  const outputs = Object.values(round.outputs)
    .filter(output => output.state === 'success')
    .map(output => exportOutput(round, output))
  
  return JSON.stringify({
    round: {
      id: round.id,
      prompt: round.prompt,
      mode: round.mode,
      createdAt: round.createdAt,
      createdBy: round.createdBy
    },
    outputs
  }, null, 2)
}

/**
 * Downloads a file with the given content and filename.
 * 
 * @param content - File content (string or Blob)
 * @param filename - Name of the file to download
 * @param mimeType - MIME type (default: 'text/plain')
 */
export function downloadFile(
  content: string | Blob,
  filename: string,
  mimeType: string = 'text/plain'
): void {
  const blob = typeof content === 'string' 
    ? new Blob([content], {type: mimeType})
    : content
  
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/**
 * Exports an output's code as a file.
 * 
 * @param round - The round containing the output
 * @param output - The output to export
 * @param format - File format ('js', 'html', 'svg', 'glsl', etc.)
 */
export function exportOutputCode(
  round: Round,
  output: Output,
  format: string = 'txt'
): void {
  const mode = round.mode
  const extension = format === 'auto' 
    ? (mode === 'p5' ? 'js' : mode === 'svg' ? 'svg' : mode === 'glsl' ? 'glsl' : 'html')
    : format
  
  const filename = `vibecheck-${round.id.slice(0, 8)}-${output.id.slice(0, 8)}.${extension}`
  downloadFile(output.srcCode, filename, getMimeType(extension))
}

/**
 * Exports a round as JSON file.
 * 
 * @param round - The round to export
 */
export function exportRoundJSON(round: Round): void {
  const json = exportRound(round)
  const filename = `vibecheck-round-${round.id.slice(0, 8)}.json`
  downloadFile(json, filename, 'application/json')
}

/**
 * Copies code to clipboard.
 * 
 * @param code - Code to copy
 * @returns Promise that resolves when copy is complete
 */
export async function copyToClipboard(code: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(code)
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = code
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
  }
}

/**
 * Gets MIME type for a file extension.
 * 
 * @param extension - File extension
 * @returns MIME type string
 */
function getMimeType(extension: string): string {
  const mimeTypes: Record<string, string> = {
    'js': 'text/javascript',
    'html': 'text/html',
    'svg': 'image/svg+xml',
    'glsl': 'text/plain',
    'txt': 'text/plain',
    'json': 'application/json'
  }
  return mimeTypes[extension] || 'text/plain'
}

