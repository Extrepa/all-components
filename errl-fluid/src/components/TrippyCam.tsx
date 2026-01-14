import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { DeviceOrientationControls } from '@react-three/drei';

export function TrippyCam({ active }: { active: boolean }) {
  const { camera } = useThree();
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    if (active && !permission && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission().then((res: string) => setPermission(res === 'granted'));
    } else if (active) {
      setPermission(true);
    }
  }, [active]);

  return active && permission ? <DeviceOrientationControls camera={camera as any} /> : null;
}