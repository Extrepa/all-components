// src/shaders/errl.ts
export const fragmentShader = `
uniform float uTime;
uniform float uScrollY;
uniform vec3 uColorStart;
uniform vec3 uColorEnd;
varying vec2 vUv;

float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123); }
float noise(vec2 st) {
    vec2 i = floor(st); vec2 f = fract(st);
    float a = random(i); float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0)); float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
#define OCTAVES 4
float fbm(in vec2 st) {
    float v = 0.0; float a = 0.5;
    for (int i = 0; i < OCTAVES; i++) { v += a * noise(st); st *= 2.0; a *= 0.5; }
    return v;
}

void main() {
    vec2 uv = vUv;
    uv.y -= uScrollY * 0.5;
    
    vec2 q = vec2(fbm(uv), fbm(uv + vec2(5.2, 1.3)));
    vec2 r = vec2(fbm(uv + 4.0*q + vec2(uTime * 0.1)), fbm(uv + 4.0*q));
    float f = fbm(uv + 4.0*r);

    vec3 color = mix(uColorStart, uColorEnd, clamp(f*f*4.0, 0.0, 1.0));
    color += vec3(sin(f*10.0+uTime), sin(f*10.0+uTime+2.0), sin(f*10.0+uTime+4.0)) * 0.15;

    float lightY = 0.2 + (uScrollY * 1.2);
    float dist = distance(vUv, vec2(0.5, lightY));
    float beam = smoothstep(0.6, 0.2, dist);
    
    gl_FragColor = vec4(color * beam, 1.0);
}
`;

export const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;