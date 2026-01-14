/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {setScreensaverMode, setFullscreenActiveId} from './actions.ts'
import {use} from './store.ts'

/**
 * Keyboard shortcut handler.
 * Sets up global keyboard shortcuts for the application.
 */
export function setupKeyboardShortcuts() {
  function handleKeyDown(event: KeyboardEvent) {
    // Don't trigger shortcuts when typing in inputs
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement ||
      (event.target instanceof HTMLElement && event.target.isContentEditable)
    ) {
      return
    }

    // Escape key - exit fullscreen/screensaver
    if (event.key === 'Escape') {
      const screensaverMode = use.screensaverMode()
      const fullscreenActiveId = use.fullscreenActiveId()

      if (screensaverMode) {
        setScreensaverMode(false)
        event.preventDefault()
      } else if (fullscreenActiveId) {
        setFullscreenActiveId(null)
        event.preventDefault()
      }
    }

    // Ctrl/Cmd + K - Focus search (if search input exists)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Search"]'
      )
      if (searchInput) {
        searchInput.focus()
        event.preventDefault()
      }
    }

    // Ctrl/Cmd + F - Focus search (alternative)
    if ((event.ctrlKey || event.metaKey) && event.key === 'f' && !event.shiftKey) {
      const searchInput = document.querySelector<HTMLInputElement>(
        'input[placeholder*="Search"]'
      )
      if (searchInput) {
        searchInput.focus()
        event.preventDefault()
      }
    }
  }

  window.addEventListener('keydown', handleKeyDown)

  // Return cleanup function
  return () => {
    window.removeEventListener('keydown', handleKeyDown)
  }
}

