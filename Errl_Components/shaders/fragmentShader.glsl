uniform float uScrollProgress; // 0.0 (top) to 1.0 (bottom)
uniform float uAspectRatio;
uniform float uTime;
uniform float uLightIntensity; // 0.0 to 1.0, controls overall brightness

varying vec2 vUv;

// Simple noise function for the "oil" effect
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  // 1. Calculate Light Position
  // Scroll down = light moves up (inverted Y)
  vec2 lightPos = vec2(0.5, 1.0 - uScrollProgress);
  
  // 2. Create the Beam (Soft Radial Gradient)
  // Correct aspect ratio so the light is round, not oval
  vec2 uvCorrected = vUv;
  uvCorrected.x *= uAspectRatio;
  
  vec2 lightPosCorrected = vec2(lightPos.x * uAspectRatio, lightPos.y);
  float dist = distance(uvCorrected, lightPosCorrected);
  
  // A sharp center with a soft falloff (The "Projector Lens" look)
  float lightIntensity = smoothstep(0.4, 0.0, dist);
  
  // 3. The "Oil" noise (animated)
  vec2 noiseCoord = vUv * 8.0 + vec2(uTime * 0.1, uTime * 0.05);
  float oilNoise = noise(noiseCoord);
  oilNoise = pow(oilNoise, 2.0); // Make it more subtle
  
  // Create oil color (cyan/magenta tinted)
  vec3 oilColor = vec3(0.0, 0.8, 0.9) * 0.3 + vec3(0.9, 0.0, 0.8) * 0.2;
  oilColor += vec3(oilNoise * 0.1);
  
  // Multiply the oil by the light intensity
  // Where there is no light, there is darkness
  vec3 finalColor = oilColor * lightIntensity * uLightIntensity;
  
  // Add a "Hotspot" (The bulb center)
  float hotspotDist = distance(uvCorrected, lightPosCorrected);
  float hotspot = smoothstep(0.05, 0.0, hotspotDist);
  finalColor += vec3(1.0, 0.9, 0.8) * hotspot * 0.5 * uLightIntensity;
  
  // Add subtle edge darkening (the projector bed)
  float edgeDarken = smoothstep(0.0, 0.2, min(min(vUv.x, 1.0 - vUv.x), min(vUv.y, 1.0 - vUv.y)));
  finalColor *= (0.3 + edgeDarken * 0.7);
  
  gl_FragColor = vec4(finalColor, 1.0);
}

