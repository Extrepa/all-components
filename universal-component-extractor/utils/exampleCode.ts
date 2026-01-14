export interface ExampleCode {
  name: string;
  description: string;
  code: string;
  category: 'html' | 'react' | 'threejs' | 'p5js' | 'vanilla' | 'svg';
  color: string; // Tailwind color class for the button (e.g., 'red', 'blue', 'green')
}

export const EXAMPLE_CODES: ExampleCode[] = [
  {
    name: 'Gradient Button',
    description: 'Animated gradient button with hover effects',
    category: 'html',
    color: 'red',
    code: `<button class="gradient-btn">Hover Me</button>

<style>
.gradient-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a6f);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(238, 90, 111, 0.4);
}

.gradient-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(238, 90, 111, 0.6);
  background: linear-gradient(45deg, #ee5a6f, #ff6b6b);
}
</style>`
  },
  {
    name: 'Todo List',
    description: 'Interactive todo list with React hooks',
    category: 'react',
    color: 'blue',
    code: `import React, { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, done: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, done: !todo.done } : todo
    ));
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h2>Todo List</h2>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
          placeholder="Add todo..."
          style={{ flex: 1, padding: '0.5rem' }}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li key={todo.id} style={{ marginBottom: '0.5rem' }}>
            <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => toggleTodo(todo.id)}
              />
              <span style={{ textDecoration: todo.done ? 'line-through' : 'none' }}>
                {todo.text}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoList;`
  },
  {
    name: '3D Sphere',
    description: 'Rotating 3D sphere with Three.js',
    category: 'threejs',
    color: 'purple',
    code: `// Three.js will be automatically loaded by the preview system
// Just use THREE. directly - no imports needed!

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a1a2e);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.SphereGeometry(2, 32, 32);
const material = new THREE.MeshPhongMaterial({ 
  color: 0x9d4edd,
  shininess: 100
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

const light = new THREE.PointLight(0xffffff, 1, 100);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

camera.position.z = 5;

const controls = new THREE.OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  sphere.rotation.x += 0.01;
  sphere.rotation.y += 0.01;
  controls.update();
  renderer.render(scene, camera);
}
animate();`
  },
  {
    name: 'Particle System',
    description: 'Colorful particle animation with p5.js',
    category: 'p5js',
    color: 'green',
    code: `let particles = [];

function setup() {
  createCanvas(600, 400);
  colorMode(HSB, 360, 100, 100);
  
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: random(width),
      y: random(height),
      vx: random(-2, 2),
      vy: random(-2, 2),
      hue: random(360),
      size: random(5, 15)
    });
  }
}

function draw() {
  background(0, 0, 10);
  
  for (let p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    
    if (p.x < 0 || p.x > width) p.vx *= -1;
    if (p.y < 0 || p.y > height) p.vy *= -1;
    
    fill(p.hue, 80, 100);
    noStroke();
    ellipse(p.x, p.y, p.size, p.size);
    
    p.hue = (p.hue + 1) % 360;
  }
}`
  },
  {
    name: 'Wave Animation',
    description: 'Smooth wave animation with vanilla JavaScript',
    category: 'vanilla',
    color: 'yellow',
    code: `<canvas id="waveCanvas"></canvas>

<style>
#waveCanvas {
  width: 100%;
  height: 300px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
}
</style>

<script>
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let time = 0;

function drawWave() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  ctx.beginPath();
  ctx.moveTo(0, canvas.height / 2);
  
  for (let x = 0; x < canvas.width; x++) {
    const y = canvas.height / 2 + 
              Math.sin((x * 0.02) + time) * 30 +
              Math.cos((x * 0.01) + time * 0.5) * 20;
    ctx.lineTo(x, y);
  }
  
  ctx.lineTo(canvas.width, canvas.height);
  ctx.lineTo(0, canvas.height);
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
  ctx.fillStyle = gradient;
  ctx.fill();
  
  time += 0.05;
  requestAnimationFrame(drawWave);
}

drawWave();
</script>`
  },
  {
    name: 'SVG Animation',
    description: 'Animated SVG with path morphing',
    category: 'svg',
    color: 'cyan',
    code: `<svg width="400" height="400" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#00d4ff;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0099cc;stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="200" cy="200" r="150" fill="url(#grad)">
    <animate attributeName="r" values="150;170;150" dur="2s" repeatCount="indefinite" />
  </circle>
  <path d="M 100 200 Q 200 100 300 200 T 500 200" stroke="#fff" stroke-width="3" fill="none">
    <animate attributeName="d" 
             values="M 100 200 Q 200 100 300 200 T 500 200;M 100 200 Q 200 300 300 200 T 500 200;M 100 200 Q 200 100 300 200 T 500 200" 
             dur="3s" 
             repeatCount="indefinite" />
  </path>
</svg>`
  },
  {
    name: '3D Voxels',
    description: 'Voxel-based 3D scene with Three.js',
    category: 'threejs',
    color: 'indigo',
    code: `// Three.js will be automatically loaded by the preview system
// Just use THREE. directly - no imports needed!

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0a0a);
document.body.appendChild(renderer.domElement);

// Create voxel grid
const voxels = [];
const gridSize = 5;
const spacing = 1.2;

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++) {
      if (Math.random() > 0.5) {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ 
          color: new THREE.Color().setHSL(
            (x + y + z) / (gridSize * 3),
            0.8,
            0.6
          )
        });
        const voxel = new THREE.Mesh(geometry, material);
        voxel.position.set(
          (x - gridSize/2) * spacing,
          (y - gridSize/2) * spacing,
          (z - gridSize/2) * spacing
        );
        scene.add(voxel);
        voxels.push(voxel);
      }
    }
  }
}

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
scene.add(ambientLight);

camera.position.set(8, 8, 8);
camera.lookAt(0, 0, 0);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  voxels.forEach((voxel, i) => {
    voxel.rotation.x += 0.01;
    voxel.rotation.y += 0.01;
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();`
  },
  {
    name: '3D Wireframe',
    description: 'Wireframe 3D geometry with Three.js',
    category: 'threejs',
    color: 'orange',
    code: `// Three.js will be automatically loaded by the preview system
// Just use THREE. directly - no imports needed!

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000);
document.body.appendChild(renderer.domElement);

// Create wireframe geometries
const geometries = [
  new THREE.BoxGeometry(2, 2, 2),
  new THREE.SphereGeometry(1.5, 16, 16),
  new THREE.TorusGeometry(1, 0.4, 8, 16),
  new THREE.OctahedronGeometry(1.5)
];

geometries.forEach((geo, i) => {
  const edges = new THREE.EdgesGeometry(geo);
  const material = new THREE.LineBasicMaterial({ 
    color: [0xff6b6b, 0x4ecdc4, 0xffe66d, 0x95e1d3][i],
    linewidth: 2
  });
  const wireframe = new THREE.LineSegments(edges, material);
  wireframe.position.x = (i - 1.5) * 3;
  scene.add(wireframe);
});

const light = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(light);

camera.position.z = 8;

const controls = new THREE.OrbitControls(camera, renderer.domElement);

function animate() {
  requestAnimationFrame(animate);
  scene.children.forEach((child, i) => {
    if (child instanceof THREE.LineSegments) {
      child.rotation.x += 0.01;
      child.rotation.y += 0.01;
    }
  });
  controls.update();
  renderer.render(scene, camera);
}
animate();`
  },
  {
    name: 'Shader Effect',
    description: 'Custom shader with Three.js',
    category: 'threejs',
    color: 'teal',
    code: `// Three.js will be automatically loaded by the preview system
// Just use THREE. directly - no imports needed!

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a1a2e);
document.body.appendChild(renderer.domElement);

// Custom shader material
const vertexShader = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`;

const fragmentShader = \`
  uniform float time;
  varying vec2 vUv;
  
  void main() {
    vec2 uv = vUv;
    float wave = sin(uv.x * 10.0 + time) * 0.5 + 0.5;
    vec3 color = vec3(
      wave,
      sin(uv.y * 10.0 + time * 0.5) * 0.5 + 0.5,
      1.0 - wave
    );
    gl_FragColor = vec4(color, 1.0);
  }
\`;

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    time: { value: 0 }
  }
});

const geometry = new THREE.PlaneGeometry(4, 4, 32, 32);
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

camera.position.z = 3;

const controls = new THREE.OrbitControls(camera, renderer.domElement);

let time = 0;
function animate() {
  requestAnimationFrame(animate);
  time += 0.01;
  material.uniforms.time.value = time;
  controls.update();
  renderer.render(scene, camera);
}
animate();`
  }
];

