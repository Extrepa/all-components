/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Round, Output, ModelKey, ModeKey, Id} from './types.ts'
import {get, set} from './store.ts'
import modes from './modes.ts'
import llmGen from './llm.ts'
import models from './models.ts'
import {keys, entries, values, fromEntries} from './utils.ts'

/**
 * Initializes the application state.
 * Cleans up failed outputs from persisted user rounds on first load.
 * Should be called once at application startup.
 */
export const init = () => {
  if (get().didInit) {
    return
  }

  set(state => {
    state.didInit = true

    if (state?.userRounds?.length) {
      state.userRounds = state.userRounds.flatMap(round => {
        const prunedOutputs = Object.entries(round.outputs).filter(
          ([, output]: [string, Output]) => output.state === 'success'
        )

        return prunedOutputs.length
          ? {
              ...round,
              outputs: Object.fromEntries(prunedOutputs)
            }
          : []
      })
    }
  })
}

const newOutput = (model: ModelKey, mode: ModeKey): Output => ({
  model,
  mode,
  id: crypto.randomUUID(),
  srcCode: '',
  state: 'loading',
  startTime: Date.now(),
  totalTime: 0
})

/**
 * Adds a new round to the feed and generates outputs using AI.
 * 
 * Creates a new round with the given prompt and generates outputs based on
 * batch mode or versus mode settings. Each output is generated asynchronously
 * and updates the state as it completes.
 * 
 * @param prompt - The user's prompt text for code generation
 * @param inputImage - Optional base64-encoded image data (data:image/png;base64,...)
 * @param options - Optional configuration overrides
 * @param options.outputMode - Override current output mode (P5.js, SVG, etc.)
 * @param options.batchMode - Enable batch mode (multiple outputs from same model)
 * @param options.batchSize - Number of outputs to generate in batch mode
 * @param options.batchModel - Model to use for batch generation
 * @param options.versusModels - Model selection for versus mode comparison
 * @returns Promise that resolves when round is added (outputs generate asynchronously)
 * 
 * @example
 * ```typescript
 * // Simple generation with current settings
 * await addRound('create a bouncing ball', null)
 * 
 * // Batch mode with 5 variations
 * await addRound('minimalist clock', null, {
 *   batchMode: true,
 *   batchSize: 5,
 *   batchModel: 'flash'
 * })
 * 
 * // Versus mode comparing two models
 * await addRound('cat wearing jetpack', null, {
 *   versusModels: { flash: true, pro: true }
 * })
 * ```
 */
export const addRound = async (
  prompt: string,
  inputImage: string | null,
  options?: {
    outputMode?: ModeKey
    batchMode?: boolean
    batchSize?: number
    batchModel?: ModelKey
    versusModels?: {[key in ModelKey]?: boolean}
  }
) => {
  const state = get()

  // Use provided options or fall back to current state
  const outputMode = options?.outputMode ?? state.outputMode
  const batchMode = options?.batchMode ?? state.batchMode
  const batchSize = options?.batchSize ?? state.batchSize
  const batchModel = options?.batchModel ?? state.batchModel
  const versusModels = options?.versusModels ?? state.versusModels

  scrollTo({top: 0, left: 0, behavior: 'smooth'})

  if (!batchMode && values(versusModels).every(active => !active)) {
    return
  }

  const newRound: Round = {
    prompt,
    inputImage,
    id: crypto.randomUUID(),
    mode: outputMode,
    systemInstructions: modes[outputMode].systemInstruction,
    createdAt: Date.now(),
    createdBy: 'anonymous',
    outputs: Object.fromEntries(
      (batchMode
        ? Array(batchSize)
            .fill(null)
            .map(() => {
              const output = newOutput(batchModel, outputMode)
              return [output.id, output]
            })
        : entries(versusModels)
            .filter(([, active]) => active)
            .map(([model]) => {
              const output = newOutput(model as ModelKey, outputMode)
              return [output.id, output]
            })) as [Id, Output][]
    ) as Round['outputs']
  }

  values(newRound.outputs).forEach(async output => {
    let res

    if (models[output.model] === undefined) {
      console.error(`Model ${output.model} not found`)
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)
        if (!round) {
          return
        }
        const o = round.outputs[output.id]
        if (o) {
          o.state = 'error'
        }
      })
      return
    }

    try {
      res = await llmGen({
        model: models[output.model]!.modelString,
        systemInstruction: modes[newRound.mode].systemInstruction,
        prompt: newRound.prompt,
        promptImage: newRound.inputImage,
        imageOutput: modes[newRound.mode].imageOutput,
        thinking: models[output.model]!.thinking,
        thinkingCapable: models[output.model]!.thinkingCapable
      })
    } catch (e) {
      console.error(e)
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)
        if (!round) {
          return
        }
        const o = round.outputs[output.id]
        if (o) {
          o.state = 'error'
        }
      })
      return
    } finally {
      set(state => {
        const o = state.feed.find(round => round.id === newRound.id)?.outputs[
          output.id
        ]

        if (o) {
          o.totalTime = Date.now() - o.startTime
        }
      })
    }

    if (res) {
      set(state => {
        const round = state.feed.find(round => round.id === newRound.id)

        if (!round) {
          return
        }

        const o = round.outputs[output.id]

        if (o) {
          o.srcCode = res
            .replace(/```\w+/gm, '')
            .replace(/```\n?$/gm, '')
            .trim()
          o.state = 'success'

          const userRound = state.userRounds.find(
            round => round.id === newRound.id
          )

          if (userRound) {
            userRound.outputs[output.id] = o
          }
        }
      })
    }
  })

  set(state => {
    state.userRounds.unshift(newRound)
    state.feed = state.userRounds
  })
}

/**
 * Removes a round from both the feed and user rounds.
 * 
 * @param id - The ID of the round to remove
 */
export const removeRound = (id: string) =>
  set(state => {
    state.feed = state.feed.filter(round => round.id !== id)
    state.userRounds = state.userRounds.filter(round => round.id !== id)
  })

/**
 * Toggles the favorite status of an output.
 * 
 * If the output is favorited, it will be unfavorited and vice versa.
 * Updates both userRounds and feed to keep them in sync.
 * 
 * @param roundId - The ID of the round containing the output
 * @param outputId - The ID of the output to toggle
 */
export const toggleFavorite = (roundId: string, outputId: Id) =>
  set(state => {
    const toggle = (r: Round) => {
      if (!r.favoritedOutputIds) r.favoritedOutputIds = []
      const idx = r.favoritedOutputIds.indexOf(outputId)
      if (idx !== -1) r.favoritedOutputIds.splice(idx, 1)
      else r.favoritedOutputIds.push(outputId)
    }

    const userRound = state.userRounds.find(r => r.id === roundId)
    if (userRound) toggle(userRound)

    const feedRound = state.feed.find(r => r.id === roundId)
    if (feedRound) toggle(feedRound)
  })

export const showFavorites = () =>
  set(state => {
    state.activeCollectionId = null
    state.activeResultId = null
    state.feed = state.userRounds
      .filter(r => r.favoritedOutputIds && r.favoritedOutputIds.length > 0)
      .map(r => ({...r, favoritesOnly: true}))
  })

export const setOutputMode = (mode: ModeKey) =>
  set(state => {
    state.outputMode = mode
  })

export const setBatchModel = (model: ModelKey) =>
  set(state => {
    state.batchModel = model
  })

export const setBatchMode = (active: boolean) =>
  set(state => {
    state.batchMode = active

    if (!active && state.outputMode === 'image') {
      state.outputMode = keys(modes)[0]!
    }
  })

export const setBatchSize = (size: number) =>
  set(state => {
    state.batchSize = size
  })

export const setVersusModel = (model: ModelKey, active: boolean) =>
  set(state => {
    state.versusModels[model] = active
  })

export const reset = () =>
  set(state => {
    state.feed = []
  })

export const setFullscreenActiveId = (id: Id | null) =>
  set(state => {
    state.fullscreenActiveId = id
  })

export const setFullscreenAnimate = (active: boolean) =>
  set(state => {
    state.fullscreenAnimate = active
  })

export const setFullscreenShowCode = (active: boolean) =>
  set(state => {
    state.fullscreenShowCode = active
  })

export const setFullscreenSound = (active: boolean) =>
  set(state => {
    state.fullScreenSound = active
  })

export const setScreensaverSound = (active: boolean) =>
  set(state => {
    state.screensaverSound = active
  })

export const setFeed = (feed: Round[]) =>
  set(state => {
    state.feed = feed
  })

export const setScreensaverMode = (active: boolean) =>
  set(state => {
    state.screensaverMode = active
  })

export const setActiveCollectionId = (id: string | null) =>
  set(state => {
    state.activeCollectionId = id
  })

export const setHeaderHeight = (height: number) =>
  set(state => {
    state.headerHeight = height
  })

export const setActiveResultId = (id: string | null) =>
  set(state => {
    state.activeResultId = id
  })

export const setSpecialAllCollectionScreensaverMode = (active: boolean) =>
  set(state => {
    state.specialAllCollectionScreensaverMode = active
  })

/**
 * Sets the search query for filtering the feed.
 * 
 * @param query - Search query string (empty string to clear)
 */
export const setSearchQuery = (query: string) =>
  set(state => {
    state.searchQuery = query
  })

/**
 * Sets the filter mode for the feed.
 * 
 * @param mode - Filter mode ('all' | 'mode' | 'model')
 * @param value - Filter value (mode key, model key, or null)
 */
export const setFilter = (mode: 'all' | 'mode' | 'model', value: string | null) =>
  set(state => {
    if (mode === 'all') {
      state.filterMode = null
      state.filterValue = null
    } else {
      state.filterMode = mode
      state.filterValue = value
    }
  })

/**
 * Sets the sort option for the feed.
 * 
 * @param option - Sort option ('newest' | 'oldest' | 'prompt-asc' | 'prompt-desc' | 'mode' | 'fastest' | 'slowest')
 */
export const setSortOption = (option: 'newest' | 'oldest' | 'prompt-asc' | 'prompt-desc' | 'mode' | 'fastest' | 'slowest') =>
  set(state => {
    state.sortOption = option
  })


init()