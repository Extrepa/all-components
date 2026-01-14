/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import type {ModeKey} from '../lib/types.ts'
import {memo, useEffect, useRef, useState} from 'react'
import {outputWidth} from '../lib/consts.ts'
import {identity} from '../lib/utils.ts'
import {use} from '../lib/store.ts'

const scaffolds: {[key in ModeKey]: (code: string) => string} = {
  p5: (code: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.8/p5.js"></script>
  <style>
    body {
      padding: 0;
      margin: 0;
      width: 100vw;
      height: 100vh;
      overflow: hidden;
      background: black;
    }
    body, main, canvas {
      width: 100vw;
      height: 100vh;
      display: block;
      margin: 0;
      padding: 0;
      position: absolute;
      top: 0;
      left: 0;
      object-fit: contain;
    }
  </style>
</head>
<body>
  <script>
    ${code}

    if (typeof window.setup === 'function' && !window.p5.instance) {
      new p5()
    }

    function windowResized() {
      const canvas = document.querySelector('canvas')

      if (canvas) {
        canvas.style.width = "100%"
        canvas.style.height = "100%"
      }
    }

    windowResized();
    setTimeout(windowResized, 100);
    window.addEventListener('resize', windowResized);
  </script>
</body>
</html>`,

  svg: (code: string) => `
<style>
  body {
    margin: 0;
    padding: 0;
    background: #fff;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  svg {
    width: 100%;
    height: 100%;
    max-width: 100vw;
    max-height: 100vh;
  }
</style>
${code}`,

  image: identity,

  html: identity,

  wireframes: identity,

  voxels: identity,

  // three: identity,

  glsl: (code: string) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Fullscreen Shader</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      html, body { height: 100%; margin: 0; background: #000; overflow: hidden; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <script type="module">
      import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

      let fragmentShader = \`
        ${code.replace(/glsl/g, '')}
      \`;
      
      if (!fragmentShader.trim()) {
         fragmentShader = 'void main() { gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); }';
      }

      const vertexShader = \`
        precision mediump float;
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      \`;

      try {
        const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        renderer.setPixelRatio(dpr);
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        document.body.appendChild(renderer.domElement);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();
        const geometry = new THREE.PlaneGeometry(2, 2);

        const uniforms = {
          u_time: { value: 0 },
          u_resolution: { value: new THREE.Vector2(window.innerWidth * dpr, window.innerHeight * dpr) },
        };

        const material = new THREE.ShaderMaterial({
          vertexShader,
          fragmentShader,
          uniforms,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        function onResize() {
          const width = window.innerWidth;
          const height = window.innerHeight;
          renderer.setSize(width, height);
          uniforms.u_resolution.value.set(width * dpr, height * dpr);
        }
        window.addEventListener("resize", onResize);

        const clock = new THREE.Clock();
        function render() {
          uniforms.u_time.value = clock.getElapsedTime();
          renderer.render(scene, camera);
          requestAnimationFrame(render);
        }
        render();
      } catch (e) {
        console.error(e);
      }
    </script>
  </body>
</html>
`
}

type RendererProps = {
  mode: ModeKey
  code: string
  isFullscreen?: boolean
}

function Renderer({mode, code, isFullscreen}: RendererProps) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const [showError, setShowError] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const fullscreenActiveId = use.fullscreenActiveId()
  const screensaverMode = use.screensaverMode()
  const fullscreenIsActive = Boolean(fullscreenActiveId)
  const thisIsFullscreen = Boolean(isFullscreen)

  const rendererRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.onerror = () => setShowError(true)
    }
  }, [iframeRef])

  useEffect(() => {
    if (!rendererRef.current) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          } else {
            setIsVisible(false)
          }
        })
      },
      {threshold: 0.1}
    )

    observer.observe(rendererRef.current)

    return () => observer.disconnect()
  }, [])

  const shouldRender = isVisible && 
    (!fullscreenIsActive || thisIsFullscreen) &&
    (!screensaverMode || thisIsFullscreen);

  return (
    <div
      ref={rendererRef}
      className={`renderer ${mode}Renderer bg-black`}
      style={{height: isFullscreen ? '100%' : undefined}}
    >
      {mode === 'image' ? (
        <img src={code} alt="Generated image" className="w-full h-full object-contain" />
      ) : shouldRender ? (
        <iframe
          className={`w-full bg-black ${isFullscreen ? 'h-full' : 'aspect-4/3'}`}
          sandbox="allow-same-origin allow-scripts"
          loading="lazy"
          title="Result Renderer"
          srcDoc={scaffolds[mode]?.(code) || code}
          ref={iframeRef}
          style={{border: 'none'}}
        />
      ) : (
        <div
          className={`w-full bg-black ${isFullscreen ? 'h-full' : 'aspect-4/3'}`}
        ></div>
      )}

      {showError && (
        <div className="error">
          <p>
            <span className="icon">error</span> This code produced an error.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(Renderer)