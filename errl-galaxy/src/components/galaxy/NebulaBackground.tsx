import { LayerMaterial, Depth, Noise } from 'lamina';
import { BackSide } from 'three';

export const NebulaBackground = () => (
  <mesh scale={100}>
    <sphereGeometry args={[1, 64, 64]} />
    <LayerMaterial side={BackSide}>
      <Depth colorA="#050505" colorB="#000020" alpha={1} mode="normal" near={0} far={300} origin={[100, 100, 100]} />
      <Noise mapping="local" type="curl" scale={0.5} colorA="#00ffff" colorB="#000000" mode="add" alpha={0.1} />
      <Noise mapping="local" type="simplex" scale={0.3} colorA="#ff00ff" colorB="#000000" mode="add" alpha={0.1} offset={[100, 0, 0]} />
    </LayerMaterial>
  </mesh>
);