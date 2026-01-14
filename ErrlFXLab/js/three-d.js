// Three.js 3D wireframe and voxel heightmap
"use strict";

(function(window) {
  if (!window.ErrlFX || !window.ErrlFX.App) {
    console.error("ErrlFX.App must be loaded first");
    return;
  }

  const App = window.ErrlFX.App;
  const Utils = window.ErrlFX.Utils;

  const ThreeD = {
    stopWire3D() {
      if (App.state.threeFrameId !== null) {
        cancelAnimationFrame(App.state.threeFrameId);
        App.state.threeFrameId = null;
      }
      if (App.state.threeRenderer) {
        App.state.threeRenderer.dispose();
        if (App.dom.wire3dCanvasHost) {
          while (App.dom.wire3dCanvasHost.firstChild) {
            App.dom.wire3dCanvasHost.removeChild(App.dom.wire3dCanvasHost.firstChild);
          }
        }
      }
      App.state.threeRenderer = null;
      App.state.threeScene = null;
      App.state.threeCamera = null;
      App.state.threeMesh = null;
      if (App.dom.wire3dStatusEl) {
        App.dom.wire3dStatusEl.textContent = App.state.currentSvg ? (App.state.threeMode === "wire" ? "Ready. Uses current Errl SVG as texture." : "Ready. Switch to 3D Wire tab for voxel heightmap.") : "Waiting for SVG…";
      }
    },

    updateThreeModeButtons() {
      if (App.dom.wire3dModeWireBtn && App.dom.wire3dModeVoxel3dBtn) {
        if (App.state.threeMode === "wire") {
          App.dom.wire3dModeWireBtn.classList.add("border-emerald-500/80", "text-emerald-200", "bg-slate-900/80");
          App.dom.wire3dModeWireBtn.classList.remove("border-slate-600", "text-slate-300");
          App.dom.wire3dModeVoxel3dBtn.classList.remove("border-emerald-500/80", "text-emerald-200", "bg-slate-900/80");
          App.dom.wire3dModeVoxel3dBtn.classList.add("border-slate-600", "text-slate-300");
        } else {
          App.dom.wire3dModeVoxel3dBtn.classList.add("border-emerald-500/80", "text-emerald-200", "bg-slate-900/80");
          App.dom.wire3dModeVoxel3dBtn.classList.remove("border-slate-600", "text-slate-300");
          App.dom.wire3dModeWireBtn.classList.remove("border-emerald-500/80", "text-emerald-200", "bg-slate-900/80");
          App.dom.wire3dModeWireBtn.classList.add("border-slate-600", "text-slate-300");
        }
      }
    },

    setThreeMode(mode) {
      if (mode !== "wire" && mode !== "voxel3d") return;
      App.state.threeMode = mode;
      this.updateThreeModeButtons();
      if (App.dom.wire3dCanvasHost && App.dom.wire3dCanvasHost.parentElement && !App.dom.wire3dCanvasHost.parentElement.classList.contains("hidden")) {
        this.startWire3DWithCurrentSvg();
      }
      try {
        localStorage.setItem(App.STORAGE_KEYS.THREE_MODE, App.state.threeMode);
      } catch (e) {}
    },

    startWire3DWithCurrentSvg() {
      if (!App.dom.wire3dCanvasHost || typeof THREE === "undefined") {
        if (App.dom.wire3dStatusEl) App.dom.wire3dStatusEl.textContent = "three.js not available.";
        return;
      }
      if (!App.state.currentSvg || !App.state.currentSvgUrl) {
        if (App.dom.wire3dStatusEl) App.dom.wire3dStatusEl.textContent = "Upload an SVG first.";
        return;
      }
      this.stopWire3D();
      const width = App.dom.wire3dCanvasHost.clientWidth || 400;
      const height = App.dom.wire3dCanvasHost.clientHeight || 400;
      App.state.threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      App.state.threeRenderer.setSize(width, height);
      App.state.threeRenderer.setPixelRatio(window.devicePixelRatio || 1);
      App.dom.wire3dCanvasHost.appendChild(App.state.threeRenderer.domElement);
      App.state.threeScene = new THREE.Scene();
      App.state.threeScene.background = new THREE.Color(0x02070a);
      App.state.threeCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
      App.state.threeCamera.position.set(0, 0, 4);
      const light1 = new THREE.DirectionalLight(0xffffff, 1.0);
      light1.position.set(3, 4, 5);
      App.state.threeScene.add(light1);
      const light2 = new THREE.DirectionalLight(0x34e1ff, 0.7);
      light2.position.set(-3, -2, -4);
      App.state.threeScene.add(light2);
      App.state.threeScene.add(new THREE.AmbientLight(0x404040, 0.6));
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(App.state.currentSvgUrl, (texture) => {
        if (App.state.threeMode === "wire") {
          const geo = new THREE.BoxGeometry(1.8, 1.8, 0.3);
          const mat = new THREE.MeshStandardMaterial({ map: texture, metalness: 0.3, roughness: 0.4 });
          App.state.threeMesh = new THREE.Mesh(geo, mat);
          const edges = new THREE.EdgesGeometry(geo);
          const hue = App.state.p5Config ? App.state.p5Config.bgHue || 210 : 210;
          const wireColor = new THREE.Color().setHSL(hue / 360, 0.9, 0.6);
          const lineMat = new THREE.LineBasicMaterial({ color: wireColor, linewidth: 1 });
          const wire = new THREE.LineSegments(edges, lineMat);
          App.state.threeMesh.add(wire);
          App.state.threeScene.add(App.state.threeMesh);
          if (App.dom.wire3dStatusEl) App.dom.wire3dStatusEl.textContent = "Spinning wireframe box.";
        } else {
          const img = texture.image;
          const sampleSize = 32;
          const sampleCanvas = document.createElement("canvas");
          const sampleCtx = sampleCanvas.getContext("2d");
          sampleCanvas.width = sampleSize;
          sampleCanvas.height = sampleSize;
          sampleCtx.drawImage(img, 0, 0, sampleSize, sampleSize);
          const imageData = sampleCtx.getImageData(0, 0, sampleSize, sampleSize).data;
          const voxelGroup = new THREE.Group();
          App.state.threeMesh = voxelGroup;
          const cols = sampleSize;
          const rows = sampleSize;
          const span = 2.4;
          const step = span / cols;
          const startX = -span / 2;
          const startY = -span / 2;
          const boxGeo = new THREE.BoxGeometry(step * 0.9, step * 0.9, 1);
          const accentColor = new THREE.Color(0x34e1ff);
          const cubeMat = new THREE.MeshStandardMaterial({ color: accentColor, emissive: new THREE.Color(0x050814), metalness: 0.2, roughness: 0.5 });
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const idx = (y * cols + x) * 4;
              const r = imageData[idx];
              const g = imageData[idx + 1];
              const b = imageData[idx + 2];
              const a = imageData[idx + 3];
              if (a < 40) continue;
              const brightness = (r + g + b) / (3 * 255);
              if (brightness < 0.08) continue;
              const minH = 0.15;
              const maxH = 1.0;
              const heightFactor = minH + (maxH - minH) * brightness;
              const cube = new THREE.Mesh(boxGeo, cubeMat);
              const wx = startX + x * step + step / 2;
              const wy = startY + y * step + step / 2;
              const hz = heightFactor;
              cube.position.set(wx, wy, hz / 2);
              cube.scale.z = hz;
              voxelGroup.add(cube);
            }
          }
          voxelGroup.position.z = -0.5;
          App.state.threeScene.add(voxelGroup);
          if (App.dom.wire3dStatusEl) App.dom.wire3dStatusEl.textContent = "3D voxel heightmap from SVG.";
        }
        let lastTime = performance.now();
        const animate = (now) => {
          App.state.threeFrameCounter++;
          App.state.threeFrameId = requestAnimationFrame(animate);
          const dt = (now - lastTime) / 1000;
          lastTime = now;
          if (App.state.threeMesh) {
            const audioBoost = App.state.audioReactiveEnabled ? 1 + (App.state.audioReactiveValue || 0) * 0.5 : 1;
            App.state.threeMesh.rotation.y += dt * 0.7 * audioBoost;
            App.state.threeMesh.rotation.x += dt * 0.35 * audioBoost;
          }
          App.state.threeRenderer.render(App.state.threeScene, App.state.threeCamera);
        };
        animate(lastTime);
      }, undefined, (err) => {
        console.error("Three.js texture load error:", err);
        if (App.dom.wire3dStatusEl) App.dom.wire3dStatusEl.textContent = "Failed to load SVG texture.";
      });
      const onResize = () => {
        if (!App.state.threeRenderer || !App.state.threeCamera) return;
        const w = App.dom.wire3dCanvasHost.clientWidth || 400;
        const h = App.dom.wire3dCanvasHost.clientHeight || 400;
        App.state.threeRenderer.setSize(w, h);
        App.state.threeCamera.aspect = w / h;
        App.state.threeCamera.updateProjectionMatrix();
      };
      window.addEventListener("resize", onResize);
    }
  };

  window.ErrlFX.ThreeD = ThreeD;
})(window);

