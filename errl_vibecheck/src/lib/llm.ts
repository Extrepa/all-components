/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {
  type Part,
  type SafetySetting,
  type GenerateContentResponse,
  GoogleGenAI,
  Modality,
  HarmCategory,
  HarmBlockThreshold
} from '@google/genai'
import limit from 'p-limit'

const timeoutMs = 193_333
const maxRetries = 5
const baseDelay = 1_233
const ai = new GoogleGenAI({apiKey: process.env.API_KEY})

type LlmGenParams = {
  model: string
  systemInstruction: string
  prompt: string
  promptImage: string | null
  imageOutput?: boolean
  thinking?: boolean
  thinkingCapable?: boolean
}

// Reduced concurrency to avoid hitting rate limits (429 RESOURCE_EXHAUSTED)
const limiter = limit(1)

/**
 * Wraps a promise with a timeout.
 * 
 * @param promise - The promise to wrap
 * @param ms - Timeout duration in milliseconds
 * @returns Promise that rejects with 'timeout' error if timeout is reached
 * @template T - The type of the promise result
 */
const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeout = new Promise<T>((_, reject) => {
    setTimeout(() => {
      reject(new Error('timeout'))
    }, ms)
  })
  return Promise.race([promise, timeout])
}

/**
 * Generates content using Google Gemini AI models.
 * 
 * Handles retries with exponential backoff, timeouts, and rate limiting.
 * Supports both text and image output, with optional thinking mode.
 * 
 * @param params - Generation parameters
 * @param params.model - Model string (e.g., 'gemini-2.5-flash')
 * @param params.systemInstruction - System prompt/instructions for the model
 * @param params.prompt - User prompt text
 * @param params.promptImage - Optional base64 image data for multi-modal input
 * @param params.imageOutput - Whether to request image output
 * @param params.thinking - Whether thinking mode is enabled
 * @param params.thinkingCapable - Whether model supports thinking mode
 * @returns Promise resolving to generated text or base64 image data URL
 * @throws Error if all retry attempts fail or timeout is reached
 * 
 * @example
 * ```typescript
 * const code = await llmGen({
 *   model: 'gemini-2.5-flash',
 *   systemInstruction: 'You are an expert P5.js developer...',
 *   prompt: 'create a bouncing ball',
 *   promptImage: null,
 *   imageOutput: false,
 *   thinking: false,
 *   thinkingCapable: true
 * })
 * ```
 */
export default ({
  model,
  systemInstruction,
  prompt,
  promptImage,
  imageOutput,
  thinking,
  thinkingCapable
}: LlmGenParams) =>
  limiter(async () => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const modelPromise = ai.models.generateContent({
          model,
          config: {
            systemInstruction,
            safetySettings,
            ...(thinkingCapable && !thinking
              ? {thinkingConfig: {thinkingBudget: 0}}
              : {}),
            ...(imageOutput
              ? {responseModalities: [Modality.TEXT, Modality.IMAGE]}
              : {})
          },
          contents: [
            {
              parts: [
                ...(promptImage
                  ? [
                      {
                        inlineData: {
                          data: promptImage.split(',')[1],
                          mimeType: 'image/png'
                        }
                      }
                    ]
                  : []),
                {text: prompt}
              ]
            }
          ]
        })

        const response = await withTimeout<GenerateContentResponse>(modelPromise, timeoutMs)

        if (imageOutput) {
          const data = response.candidates?.[0]?.content?.parts?.find(
            (p: Part) => p.inlineData
          )?.inlineData?.data

          if (!data) {
            throw new Error('No image data found')
          }

          return 'data:image/png;base64,' + data
        }

        if (!response.text) {
          throw new Error('No text data found')
        }

        return response.text
      } catch (error: unknown) {
        if (attempt === maxRetries - 1) {
          throw error
        }

        const delay = baseDelay * 2 ** attempt
        await new Promise(res => setTimeout(res, delay))
        console.warn(
          `Attempt ${attempt + 1} failed, retrying after ${delay}ms...`
        )
      }
    }
    throw new Error('All retries failed')
  })

const safetySettings: SafetySetting[] = [
  HarmCategory.HARM_CATEGORY_HATE_SPEECH,
  HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
  HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
  HarmCategory.HARM_CATEGORY_HARASSMENT
].map(category => ({category, threshold: HarmBlockThreshold.BLOCK_NONE}))