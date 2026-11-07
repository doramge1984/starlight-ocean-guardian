/**
 * Real-time Ocean Water Shader with Bioluminescent Plankton Glow
 * Dynamically ripples with footsteps and waves with moonlight specular glint.
 */
import * as THREE from 'three';

const waterVertexShader = `
uniform float uTime;
uniform vec3 uPlayerPos;
uniform float uRecovery;

varying vec3 vWorldPosition;
varying vec3 vNormal;
varying float vBioluminescence;

// Gerstner-like wave superposition
float calculateWave(vec2 p, vec2 dir, float steepness, float wavelength, float speed) {
  float k = 2.0 * 3.141592 / wavelength;
  float c = sqrt(9.8 / k);
  float f = k * (dot(dir, p) - c * speed * uTime);
  return (steepness / k) * sin(f);
}

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);

  // Waves
  float w1 = calculateWave(worldPos.xz, vec2(1.0, 0.3), 0.12, 14.0, 0.4);
  float w2 = calculateWave(worldPos.xz, vec2(-0.4, 0.8), 0.08, 8.0, 0.6);
  float w3 = calculateWave(worldPos.xz, vec2(0.2, -1.0), 0.05, 4.0, 0.9);

  worldPos.y += (w1 + w2 + w3);

  // Bioluminescent plankton activation: distance to player in water
  float distToPlayer = length(worldPos.xz - uPlayerPos.xz);
  float playerSpeedFactor = clamp(abs(uPlayerPos.y), 0.0, 1.0); // Active near water level y ~ 0
  float bioPulse = sin(uTime * 3.0 + distToPlayer * 2.0) * 0.5 + 0.5;
  vBioluminescence = smoothstep(3.5, 0.2, distToPlayer) * (0.6 + 0.4 * bioPulse);

  vWorldPosition = worldPos.xyz;
  vNormal = normalize(vec3(-w1 * 0.4, 1.0, -w2 * 0.4));

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

void main() {
  vec3 viewDir = normalize(uCameraPos - vWorldPosition);
  vec3 normal = normalize(vNormal);

  // Deep ocean base color: shifts from murky deep teal to crystal azure as recovery increases
  vec3 murkyWater   = vec3(0.02, 0.08, 0.14);
  vec3 restoredWater = vec3(0.02, 0.18, 0.32);
  vec3 waterBase    = mix(murkyWater, restoredWater, uRecovery);

  // Fresnel reflection factor
  float fresnel = pow(1.0 - max(0.0, dot(viewDir, normal)), 3.5);

  // Moonlight direction
  vec3 moonDir = normalize(vec3(0.3, 0.8, -0.6));
  vec3 halfVec = normalize(moonDir + viewDir);
  float spec = pow(max(0.0, dot(normal, halfVec)), 64.0);

  // Sky reflection
  vec3 skyReflect = mix(vec3(0.08, 0.25, 0.45), vec3(0.3, 0.6, 0.85), uRecovery);
  vec3 waterColor = mix(waterBase, skyReflect, fresnel * 0.65);
  waterColor += vec3(0.85, 0.95, 1.0) * spec * 0.8;

  // Bioluminescent glowing plankton (Neon turquoise/cyan glow)
  vec3 bioCyan = vec3(0.08, 0.95, 0.9);
  waterColor += bioCyan * vBioluminescence * 1.5;

  // Dawn warm shift
  if (uDawn > 0.0) {
    vec3 dawnWater = vec3(0.2, 0.12, 0.22);
    waterColor = mix(waterColor, dawnWater + vec3(0.9, 0.6, 0.4) * spec * 1.2, uDawn * 0.7);
  }

  gl_FragColor = vec4(waterColor, 0.88);
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
  const size = 260;
  // High quality geometry by default
  const geometry = new THREE.PlaneGeometry(size, size, 80, 80);
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
      if (q === 'low') {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(size, size, 24, 24);
        mesh.geometry.rotateX(-Math.PI / 2);
      } else if (q === 'medium') {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(size, size, 48, 48);
        mesh.geometry.rotateX(-Math.PI / 2);
      } else {
        mesh.geometry.dispose();
        mesh.geometry = new THREE.PlaneGeometry(size, size, 80, 80);
        mesh.geometry.rotateX(-Math.PI / 2);
      }
    },
    update: (delta: number, playerPos: THREE.Vector3) => {
      uniforms.uTime.value += delta;
      uniforms.uPlayerPos.value.copy(playerPos);
    },
  };
}
