import React, { useRef, useEffect, useState } from 'react';
import { Game } from '../game/core/Game';
import { Loop } from '../game/core/Loop';

export const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Keep track of engine instances to clean up properly
  const engineRef = useRef<{ game: Game; loop: Loop } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2D context");
      return;
    }

    // Initialize Game Logic
    // We hardcode internal resolution (960x540) to keep pixel art consistent
    const internalWidth = 960;
    const internalHeight = 540;

    const game = new Game(ctx, internalWidth, internalHeight);
    const loop = new Loop(game);

    engineRef.current = { game, loop };

    // Start the loop
    loop.start();
    setIsLoaded(true);

    // Handle Window Resize (Letterboxing)
    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      
      const container = containerRef.current;
      const aspect = internalWidth / internalHeight;
      
      // Calculate fit
      let w = container.clientWidth;
      let h = container.clientHeight;
      
      if (w / h > aspect) {
        w = h * aspect;
      } else {
        h = w / aspect;
      }

      // Apply CSS size (Scaling the internal resolution)
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      loop.stop();
      game.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="shadow-[0_0_40px_rgba(0,255,200,0.35)] rounded-2xl bg-[#020309] block rendering-pixelated"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {!isLoaded && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#8bd6ff] text-lg uppercase tracking-widest opacity-80 pointer-events-none">
          Loading ErrlStory...
        </div>
      )}
    </div>
  );
};