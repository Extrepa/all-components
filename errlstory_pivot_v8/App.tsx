import React from 'react';
import { GameCanvas } from './components/GameCanvas';
import { ThemeControls } from '@errl-design-system';

const App: React.FC = () => {
  return (
    <div className="w-screen h-screen bg-radial-gradient flex items-center justify-center overflow-hidden text-[#e0f7ff]">
      {/* Background styling is handled via utility classes for the gradient */}
      <div 
        className="absolute inset-0 z-0" 
        style={{ 
          background: 'radial-gradient(circle at top, #162447 0, #050811 55%)' 
        }}
      />

      {/* Game Layer */}
      <div className="relative z-10 w-full h-full">
        <GameCanvas />
      </div>

      {/* Optional Overlay UI (if needed later for React-based HUDs) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <ThemeControls compact={true} />
      </div>
      <div className="absolute bottom-4 right-4 z-20 opacity-50 text-xs text-gray-500 pointer-events-none">
        ErrlStory React Prototype v0.1
      </div>
    </div>
  );
};

export default App;