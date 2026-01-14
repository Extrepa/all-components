import React, { useState, useEffect } from 'react';
import { AISettings, AIProvider } from '../services/aiService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AISettings) => void;
  currentSettings: AISettings;
}

const PROVIDER_MODELS: Record<AIProvider, string[]> = {
  // Google Gemini: keep 1.5-generation models for compatibility, add newer 2.5/3.x options
  gemini: [
    'gemini-3-pro-preview',
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
  ],
  // OpenAI: legacy 3.5/4.x plus 5.x family
  openai: [
    'gpt-5.1',
    'gpt-5-mini',
    'gpt-4.1-mini',
    'gpt-4.1-nano',
    'gpt-4o',
    'gpt-4o-mini',
    'gpt-4-turbo',
    'gpt-3.5-turbo',
  ],
  // Anthropic Claude: 4.x plus 3.5 and 3.x for compatibility
  anthropic: [
    'claude-opus-4-20250514',
    'claude-sonnet-4-20250514',
    'claude-3.7-sonnet-20250219',
    'claude-3.5-haiku-20241022',
    'claude-3.5-sonnet-20241022',
    'claude-3-opus-20240229',
    'claude-3-haiku-20240307',
  ],
  // Ollama: common local models; any valid Ollama tag can also be typed manually
  ollama: ['llama3.2', 'llama3.1', 'mistral', 'codellama', 'phi3', 'gemma2', 'qwen2.5'],
};

export default function SettingsModal({ isOpen, onClose, onSave, currentSettings }: SettingsModalProps) {
  const [settings, setSettings] = useState<AISettings>(currentSettings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateApiKey = (provider: 'gemini' | 'openai' | 'anthropic', value: string) => {
    setSettings(prev => ({
      ...prev,
      apiKeys: { ...prev.apiKeys, [provider]: value },
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white flex items-center justify-between">
            <span>AI Model Settings</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Configure your AI provider and API keys. Use Ollama for free local models.
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              AI Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['gemini', 'openai', 'anthropic', 'ollama'] as AIProvider[]).map((provider) => (
                <button
                  key={provider}
                  onClick={() => setSettings(prev => ({ ...prev, provider }))}
                  className={`px-4 py-3 rounded-lg border transition-colors ${
                    settings.provider === provider
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold capitalize">{provider}</div>
                  <div className="text-xs mt-1 opacity-75">
                    {provider === 'ollama' ? 'Free (Local)' : 'API Key Required'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Model
            </label>
            <select
              value={settings.model}
              onChange={(e) => setSettings(prev => ({ ...prev, model: e.target.value }))}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
            >
              {PROVIDER_MODELS[settings.provider].map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Extraction Style */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Extraction Style
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, extractionStyle: 'refactor' }))}
                className={`px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                  (settings.extractionStyle || 'refactor') === 'refactor'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">Refactor (default)</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  Modernize and simplify more aggressively.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, extractionStyle: 'minimal' }))}
                className={`px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
                  settings.extractionStyle === 'minimal'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">Minimal</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  Keep structure, fix obvious issues only.
                </div>
              </button>
            </div>
          </div>

          {/* Interaction Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Interaction Mode
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, interactionMode: 'extract' }))}
                className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                  (settings.interactionMode || 'extract') === 'extract'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">Extract</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  Full extraction + refactor (current default behavior).
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, interactionMode: 'explain' }))}
                className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                  settings.interactionMode === 'explain'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">Explain</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  Emphasize explanation and behavior over large refactors.
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSettings(prev => ({ ...prev, interactionMode: 'review' }))}
                className={`px-3 py-2 rounded-lg border text-left transition-colors ${
                  settings.interactionMode === 'review'
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <div className="font-semibold">Review</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  Provide structured feedback, risks, and improvement ideas.
                </div>
              </button>
            </div>
          </div>

          {/* Ollama URL */}
          {settings.provider === 'ollama' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Ollama URL
              </label>
              <input
                type="text"
                value={settings.ollamaUrl || 'http://localhost:11434'}
                onChange={(e) => setSettings(prev => ({ ...prev, ollamaUrl: e.target.value }))}
                placeholder="http://localhost:11434"
                className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                Make sure Ollama is running. Install from{' '}
                <a
                  href="https://ollama.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  ollama.ai
                </a>
              </p>
            </div>
          )}

          {/* API Keys */}
          {settings.provider !== 'ollama' && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-300">
                API Keys
              </label>
              
              {settings.provider === 'gemini' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.gemini ? 'text' : 'password'}
                      value={settings.apiKeys.gemini || ''}
                      onChange={(e) => updateApiKey('gemini', e.target.value)}
                      placeholder="Enter your Gemini API key"
                      className="w-full bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility('gemini')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.gemini ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              )}

              {settings.provider === 'openai' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">OpenAI API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.openai ? 'text' : 'password'}
                      value={settings.apiKeys.openai || ''}
                      onChange={(e) => updateApiKey('openai', e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility('openai')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.openai ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              )}

              {settings.provider === 'anthropic' && (
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Anthropic API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.anthropic ? 'text' : 'password'}
                      value={settings.apiKeys.anthropic || ''}
                      onChange={(e) => updateApiKey('anthropic', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full bg-gray-700 text-white px-4 py-2 pr-10 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none font-mono text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => toggleKeyVisibility('anthropic')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showKeys.anthropic ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
            <p className="text-sm text-blue-200">
              <strong>💡 Tip:</strong> Use <strong>Ollama</strong> for free, local AI processing. 
              No API keys needed! Install Ollama and pull a model like <code className="bg-blue-900/50 px-1 rounded">llama3.2</code>.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition-colors font-semibold"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}

