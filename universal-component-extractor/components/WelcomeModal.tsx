import React, { useState } from 'react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDontShowAgain: () => void;
  onOpenSettings: () => void;
}

export default function WelcomeModal({ isOpen, onClose, onDontShowAgain, onOpenSettings }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleDontShowAgain = () => {
    onDontShowAgain();
    onClose();
  };

  const capabilities = [
    {
      icon: '📄',
      title: 'Extract from Any Source',
      description: 'HTML, React, Three.js, p5.js, JSON, and more',
    },
    {
      icon: '🤖',
      title: 'Multiple AI Providers',
      description: 'Ollama (free local), Gemini, OpenAI, Anthropic',
    },
    {
      icon: '👁️',
      title: 'Live Preview',
      description: 'See your component in real-time with multiple preview modes',
    },
    {
      icon: '📦',
      title: 'Export Formats',
      description: 'HTML, TSX, JS, ZIP, JSON - ready for any project',
    },
  ];

  const quickStartSteps = [
    {
      number: '1',
      title: 'Paste or Upload Code',
      description: 'Paste your code or drag & drop files into the input area',
    },
    {
      number: '2',
      title: 'Click Extract',
      description: 'The AI will analyze and extract a clean, modern component',
    },
    {
      number: '3',
      title: 'Preview & Review',
      description: 'See your component live, review the code, and read the analysis',
    },
    {
      number: '4',
      title: 'Export & Use',
      description: 'Download in your preferred format and use in your project',
    },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome to Universal Component Extractor</h2>
              <p className="text-sm text-gray-400">Reverse-engineer components from any source</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 text-gray-400 hover:text-white rounded-lg transition-colors"
            title="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* What It Does */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-blue-400">🎯</span>
              What Can It Do?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capabilities.map((cap, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
                >
                  <div className="text-3xl mb-2">{cap.icon}</div>
                  <h4 className="font-semibold text-white mb-1">{cap.title}</h4>
                  <p className="text-sm text-gray-400">{cap.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Start */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-green-400">🚀</span>
              Quick Start Guide
            </h3>
            <div className="space-y-3">
              {quickStartSteps.map((step, index) => (
                <div
                  key={index}
                  className="flex gap-4 bg-gray-900 border border-gray-700 rounded-lg p-4"
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                    {step.number}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{step.title}</h4>
                    <p className="text-sm text-gray-400">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Example Code */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-purple-400">💡</span>
              Try Example Code
            </h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-3">
                Scroll down to the <strong className="text-white">"Example Code"</strong> section below the input area. 
                Click any example button to load sample code and see how extraction works!
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">Simple Card</span>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">React Counter</span>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">Three.js Cube</span>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">p5.js Sketch</span>
                <span className="px-2 py-1 bg-blue-900/30 text-blue-300 text-xs rounded border border-blue-700/50">Vanilla JS</span>
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⚙️</span>
              Configure AI Provider
            </h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-4">
                Before extracting, you'll need to configure an AI provider. We recommend <strong className="text-white">Ollama</strong> for free, local processing.
              </p>
              <button
                onClick={() => {
                  onOpenSettings();
                  onClose();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Open Settings
              </button>
            </div>
          </section>

          {/* Keyboard Shortcuts */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-yellow-400">⌨️</span>
              Keyboard Shortcuts
            </h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-3">
                Speed up your workflow with keyboard shortcuts:
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Extract</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded font-mono">⌘/Ctrl + E</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Clear</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded font-mono">⌘/Ctrl + K</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Settings</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded font-mono">⌘/Ctrl + ,</kbd>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Shortcuts</span>
                  <kbd className="px-2 py-1 bg-gray-800 rounded font-mono">Shift + ?</kbd>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                Press <kbd className="px-1.5 py-0.5 bg-gray-800 rounded text-[10px]">Shift + ?</kbd> anytime to see all shortcuts
              </p>
            </div>
          </section>

          {/* Learn More */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-cyan-400">📚</span>
              Learn More
            </h3>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-300 mb-3">
                For detailed guides and documentation:
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span><strong className="text-white">USER_GUIDE.md</strong> - Complete workflows, features, and quick start in one place</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 px-6 py-4 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-gray-300 transition-colors">
            <input
              type="checkbox"
              onChange={(e) => {
                if (e.target.checked) {
                  handleDontShowAgain();
                }
              }}
              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800"
            />
            <span>Don't show this again</span>
          </label>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
