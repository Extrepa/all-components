/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {Output, Round} from '../lib/types.ts'
import {useState, memo, useEffect} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as styles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import {initializeAudio} from '../lib/useTonePalette.ts'
import c from 'clsx'
import modes from '../lib/modes.ts'
import models from '../lib/models.ts'
import Renderer from './Renderer.tsx'
import {setFullscreenActiveId, toggleFavorite} from '../lib/actions.ts'
import {
  exportOutputCode,
  exportRoundJSON,
  copyToClipboard
} from '../lib/export.ts'

function ModelOutput({output, round}: {output: Output; round: Round}) {
  const [time, setTime] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const isBusy = output.state === 'loading'
  const gotError = output.state === 'error'
  const isImage = output.mode === 'image'
  const isFavorited = round.favoritedOutputIds?.includes(output.id)

  const handleCopyCode = async () => {
    if (output.srcCode) {
      await copyToClipboard(output.srcCode)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    }
  }

  const handleExportCode = () => {
    exportOutputCode(round, output)
  }

  const handleExportJSON = () => {
    exportRoundJSON(round)
  }

  useEffect(() => {
    if (isBusy) {
      const interval = setInterval(
        () => setTime(Date.now() - output.startTime),
        10
      )
      return () => clearInterval(interval)
    }
  }, [output.startTime, isBusy])

  return (
    <div className="modelOutput">
      <div className={c('outputRendering', {flipped: showSource})}>
        {!isImage && (
          <div className="back">
            {showSource ? (
              <SyntaxHighlighter
                language={modes[output.mode]?.syntax}
                style={styles.atomOneDark}
              >
                {output.srcCode}
              </SyntaxHighlighter>
            ) : null}
          </div>
        )}

        <div className="front">
          {gotError && (
            <div className="error">
              <p>
                <span className="icon">error</span>
              </p>
              <p>Response error</p>
            </div>
          )}

          {isBusy && (
            <div
              className="absolute inset-0 p-6 flex flex-col gap-3 overflow-hidden z-10 select-none pointer-events-none"
              style={{background: 'var(--bg-tertiary)'}}
            >
              {isImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-tertiary animate-pulse">
                  <span className="icon text-[48px]">image</span>
                  <div className="text-xs uppercase tracking-widest font-bold">
                    Generating {(time / 1000).toFixed(1)}s
                  </div>
                </div>
              ) : (
                <>
                  <div
                    className="skeleton-line w-1/3"
                    style={{animationDelay: '0ms'}}
                  />
                  <div
                    className="skeleton-line w-1/4"
                    style={{animationDelay: '100ms'}}
                  />
                  <div
                    className="skeleton-line w-1/2"
                    style={{animationDelay: '200ms'}}
                  />
                  <div className="h-2" />
                  <div
                    className="skeleton-line w-2/3"
                    style={{animationDelay: '300ms'}}
                  />
                  <div className="pl-4 flex flex-col gap-3">
                    <div
                      className="skeleton-line w-3/4"
                      style={{animationDelay: '400ms'}}
                    />
                    <div
                      className="skeleton-line w-1/2"
                      style={{animationDelay: '500ms'}}
                    />
                    <div
                      className="skeleton-line w-5/6"
                      style={{animationDelay: '600ms'}}
                    />
                  </div>
                  <div className="h-2" />
                  <div
                    className="skeleton-line w-1/2"
                    style={{animationDelay: '700ms'}}
                  />
                </>
              )}
            </div>
          )}

          {output.srcCode && (
            <Renderer mode={output.mode} code={output.srcCode} />
          )}
        </div>
      </div>

      <div className="modelInfo">
        <div className="modelName">
          <div>
            {models[output.model]?.version} {models[output.model]?.name}
          </div>
          {(time || output.totalTime) && (
            <div className="timer">
              {((isBusy ? time : output.totalTime) / 1000).toFixed(2)}s
            </div>
          )}
        </div>

        <div
          className={c('outputActions', {active: output.state === 'success'})}
        >
          <button
            className={c('iconButton', {
              'bg-primary text-white hover:bg-primary/90 hover:text-white': isFavorited
            })}
            onClick={() => toggleFavorite(round.id, output.id)}
          >
            <span className="icon">
              {isFavorited ? 'bookmark' : 'bookmark_border'}
            </span>
            <span className="tooltip">
              {isFavorited ? 'Remove from saved' : 'Save'}
            </span>
          </button>

          {!isImage && (
            <button
              className="iconButton"
              onClick={() => setShowSource(!showSource)}
            >
              <span className="icon">{showSource ? 'visibility' : 'code'}</span>
              <span className="tooltip">
                View {showSource ? 'rendering' : 'source'}
              </span>
            </button>
          )}

          {!isImage && output.srcCode && (
            <button
              className={c('iconButton', {success: copySuccess})}
              onClick={handleCopyCode}
            >
              <span className="icon">{copySuccess ? 'check' : 'content_copy'}</span>
              <span className="tooltip">
                {copySuccess ? 'Copied!' : 'Copy code'}
              </span>
            </button>
          )}

          {!isImage && output.srcCode && (
            <button className="iconButton" onClick={handleExportCode}>
              <span className="icon">file_download</span>
              <span className="tooltip">Download code</span>
            </button>
          )}

          <button className="iconButton" onClick={handleExportJSON}>
            <span className="icon">download</span>
            <span className="tooltip">Download JSON</span>
          </button>

          <button
            className="iconButton"
            onClick={async () => {
              await initializeAudio()
              setFullscreenActiveId(output.id)
            }}
          >
            <span className="icon">fullscreen</span>
            <span className="tooltip">Fullscreen</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default memo(ModelOutput)