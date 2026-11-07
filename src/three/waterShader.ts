/**
 * Enhanced Ocean Water Shader with Moonlight Road, Shore Foam, and Bioluminescence
 */
import * as THREE from 'three';

const waterVertexShader = `
uniform float uTime;
uniform vec3 uPlayerPos;
uniform float uRecovery;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vBioluminescence;
varying float vShoreDist;

// Multi-directional sinusoidal wave superposition
float calculateWave(vec2 p, vec2 dir, float amp, float wavelength, float speed) {
  float k = 6.28318 / wavelength;
  float c = sqrt(9.8 / k);
  float f = k * (dot(dir, p) - c * speed * uTime);
  return amp * sin(f);
}

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  // Distance from island center (~25 radius)
  float distFromCenter = length(worldPos.xz);
  vShoreDist = distFromCenter;

  // Gentle multi-wave synthesis
  float w1 = calculateWave(worldPos.xz, normalize(vec2(1.0, 0.3)), 0.18, 12.0, 0.35);
  float w2 = calculateWave(worldPos.xz, normalize(vec2(-0.5, 0.8)), 0.11, 7.5, 0.45);
  float w3 = calculateWave(worldPos.xz, normalize(vec2(0.2, -1.0)), 0.07, 4.0, 0.7);
  float w4 = calculateWave(worldPos.xz, normalize(vec2(-0.8, -0.4)), 0.05, 2.5, 0.9);

  // Shore dampening
  float shoreFade = smoothstep(16.0, 26.0, distFromCenter);
  worldPos.y += (w1 + w2 + w3 + w4) * (0.4 + 0.6 * shoreFade);

  // Bioluminescent plankton activation around avatar in shallow water
  float distToPlayer = length(worldPos.xz - uPlayerPos.xz);
  float inWaterFactor = smoothstep(2.5, 0.0, uPlayerPos.y); // active when avatar is in water
  float bioPulse = sin(uTime * 4.0 - distToPlayer * 3.0) * 0.5 + 0.5;
  vBioluminescence = smoothstep(3.8, 0.1, distToPlayer) * inWaterFactor * (0.6 + 0.5 * bioPulse);

  vWorldPosition = worldPos.xyz;

  // Analytical normal calculation
  vec3 normal = vec3(
    -(w1 * 0.4 - w2 * 0.2 + w4 * 0.3),
    1.0,
    -(w1 * 0.2 + w2 * 0.5 - w3 * 0.3)
  );
  vNormal = normalize(normal);

  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

const waterFragmentShader = `
uniform vec3 uCameraPos;
uniform float uTime;
uniform float uRecovery;
uniform float uDawn;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vBioluminescence;
varying float vShoreDist;

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPosition);
  vec3 normal = normalize(vNormal);

  // Water Depth Color: Deep Midnight Navy -> Dreamy Cyan Teal
  vec3 deepNavy = vec3(0.015, 0.055, 0.13); // #040e21
  vec3 cyanTeal = vec3(0.025, 0.16, 0.28); // #062947
  vec3 waterBase = mix(deepNavy, cyanTeal, smoothstep(18.0, 45.0, vShoreDist));
  waterBase = mix(waterBase, vec3(0.03, 0.25, 0.40), uRecovery * 0.5);

  // Fresnel Reflectance
  float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.2);

  // Moon Position (-35, 45, -95) for Moonlight Highway
  vec3 moonDir = normalize(vec3(-35.0, 45.0, -95.0) - vWorldPosition);
  vec3 halfVec = normalize(moonDir + viewDir);

  // Broad glistening specular reflection
  float specSharp = pow(max(0.0, dot(normal, halfVec)), 90.0);
  float specWide  = pow(max(0.0, dot(normal, halfVec)), 16.0);
  vec3 moonSpec = vec3(1.0, 0.98, 0.85) * (specSharp * 1.8 + specWide * 0.45);

  // Subtle Aurora green/violet shimmer on wave crests
  float waveCrest = clamp(normal.y, 0.0, 1.0);
  vec3 auroraReflect = mix(vec3(0.23, 1.0, 0.69), vec3(0.70, 0.42, 1.0), sin(vWorldPosition.x * 0.05 + uTime * 0.2) * 0.5 + 0.5);
  float auroraGlint = pow(1.0 - normal.y, 2.0) * (0.25 + 0.45 * uRecovery);

  // Shore Foam Rings near Island Coastline (radius ~22 to 26)
  float shoreWave = sin(uTime * 2.0 - vShoreDist * 1.5);
  float foamMask = smoothstep(22.0, 26.5, vShoreDist) * smoothstep(27.5, 26.0, vShoreDist);
  float foamIntensity = smoothstep(0.4, 0.85, shoreWave) * foamMask;
  vec3 foamColor = vec3(0.85, 0.95, 1.0);

  // Composite Water Surface
  vec3 waterColor = waterBase;
  waterColor += auroraReflect * auroraGlint;
  waterColor += moonSpec * (0.8 + 0.4 * fresnel);
  waterColor = mix(waterColor, foamColor, foamIntensity * 0.75);

  // Bioluminescent Plankton Glow (Neon Turquoise Cyan #00f0ff)
  vec3 bioGlowColor = vec3(0.0, 0.95, 1.0);
  waterColor += bioGlowColor * vBioluminescence * 2.2;

  // Sunrise Dawn warm reflection for ending
  if (uDawn > 0.0) {
    vec3 dawnSpec = vec3(1.0, 0.6, 0.35) * pow(max(0.0, dot(normal, normalize(vec3(0.3, 0.2, 0.95) + viewDir))), 32.0);
    vec3 dawnWater = vec3(0.18, 0.10, 0.22);
    waterColor = mix(waterColor, dawnWater + dawnSpec * 1.5, uDawn * 0.75);
  }

  gl_FragColor = vec4(waterColor, 0.90);
}
`;

export interface OceanWaterController {
  mesh: THREE.Mesh;
  update: (delta: number, playerPos: THREE.Vector3) => void;
  setRecovery: (recPercent: number) => void;
  setDawn: (isDawn: boolean, progress?: number) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
}

export function createOceanWater(): OceanWaterController {
  const size = 280;
  const geometry = new THREE.PlaneGeometry(size, size, 90, 90);
  geometry.rotateX(-Math.PI / 2);

  const uniforms = {
    uTime: { value: 0 },
    uCameraPos: { value: new THREE.Vector3() },
    uPlayerPos: { value: new THREE.Vector3(0, 0, 0) },
    uRecovery: { value: 0 },
    uDawn: { value: 0 },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: waterVertexShader,
    fragmentShader: waterFragmentShader,
    uniforms,
    transparent: true,
    depthWrite: false,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.y = 0.0;

  return {
    mesh,
    setRecovery: (rec: number) => {
      uniforms.uRecovery.value = THREE.MathUtils.clamp(rec / 100, 0, 1);
    },
    setDawn: (isDawn: boolean, progress: number = 1.0) => {
      uniforms.uDawn.value = isDawn ? progress : 0;
    },
    setQuality: (q: 'low' | 'medium' | 'high') => {
      mesh.geometry.dispose();
      const segs = q === 'low' ? 24 : q === 'medium' ? 50 : 90;
      mesh.geometry = new THREE.PlaneGeometry(size, size, segs, segs);
      mesh.geometry.rotateX(-Math.PI / 2);
    },
    update: (delta: number, playerPos: THREE.Vector3) => {
      uniforms.uTime.value += delta;
      uniforms.uPlayerPos.value.copy(playerPos);
    },
  };
}
