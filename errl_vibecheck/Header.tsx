/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useCallback, useEffect, useMemo, useRef, useState} from 'react'
import {
  addRound as _addRound,
  setOutputMode,
  setBatchMode,
  setBatchModel,
  setBatchSize,
  setVersusModel,
  setFeed,
  setHeaderHeight,
  setActiveCollectionId,
  setActiveResultId,
  showFavorites,
  setSearchQuery,
  setFilter,
  setSortOption
} from '../lib/actions.ts'
import {activeModels, type ActiveModelKey} from '../lib/models.ts'
import c from 'clsx'
import {keys} from '../lib/utils.ts'
import {isTouch} from '../lib/consts.ts'
import modes, {frontpageOrder} from '../lib/modes.ts'
import {use} from '../lib/store.ts'
import type {Preset, ModelKey} from '../lib/types.ts'
import {shuffle} from 'lodash'
import {getUniqueModes, getUniqueModels} from '../lib/filter.ts'
import type {SortOption} from '../lib/sort.ts'

export function Header({
  activeCollectionId
}: {
  activeCollectionId?: string | null
}) {
  const outputMode = use.outputMode()
  const batchModel = use.batchModel()
  const versusModels = use.versusModels()
  const batchMode = use.batchMode()
  const batchSize = use.batchSize()
  const userRounds = use.userRounds()
  const feed = use.feed()
  const searchQuery = use.searchQuery()
  const filterMode = use.filterMode()
  const filterValue = use.filterValue()
  const sortOption = use.sortOption()

  function addRound(...args: Parameters<typeof _addRound>) {
    if (activeCollectionId) {
      setActiveCollectionId(null)
      setActiveResultId(null)
      setFeed([]) // Clear collection when adding a new round
    }
    _addRound(...args)
  }

  // migration for models being deactivated
  useEffect(() => {
    for (const key of keys(versusModels)) {
      if (!activeModels[key as ActiveModelKey]) {
        setVersusModel(key as ModelKey, false)
      }
    }
    if (activeModels[batchModel as ActiveModelKey] === undefined) {
      setBatchModel(keys(activeModels)[0]!)
    }
  }, [activeModels])

  const headerRef = useRef<HTMLElement>(null)
  // Track header height with ResizeObserver
  useEffect(() => {
    if (!headerRef.current) return

    const observer = new ResizeObserver(entries => {
      const height = entries[0]?.contentRect.height
      if (height) {
        setHeaderHeight(height)
      }
    })

    observer.observe(headerRef.current)

    return () => observer.disconnect()
  }, [])

  const [presets, setPresets] = useState<Preset[]>([])
  const [showPresets, setShowPresets] = useState(false)
  const [showModes, setShowModes] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [inputImage, setInputImage] = useState<string | null>(null)

  // Collapse header on small screens
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [_showFullHeader, setShowFullHeader] = useState(false)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  const isSmallScreen = windowWidth < 768
  const showFullHeader = isSmallScreen ? _showFullHeader : true

  const inputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const handleImageSet = async (file: File) => {
    if (file) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setInputImage(base64 as string)
    }
  }

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode]?.presets ?? [])),
    [outputMode]
  )

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  const historyPrompts = useMemo(() => {
    const seen = new Set<string>()
    return userRounds
      .map(r => r.prompt.trim())
      .filter(p => {
        if (!p) return false
        if (seen.has(p)) return false
        seen.add(p)
        return true
      })
      .slice(0, 20)
  }, [userRounds])

  const isSavedView = feed.length > 0 && !!feed[0]?.favoritesOnly
  const savedCount = useMemo(() => {
    return userRounds.filter(
      r => r.favoritedOutputIds && r.favoritedOutputIds.length > 0
    ).length
  }, [userRounds])

  // Get unique modes and models for filters
  const uniqueModes = useMemo(() => getUniqueModes(userRounds), [userRounds])
  const uniqueModels = useMemo(() => getUniqueModels(userRounds), [userRounds])

  return (
    <header ref={headerRef} className={showFullHeader ? '' : 'hide'}>
      <div className="inner-header cursor-pointer">
        <h1
          onClick={() => {
            setActiveCollectionId(null)
            setActiveResultId(null)
            setFeed([])
          }}
        >
          <p>
            Vibe<span>🌡️</span>
          </p>
          <p>Check</p>
        </h1>
        <div className="header-toggle">
          <div className="toggle">
            <button
              className={c('button', {primary: batchMode})}
              onClick={() => setBatchMode(true)}
            >
              <span className="icon">stacks</span> Batch
            </button>
            <button
              className={c('button', {primary: !batchMode})}
              onClick={() => setBatchMode(false)}
            >
              <span className="icon">swords</span> Versus
            </button>
          </div>
          <div className="label">Mode</div>
        </div>
        <div
          className="selectorWrapper header-toggle"
          onMouseEnter={!isTouch ? () => setShowModes(true) : void 0}
          onMouseLeave={!isTouch ? () => setShowModes(false) : void 0}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowModes(true)
                  setShowModels(false)
                  setShowPresets(false)
                }
              : void 0
          }
        >
          <p>
            {modes[outputMode]?.emoji} {modes[outputMode]?.name}
          </p>
          <div className={c('selector', {active: showModes})}>
            <ul>
              {frontpageOrder.map(key => (
                <li key={key}>
                  <button
                    className={c('chip', {primary: key === outputMode})}
                    onClick={() => {
                      setOutputMode(key)
                      setShowModes(false)

                      if (outputMode === 'image') {
                        setBatchModel(keys(activeModels)[1]!)
                      }
                    }}
                  >
                    {modes[key]?.emoji} {modes[key]?.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="label">Output</div>
        </div>
        <div
          className="selectorWrapper header-toggle"
          onMouseEnter={!isTouch ? () => setShowModels(true) : void 0}
          onMouseLeave={!isTouch ? () => setShowModels(false) : void 0}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowModels(true)
                  setShowModes(false)
                  setShowPresets(false)
                }
              : void 0
          }
        >
          <p>
            {batchMode
              ? activeModels[batchModel as ActiveModelKey]?.version +
                ' ' +
                activeModels[batchModel as ActiveModelKey]?.name
              : keys(versusModels).filter(key => versusModels[key]).length +
                ' selected'}
          </p>
          <div className={c('selector', {active: showModels})}>
            <ul>
              {keys(activeModels)
                .filter(key => !activeModels[key]?.imageOutput)
                .map(key => (
                  <li key={key}>
                    <button
                      className={c('chip', {
                        primary: batchMode
                          ? key === batchModel
                          : versusModels[key as ActiveModelKey]
                      })}
                      onClick={() => {
                        if (batchMode) {
                          setBatchModel(key)
                          setShowModels(false)
                        } else {
                          setVersusModel(key as ModelKey, !versusModels[key as ModelKey])
                        }
                      }}
                    >
                      {activeModels[key]?.version} {activeModels[key]?.name}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
          <div className="label">Model{batchMode ? '' : 's'}</div>
        </div>
        <div
          className="imageInput header-toggle"
          style={{position: 'relative'}}
          onClick={() => imageInputRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault()
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleImageSet(e.dataTransfer.files[0])
            }
          }}
        >
          <input
            type="file"
            ref={imageInputRef}
            onChange={e => {
              if (e.target.files && e.target.files[0]) {
                handleImageSet(e.target.files[0])
              }
            }}
            accept="image/*"
          />
          <div className="dropZone">
            {inputImage && <img src={inputImage} />}
            <span className="icon" style={{fontSize: 20}}>
              add_photo_alternate
            </span>
          </div>
          <div className="label">Input image</div>
          {inputImage && (
            <button
              className="iconButton"
              style={{
                position: 'absolute',
                top: -8,
                right: -8,
                width: 22,
                height: 22,
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-primary)',
                zIndex: 20
              }}
              onClick={e => {
                e.stopPropagation()
                setInputImage(null)
                if (imageInputRef.current) {
                  imageInputRef.current.value = ''
                }
              }}
            >
              <span className="icon" style={{fontSize: 14}}>
                close
              </span>
            </button>
          )}
        </div>
        <div
          className="selectorWrapper prompt header-toggle"
          onMouseEnter={!isTouch ? () => setShowPresets(true) : void 0}
          onMouseLeave={!isTouch ? () => setShowPresets(false) : void 0}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowPresets(true)
                  setShowModes(false)
                  setShowModels(false)
                }
              : void 0
          }
        >
          <input
            className="promptInput"
            placeholder="Enter a prompt"
            onFocus={!isTouch ? () => setShowPresets(false) : void 0}
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRound(e.currentTarget.value, inputImage)
                e.currentTarget.blur()
              }
            }}
          />
          <div className={c('selector header-toggle ', {active: showPresets})}>
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2 px-1">
                  Presets
                </div>
                <ul className="presets wrapped">
                  <li>
                    <button
                      onClick={() => {
                        const randomPreset =
                          presets[Math.floor(Math.random() * presets.length)]
                        if (randomPreset) {
                          addRound(randomPreset.prompt, null)
                        }
                        setShowPresets(false)
                      }}
                      className="chip primary"
                    >
                      <span className="icon">Ifl</span>
                      Random prompt
                    </button>
                  </li>
                  {presets.map(({label, prompt}) => (
                    <li key={label}>
                      <button
                        onClick={() => {
                          addRound(prompt, null)
                          setShowPresets(false)
                        }}
                        className="chip"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {historyPrompts.length > 0 && (
                <div>
                  <div className="text-[10px] font-bold text-tertiary uppercase tracking-wider mb-2 px-1 mt-2 border-t border-tertiary pt-2">
                    History
                  </div>
                  <ul className="flex flex-col gap-1">
                    {historyPrompts.map(prompt => (
                      <li key={prompt}>
                        <button
                          className="w-full text-left px-2 py-1.5 rounded text-xs text-secondary hover:text-primary hover:bg-white/5 truncate block transition-colors"
                          onClick={() => {
                            addRound(prompt, null)
                            setShowPresets(false)
                          }}
                          title={prompt}
                        >
                          {prompt}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <div className="label">Prompt</div>
        </div>
        {batchMode && (
          <div className="header-toggle">
            <div className="rangeWrap">
              <div className="batchSize">
                <input
                  type="range"
                  min={1}
                  max={9}
                  value={batchSize}
                  onChange={e => setBatchSize(e.target.valueAsNumber)}
                />{' '}
                {batchSize}
              </div>
            </div>
            <div className="label">Batch size</div>
          </div>
        )}
        <div className="header-toggle">
          <div className="flex gap-1">
            <button
              className={c('circleButton resetButton', {
                'border-primary bg-primary text-white hover:bg-primary/90 hover:text-white':
                  !isSavedView && !activeCollectionId
              })}
              onClick={() => {
                setActiveCollectionId(null)
                setFeed(userRounds)
              }}
            >
              {userRounds.length}
            </button>
            <button
              className={c('circleButton resetButton', {
                'border-primary bg-primary text-white hover:bg-primary/90 hover:text-white': isSavedView
              })}
              onClick={() => {
                showFavorites()
              }}
            >
              <span className="icon text-[14px] leading-none">bookmark</span>
              <span className="text-[10px] absolute -top-1 -right-1 bg-neutral-700 text-white rounded-full w-4 h-4 flex items-center justify-center border border-neutral-900">
                {savedCount}
              </span>
            </button>
          </div>
          <div className="label text-center">Library</div>
        </div>
        {!activeCollectionId && userRounds.length > 0 && (
          <>
            <div className="header-toggle">
              <input
                type="text"
                placeholder="Search prompts..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="promptInput"
                style={{
                  fontSize: '12px',
                  padding: '6px 12px',
                  minWidth: '200px'
                }}
              />
              {searchQuery && (
                <button
                  className="iconButton"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '4px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px'
                  }}
                >
                  <span className="icon" style={{fontSize: '14px'}}>close</span>
                </button>
              )}
              <div className="label">Search</div>
            </div>
            <div className="header-toggle">
              <div className="selectorWrapper shorter">
                <select
                  value={filterMode === 'mode' ? filterValue || '' : filterMode === 'model' ? filterValue || '' : 'all'}
                  onChange={e => {
                    const value = e.target.value
                    if (value === 'all') {
                      setFilter('all', null)
                    } else if (uniqueModes.includes(value as any)) {
                      setFilter('mode', value)
                    } else if (uniqueModels.includes(value as any)) {
                      setFilter('model', value)
                    }
                  }}
                  className="border-primary rounded"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: '4px 24px 6px 12px',
                    fontSize: '12px'
                  }}
                >
                  <option value="all">All</option>
                  {uniqueModes.length > 0 && (
                    <optgroup label="Mode">
                      {uniqueModes.map(mode => (
                        <option key={mode} value={mode}>
                          {modes[mode]?.emoji} {modes[mode]?.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {uniqueModels.length > 0 && (
                    <optgroup label="Model">
                      {uniqueModels.map(model => (
                        <option key={model} value={model}>
                          {activeModels[model as ActiveModelKey]?.version} {activeModels[model as ActiveModelKey]?.name}
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>
              <div className="label">Filter</div>
            </div>
            <div className="header-toggle">
              <div className="selectorWrapper shorter">
                <select
                  value={sortOption}
                  onChange={e => setSortOption(e.target.value as SortOption)}
                  className="border-primary rounded"
                  style={{
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    padding: '4px 24px 6px 12px',
                    fontSize: '12px'
                  }}
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="prompt-asc">Prompt A-Z</option>
                  <option value="prompt-desc">Prompt Z-A</option>
                  <option value="mode">By Mode</option>
                  <option value="fastest">Fastest</option>
                  <option value="slowest">Slowest</option>
                </select>
              </div>
              <div className="label">Sort</div>
            </div>
          </>
        )}
      </div>
      {isSmallScreen && (
        <div
          style={{
            position: 'absolute',
            right: 18,
            top: 18
          }}
        >
          <button
            className="circleButton toggleHeaderButton"
            onClick={() => {
              setShowFullHeader(!_showFullHeader)
            }}
          >
            <span className="icon">
              {showFullHeader ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      )}
    </header>
  )
}