import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { ScrollControls, Scroll, PerspectiveCamera } from '@react-three/drei';
import { ErrlBackdrop } from './components/ErrlBackdrop';
import { StretchyBubble } from './components/StretchyBubble';
import { ContactBubble } from './components/ContactBubble';
import { ExplosionSystem } from './components/ExplosionSystem';
import { TrippyCam } from './components/TrippyCam';
import { ThemeControls } from '@errl-design-system';
import * as THREE from 'three';
import './App.css';

type ExplosionSystemRef = {
  trigger: (position: THREE.Vector3) => void;
};

function App() {
  const explosionRef = useRef<ExplosionSystemRef>(null);
  const [trippyActive, setTrippyActive] = useState(false);

  const bubbles = [
    { position: [2, 2, 0] as [number, number, number], label: 'ABOUT' },
    { position: [-2, 1, 0] as [number, number, number], label: 'WORK' },
    { position: [0, -1, 0] as [number, number, number], label: 'PLAY' },
  ];

  return (
    <div className="w-screen h-screen bg-oil-900">
      <Canvas gl={{ antialias: true, alpha: false }} dpr={[1, 2]}>
        <color attach="background" args={['#050714']} />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={null}>
          <ScrollControls pages={3} damping={0.25}>
            <Scroll>
              <ErrlBackdrop />
              <Physics gravity={[0, -2, 0]}>
                {bubbles.map((bubble, i) => (
                  <StretchyBubble
                    key={i}
                    position={bubble.position}
                    label={bubble.label}
                    onPop={(pos: THREE.Vector3) => {
                      explosionRef.current?.trigger(pos);
                    }}
                  />
                ))}
                <ContactBubble />
              </Physics>
              <ExplosionSystem ref={explosionRef} />
            </Scroll>
          </ScrollControls>
        </Suspense>
        
        <TrippyCam active={trippyActive} />
      </Canvas>
      
      <div className="fixed top-4 right-4 z-10 flex gap-2 items-center">
        <ThemeControls compact={true} />
        <button
          onClick={() => setTrippyActive(!trippyActive)}
          className="px-4 py-2 bg-neon-cyan text-oil-900 rounded-full font-bold hover:bg-neon-magenta transition-colors"
        >
          {trippyActive ? 'NORMAL CAM' : 'TRIPPY CAM'}
        </button>
      </div>
    </div>
  );
}

export default App;
