import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, X, Save, Eye, EyeOff } from 'lucide-react';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

const API_KEY_STORAGE_KEYS = {
  gemini: 'GEMINI_API_KEY',
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY'
};

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const [apiKeys, setApiKeys] = useState({
    gemini: '',
    openai: '',
    anthropic: ''
  });
  const [showKeys, setShowKeys] = useState({
    gemini: false,
    openai: false,
    anthropic: false
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Load API keys from localStorage
      const gemini = localStorage.getItem(API_KEY_STORAGE_KEYS.gemini) || '';
      const openai = localStorage.getItem(API_KEY_STORAGE_KEYS.openai) || '';
      const anthropic = localStorage.getItem(API_KEY_STORAGE_KEYS.anthropic) || '';
      
      setApiKeys({ gemini, openai, anthropic });
      setSaved(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    // Save to localStorage
    if (apiKeys.gemini) {
      localStorage.setItem(API_KEY_STORAGE_KEYS.gemini, apiKeys.gemini);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEYS.gemini);
    }
    
    if (apiKeys.openai) {
      localStorage.setItem(API_KEY_STORAGE_KEYS.openai, apiKeys.openai);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEYS.openai);
    }
    
    if (apiKeys.anthropic) {
      localStorage.setItem(API_KEY_STORAGE_KEYS.anthropic, apiKeys.anthropic);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEYS.anthropic);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    
    // Trigger a custom event to notify providers to reload
    window.dispatchEvent(new CustomEvent('apiKeysUpdated'));
  };

  const toggleShowKey = (provider: keyof typeof showKeys) => {
    setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }));
  };

  const maskKey = (key: string) => {
    if (!key) return '';
    if (key.length <= 8) return '•'.repeat(key.length);
    return key.substring(0, 4) + '•'.repeat(key.length - 8) + key.substring(key.length - 4);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-blue-900/20 border border-blue-500/30 rounded p-4">
            <p className="text-sm text-blue-300">
              <strong className="font-bold">Note:</strong> API keys are stored locally in your browser. 
              They are never sent to our servers. You can also set them via environment variables in <code className="bg-gray-800 px-1 rounded">.env.local</code>.
            </p>
          </div>

          {/* Gemini API Key */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Gemini API Key
              <span className="text-xs text-gray-500 ml-2">(Required for image generation)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.gemini ? 'text' : 'password'}
                value={apiKeys.gemini}
                onChange={(e) => setApiKeys(prev => ({ ...prev, gemini: e.target.value }))}
                placeholder="Enter your Gemini API key"
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white text-sm font-mono pr-10 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded text-gray-400"
                type="button"
              >
                {showKeys.gemini ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your key from{' '}
              <a
                href="https://aistudio.google.com/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          {/* OpenAI API Key */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              OpenAI API Key
              <span className="text-xs text-gray-500 ml-2">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.openai ? 'text' : 'password'}
                value={apiKeys.openai}
                onChange={(e) => setApiKeys(prev => ({ ...prev, openai: e.target.value }))}
                placeholder="Enter your OpenAI API key"
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white text-sm font-mono pr-10 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => toggleShowKey('openai')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded text-gray-400"
                type="button"
              >
                {showKeys.openai ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your key from{' '}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                OpenAI Platform
              </a>
            </p>
          </div>

          {/* Anthropic API Key */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">
              Anthropic API Key
              <span className="text-xs text-gray-500 ml-2">(Optional, metadata only)</span>
            </label>
            <div className="relative">
              <input
                type={showKeys.anthropic ? 'text' : 'password'}
                value={apiKeys.anthropic}
                onChange={(e) => setApiKeys(prev => ({ ...prev, anthropic: e.target.value }))}
                placeholder="Enter your Anthropic API key"
                className="w-full bg-gray-800 border border-gray-700 rounded p-3 text-white text-sm font-mono pr-10 focus:border-indigo-500 focus:outline-none"
              />
              <button
                onClick={() => toggleShowKey('anthropic')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-700 rounded text-gray-400"
                type="button"
              >
                {showKeys.anthropic ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Get your key from{' '}
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-400 hover:text-indigo-300 underline"
              >
                Anthropic Console
              </a>
              {' '}(Note: Anthropic does not support image generation)
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-800">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded text-sm font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-sm font-bold flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

