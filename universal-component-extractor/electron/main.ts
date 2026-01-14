import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

interface Settings {
  provider: string;
  apiKeys: Record<string, string>;
  model: string;
  ollamaUrl?: string;
}

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Get directory path - in production, resources are in app.asar or Resources folder
// Note: In CommonJS, __dirname is available, but we need to compute it for our use case
function getAppDir() {
  if (isDev) {
    // In development, files are in dist-electron after compilation
    return path.resolve(process.cwd(), 'dist-electron');
  } else {
    // In production: app is packaged, resources are in app.asar or Resources
    // dist-electron/main.cjs is in the same folder as the app
    return path.join(path.dirname(process.execPath), '..', 'dist-electron');
  }
}

const appDir = getAppDir();

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    backgroundColor: '#111827',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(appDir, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(appDir, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for settings
const defaultSettings: Settings = {
  provider: 'ollama',
  apiKeys: {},
  model: 'llama3.2',
  ollamaUrl: 'http://localhost:11434',
};

// Use dynamic import for electron-store since it's an ES module
let store: any = null;

async function initStore() {
  if (!store) {
    // Use Function constructor to get actual dynamic import (not compiled by TypeScript)
    const dynamicImport = new Function('specifier', 'return import(specifier)');
    const StoreModule = await dynamicImport('electron-store');
    const Store = StoreModule.default;
    store = new Store({
      defaults: {
        settings: defaultSettings,
      },
    });
  }
  return store;
}

ipcMain.handle('get-settings', async () => {
  const storeInstance = await initStore();
  return storeInstance.get('settings', defaultSettings);
});

ipcMain.handle('save-settings', async (_event, settings: Settings) => {
  const storeInstance = await initStore();
  storeInstance.set('settings', settings);
  return true;
});
