import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useGalaxyStore } from '../../store/useGalaxyStore';
import * as THREE from 'three';

export const CameraRig = ({ controlsRef, data }: { controlsRef: any, data: any[] }) => {
  const targetNodeId = useGalaxyStore((s) => s.targetNodeId);
  
  useEffect(() => {
    if (targetNodeId && controlsRef.current) {
      // 1. Find the target position
      const target = data.find(n => n.id === targetNodeId);
      if (!target) return;

      const [x, y, z] = target.pos;

      // 2. Execute the Warp (Smooth Transition)
      controlsRef.current.setLookAt(
        x, y, z + 8, // Camera Position (hovering slightly in front)
        x, y, z,     // Target (look directly at the node)
        true         // Enable smooth animation
      );
    }
  }, [targetNodeId, data, controlsRef]);

  return null; // Logic only
};