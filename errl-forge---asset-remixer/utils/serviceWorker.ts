/**
 * Service Worker registration and management utilities
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });
      
      console.log('[Service Worker] Registered:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              console.log('[Service Worker] New version available');
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('[Service Worker] Registration failed:', error);
      return null;
    }
  }
  return null;
}

export async function unregisterServiceWorker(): Promise<boolean> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const unregistered = await registration.unregister();
      console.log('[Service Worker] Unregistered:', unregistered);
      return unregistered;
    } catch (error) {
      console.error('[Service Worker] Unregistration failed:', error);
      return false;
    }
  }
  return false;
}

export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator;
}

export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Cache an asset in the service worker
 */
export async function cacheAsset(url: string, data: Blob | ArrayBuffer | string): Promise<void> {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_ASSET',
      url,
      data
    });
  }
}

/**
 * Clear API cache
 */
export async function clearAPICache(): Promise<boolean> {
  return new Promise((resolve) => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const channel = new MessageChannel();
      channel.port1.onmessage = (event) => {
        resolve(event.data.success);
      };
      navigator.serviceWorker.controller.postMessage(
        { type: 'CLEAR_CACHE' },
        [channel.port2]
      );
    } else {
      resolve(false);
    }
  });
}

