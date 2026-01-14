/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Models, Model} from './types.ts'

const models = {
  lite: {
    name: 'Flash-Lite',
    version: '2.5',
    modelString: 'gemini-2.5-flash-lite',
    shortName: 'Lite',
    thinkingCapable: false,
    thinking: false,
    imageOutput: false,
    order: 1
  },
  flash: {
    name: 'Flash (thinking off)',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: false,
    imageOutput: false,
    order: 2
  },
  flashThinking: {
    name: 'Flash',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: true,
    imageOutput: false,
    order: 3
  },
  pro: {
    name: 'Pro',
    version: '2.5',
    modelString: 'gemini-2.5-pro',
    shortName: 'Pro',
    thinkingCapable: true,
    thinking: true,
    imageOutput: false,
    order: 4
  },
  threePro: {
    name: 'Pro',
    version: '3',
    modelString: 'gemini-3-pro-preview',
    shortName: 'Pro',
    thinkingCapable: true,
    thinking: true,
    imageOutput: false,
    order: 7
  }
  // flashImage: {
  //   name: 'Flash Image',
  //   version: '2.0',
  //   modelString: 'gemini-2.0-flash-preview-image-generation',
  //   shortName: 'Flash Image',
  //   thinkingCapable: false,
  //   thinking: false,
  //   imageOutput: true,
  //   order: 7
  // }
} as const

export const activeModelKeys = [
  'lite',
  'flash',
  'flashThinking',
  'pro',
  'threePro'
] as const

export type ActiveModelKey = (typeof activeModelKeys)[number]

let _activeModels = {} as Record<ActiveModelKey, Model>
activeModelKeys.forEach(key => {
  _activeModels[key] = models[key]
})
export const activeModels = _activeModels as {
  [K in ActiveModelKey]: (typeof models)[K]
}

export default models as Models