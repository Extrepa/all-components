import { Canvas, useThree } from '@react-three/fiber';
import { ScrollControls, Scroll } from '@react-three/drei';
import { useMemo, useState, useCallback } from 'react';
import { ProjectorRig } from './ProjectorRig';
import { ErrlContentLayout } from './ErrlContentLayout';
import { InstancedBubbleSystem } from './InstancedBubbleSystem';
import { ExplosionSystem } from './ExplosionSystem';
import { ScrollController } from './ScrollController';
import { BubblePositionSync } from './BubblePositionSync';
import { PerformanceMonitor } from './PerformanceMonitor';
import { ERRL_CONFIG } from '../content/errl-config';

function BubbleLayer() {
  const { viewport } = useThree();
  const [bubblePositions, setBubblePositions] = useState<
    Map<string, [number, number, number]>
  >(new Map());

  // Fallback positions if DOM sync hasn't happened yet
  const fallbackPositions = useMemo(() => {
    const remToViewport = 0.3;
    const buttonTop = 2 * remToViewport;
    const buttonRight = 2 * remToViewport;
    const buttonGap = 1 * remToViewport;
    const buttonHeight = 0.8 * remToViewport;

    return ERRL_CONFIG.navigationBubbles.map((bubble, index) => {
      const x = viewport.width / 2 - buttonRight - 0.3;
      const y = viewport.height / 2 - buttonTop - index * (buttonGap + buttonHeight);
      return {
        id: bubble.id,
        position: [x, y, 0.1] as [number, number, number],
      };
    });
  }, [viewport.width, viewport.height]);

  const handlePositionsUpdate = useCallback(
    (positions: Map<string, [number, number, number]>) => {
      setBubblePositions(positions);
    },
    []
  );

  // Use synced positions if available, otherwise fallback
  const bubbles = useMemo(() => {
    if (bubblePositions.size > 0) {
      return ERRL_CONFIG.navigationBubbles.map((bubble) => ({
        id: bubble.id,
        position:
          bubblePositions.get(bubble.id) ||
          fallbackPositions.find((b) => b.id === bubble.id)?.position ||
          ([0, 0, 0.1] as [number, number, number]),
      }));
    }
    return fallbackPositions;
  }, [bubblePositions, fallbackPositions]);

  return (
    <>
      <BubblePositionSync onPositionsUpdate={handlePositionsUpdate} />
      <InstancedBubbleSystem bubbles={bubbles} />
      <ExplosionSystem />
    </>
  );
}

export function ErrlPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0 }}>
      <PerformanceMonitor />
      <Canvas camera={{ position: [0, 0, 5], fov: 55 }}>
        <color attach="background" args={[0x050510]} />
        
        {/* damping={4} gives that fluid "oil" feel to the scroll itself */}
        <ScrollControls pages={4} damping={4}>
          {/* Scroll Controller for programmatic navigation */}
          <ScrollController />
          
          {/* LAYER 1: The Rig (WebGL) */}
          <ProjectorRig />
          
          {/* LAYER 1.5: Interactive Bubbles */}
          <BubbleLayer />

          {/* LAYER 2: The Content (HTML) */}
          <Scroll html>
            <ErrlContentLayout />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  );
}

