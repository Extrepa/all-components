/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Intro from './Intro.tsx'
import {Header} from './Header.tsx'
import {Collection} from './Collection.tsx'
import {use} from '../lib/store.ts'
import FeedItem from './FeedItem.tsx'
import {FullscreenOverlay} from './FullscreenOverlay.tsx'
import {Screensaver} from './Screensaver.tsx'
import {initializeAudio} from '../lib/useTonePalette.ts'
import {setActiveCollectionId, setActiveResultId, setScreensaverMode} from '../lib/actions.ts'
import {useEffect, useMemo} from 'react'
import {Result} from './Result.tsx'
import {filterRounds} from '../lib/filter.ts'
import {sortRounds} from '../lib/sort.ts'
import {setupKeyboardShortcuts} from '../lib/keyboard.ts'

export function App() {
  const fullscreenActiveId = use.fullscreenActiveId()
  const screensaverMode = use.screensaverMode()
  const feed = use.feed()
  const activeCollectionId = use.activeCollectionId()
  const activeResultId = use.activeResultId()
  const searchQuery = use.searchQuery()
  const filterMode = use.filterMode()
  const filterValue = use.filterValue()
  const sortOption = use.sortOption()

  const headerHeight = use.headerHeight()

  // Apply filters and sorting to feed
  const filteredFeed = useMemo(() => {
    if (activeCollectionId || activeResultId) {
      return feed // Don't filter/sort collections or single results
    }
    let filtered = filterRounds(feed, searchQuery, filterMode, filterValue)
    filtered = sortRounds(filtered, sortOption)
    return filtered
  }, [feed, searchQuery, filterMode, filterValue, sortOption, activeCollectionId, activeResultId])

  useEffect(() => {
    function processHash() {
      const hash = window.location.hash
      if (!hash) return null

      let somethingMatched = false
      const collectionMatch = hash.match(/vibecheckcollection([^&]+)/)
      if (collectionMatch) {
        somethingMatched = true
        setActiveCollectionId(collectionMatch[1]!)
      }
      const resultMatch = hash.match(/vibecheck_([^&]+)/)
      if (resultMatch) {
        somethingMatched = true
        const stripFileExtension = (id: string) => {
          return id.replace(/\.[^/.]+$/, '')
        }
        setActiveResultId(stripFileExtension(resultMatch[0]!))
      }

      if (somethingMatched === false) {
        setActiveCollectionId(null)
        setActiveResultId(null)
      }
    }
    processHash()
  }, [])

  // Setup keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts()
    return cleanup
  }, [])

  return (
    <>
      <Header activeCollectionId={activeCollectionId} />
      {activeCollectionId ? (
        <Collection id={activeCollectionId} />
      ) : activeResultId ? (
        <Result id={activeResultId} />
      ) : feed.length === 0 ? (
        <Intro />
      ) : (
        <div>
          <div
            className="flex sticky w-full items-center z-100 bg-primary py-2 justify-between text-primary px-3 border-b border-secondary h-auto"
            style={{top: `${headerHeight}px`}}
          >
            <div>Your Generations</div>
            <button
              className="chip"
              onClick={() => {
                initializeAudio()
                setScreensaverMode(true)
              }}
            >
              <span className="icon">🖥️</span>
              Screensaver Mode
            </button>
          </div>
          <main>
            <ul className="feed">
              {filteredFeed.map(round => (
                <FeedItem key={round.id} round={round} />
              ))}
            </ul>
            {filteredFeed.length === 0 && feed.length > 0 && (
              <div className="text-center py-8 text-secondary">
                No results match your search/filter criteria.
              </div>
            )}
          </main>
        </div>
      )}
      {fullscreenActiveId && <FullscreenOverlay />}
      {screensaverMode && <Screensaver />}
    </>
  )
}

export default App