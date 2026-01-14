import { useState } from 'react';
import { Html } from '@react-three/drei';
import { useSpring, animated } from '@react-spring/three';

export function ContactBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const { scale } = useSpring({ scale: isOpen ? 5 : 1.5, config: { tension: 120, friction: 14 } });

  return (
    <animated.mesh scale={scale} position={[0, -3, 0]} onClick={() => setIsOpen(!isOpen)}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshPhysicalMaterial color="#bd00ff" transmission={0.6} roughness={0} thickness={2} />
      {isOpen && (
        <Html center distanceFactor={10}>
          <div className="w-64 p-6 bg-oil-900/90 border border-neon-cyan rounded-xl text-center backdrop-blur-md" onPointerDown={(e) => e.stopPropagation()}>
            <h3 className="font-display text-2xl mb-4 text-neon-cyan">SIGNAL ERRL</h3>
            <button className="w-full py-2 bg-white text-black font-bold rounded-full hover:bg-neon-magenta" onClick={() => setIsOpen(false)}>SEND</button>
          </div>
        </Html>
      )}
    </animated.mesh>
  );
}