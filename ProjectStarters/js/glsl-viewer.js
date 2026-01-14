/**
 * GLSL Shader Viewer
 * Renders GLSL fragment shaders using Three.js
 */
class GLSLViewer {
  constructor(container, shaderCode) {
    this.container = container;
    this.shaderCode = shaderCode;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.material = null;
    this.mesh = null;
    this.animationId = null;
    this.startTime = Date.now();
    
    this.init();
  }
  
  init() {
    // Create scene
    this.scene = new THREE.Scene();
    
    // Create camera (orthographic for fullscreen shader)
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);
    
    // Create shader material
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_resolution: {
          value: new THREE.Vector2(window.innerWidth, window.innerHeight)
        },
        u_time: { value: 0 }
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: this.shaderCode
    });
    
    // Create fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
    
    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
    
    // Start animation loop
    this.animate();
  }
  
  animate() {
    this.animationId = requestAnimationFrame(() => this.animate());
    
    // Update time uniform
    const elapsed = (Date.now() - this.startTime) / 1000.0;
    this.material.uniforms.u_time.value = elapsed;
    
    // Render
    this.renderer.render(this.scene, this.camera);
  }
  
  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    this.renderer.setSize(width, height);
    this.material.uniforms.u_resolution.value.set(width, height);
  }
  
  updateShader(newShaderCode) {
    this.material.fragmentShader = newShaderCode;
    this.material.needsUpdate = true;
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (this.renderer) {
      this.renderer.dispose();
    }
    
    if (this.material) {
      this.material.dispose();
    }
    
    if (this.mesh && this.mesh.geometry) {
      this.mesh.geometry.dispose();
    }
    
    if (this.container && this.renderer) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}

// Export for use in HTML
if (typeof window !== 'undefined') {
  window.GLSLViewer = GLSLViewer;
}
