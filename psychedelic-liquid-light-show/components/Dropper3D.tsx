import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { LiquidConfig } from '../types';
import { getEasing, lerp } from '../utils/easing';

interface Dropper3DProps {
  config: LiquidConfig;
  position: { x: number; y: number } | null;
  dropSize: number; // 0 to 1, normalized drop size
  phase: 'oil' | 'water';
  visible: boolean;
}

export const Dropper3D: React.FC<Dropper3DProps> = ({ config, position, dropSize, phase, visible }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const dropperRef = useRef<THREE.Group | null>(null);
  const dropRef = useRef<THREE.Mesh | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());
  const visibleRef = useRef(visible);
  const dropSizeRef = useRef(dropSize);

  // Create materials based on phase
  const materials = useMemo(() => {
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xcccccc,
      transmission: 1.0,
      roughness: 0.1,
      metalness: 0.0,
      ior: 1.5,
      thickness: 0.5,
      transparent: true,
      opacity: 0.8
    });

    const rubberMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.8,
      metalness: 0.1
    });

    // Get color from palette
    const palette = phase === 'oil' ? (config.oilPalette || config.colors) : (config.waterPalette || config.colors);
    const colorHex = palette[0] || (phase === 'oil' ? '#FFAA44' : '#00C2FF');
    const color = new THREE.Color(colorHex);

    const dropMaterial = new THREE.MeshPhysicalMaterial({
      color: color,
      transmission: 0.9,
      roughness: 0.2,
      metalness: 0.0,
      ior: phase === 'oil' ? 1.47 : 1.33, // Oil vs water refractive index
      thickness: 1.0,
      transparent: true,
      opacity: 0.95
    });

    return { glassMaterial, rubberMaterial, dropMaterial };
  }, [config, phase]);

  // Initialize Three.js scene (only once)
  useEffect(() => {
    if (!containerRef.current) {
      console.log('[Dropper3D] No container ref');
      return;
    }

    if (!materials) {
      console.log('[Dropper3D] Materials not ready');
      return;
    }

    const container = containerRef.current;
    // Ensure container has size even if hidden - use explicit size (2x bigger)
    const width = 400;
    const height = 400;

    console.log('[Dropper3D] Initializing Three.js scene', { width, height });

    // Scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera - adjust angle to see the drop better
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 12); // Closer and lower to see drop better
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true, // Transparent background
      preserveDrawingBuffer: false
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Style the canvas to ensure it's visible
    const canvas = renderer.domElement;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    
    container.appendChild(canvas);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Create Dropper - make it bigger (2x scale)
    const dropper = new THREE.Group();
    dropper.rotation.x = -Math.PI / 16;
    dropper.scale.set(2, 2, 2); // Make dropper 2x bigger
    scene.add(dropper);
    dropperRef.current = dropper;

    // Bulb
    const bulbGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    const bulb = new THREE.Mesh(bulbGeometry, materials.rubberMaterial);
    bulb.position.y = 7;
    bulb.scale.y = 1.2;
    dropper.add(bulb);

    // Glass Tube
    const tubeGeometry = new THREE.CylinderGeometry(1, 1, 6, 32);
    const tube = new THREE.Mesh(tubeGeometry, materials.glassMaterial);
    tube.position.y = 3.5;
    dropper.add(tube);
    
    // Tip
    const tipGeometry = new THREE.CylinderGeometry(1, 0.1, 2, 32);
    const tip = new THREE.Mesh(tipGeometry, materials.glassMaterial);
    tip.position.y = -0.5;
    dropper.add(tip);

    // Create Drop
    const dropGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const drop = new THREE.Mesh(dropGeometry, materials.dropMaterial);
    const tipPosition = new THREE.Vector3(0, -1.5, 0);
    drop.position.copy(tipPosition);
    drop.scale.set(0.01, 0.01, 0.01);
    dropper.add(drop);
    dropRef.current = drop;

    // Animation loop
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      
      // Pause animation when not visible
      if (!visibleRef.current) {
        return;
      }
      
      const delta = clockRef.current.getDelta();

      // Update drop size based on prop (use ref to get latest value)
      const currentDropSize = dropSizeRef.current;
      if (drop && currentDropSize > 0) {
        const minScale = 0.05; // Start bigger so it's visible
        const maxScale = 2.5; // Make max drop bigger and more visible
        const scale = lerp(minScale, maxScale, currentDropSize);

        drop.scale.set(
          scale * 0.9, // Slightly wider as it grows
          scale,
          scale * 0.9
        );
        
        // Keep the top of the drop attached to the tip
        const dropHeight = drop.geometry.parameters.radius * 2;
        drop.position.y = tipPosition.y - (drop.scale.y * dropHeight) / 2 + 0.5;
      } else if (drop && currentDropSize === 0) {
        // Keep a small visible drop even when not growing
        drop.scale.set(0.05, 0.05, 0.05);
        drop.position.copy(tipPosition);
      }

      if (renderer && scene && camera) {
        renderer.render(scene, camera);
      }
    };

    animate();
    console.log('[Dropper3D] Scene initialized and animation started');

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      if (renderer) {
        renderer.dispose();
      }
      // Materials are disposed when they change, but dispose on unmount too
      try {
        materials.glassMaterial.dispose();
        materials.rubberMaterial.dispose();
        materials.dropMaterial.dispose();
      } catch (e) {
        // Materials may already be disposed
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [materials]); // Initialize when materials are ready

  // Update refs for animation loop
  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    dropSizeRef.current = dropSize;
  }, [dropSize]);

  // Update drop material when phase or config changes
  useEffect(() => {
    if (!dropRef.current) return;
    // Dispose old material if it exists
    if (dropRef.current.material && dropRef.current.material !== materials.dropMaterial) {
      (dropRef.current.material as THREE.Material).dispose();
    }
    dropRef.current.material = materials.dropMaterial;
  }, [materials.dropMaterial]);

  // Position dropper to follow cursor (now handled in inline style)

  // Always render the container so Three.js can initialize, but hide it when not visible
  return (
    <div
      ref={containerRef}
      className="fixed pointer-events-none z-[5001]"
      style={{
        width: '400px', // Increased from 200px to 400px (2x bigger)
        height: '400px', // Increased from 200px to 400px (2x bigger)
        minWidth: '400px',
        minHeight: '400px',
        transform: (visible && position) 
          ? `translate(${position.x - 200}px, ${position.y - 300}px)` // Adjusted offset for bigger size
          : 'translate(-10000px, -10000px)', // Move off-screen instead of hiding
        opacity: (visible && position) ? 1 : 0,
        pointerEvents: 'none',
        willChange: 'transform, opacity', // Optimize for animations
      }}
    />
  );
};

