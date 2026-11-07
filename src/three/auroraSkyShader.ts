/**
 * Dreamy Aurora Borealis, Twinkling Starfield, Full Moon & Halo Shader
 * Features multi-layered vertical curtain fbm rays (#3CFFB0 -> #2EC5FF -> #B36BFF)
 */
import * as THREE from 'three';

export interface AuroraSkyController {
  mesh: THREE.Mesh;
  stars: THREE.Points;
  shootingStars: THREE.LineSegments;
  moonGroup: THREE.Group;
  constellationGroup: THREE.Group;
  update: (delta: number) => void;
  setRecovery: (recoveryPercent: number) => void;
  setDawn: (isDawn: boolean, progress?: number) => void;
  triggerStageSurge: (stageNumber: number) => void;
  setQuality: (quality: 'low' | 'medium' | 'high') => void;
}

const auroraVertexShader = `
varying vec3 vWorldPosition;
varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

const auroraFragmentShader = `
uniform float uTime;
uniform float uRecovery; // 0.0 ~ 1.0
uniform float uDawn;     // 0.0 = night, 1.0 = sunrise
uniform float uSurge;    // 0.0 ~ 2.0 surge burst on stage clear

varying vec3 vWorldPosition;
varying vec2 vUv;

// 2D Simplex / Periodic noise helpers
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m;
  m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

// Fractional Brownian Motion with high vertical stretching for curtain rays
float fbmCurtain(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  float frequency = 1.0;
  for (int i = 0; i < 4; i++) {
    value += amplitude * snoise(p * frequency);
    p.x *= 2.2;
    p.y *= 1.4; // Vertical elongation
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  vec3 dir = normalize(vWorldPosition);
  float height = clamp(dir.y, 0.0, 1.0);

  // Deep indigo/midnight gradient base
  vec3 nightHorizon = vec3(0.03, 0.07, 0.16);
  vec3 nightZenith  = vec3(0.01, 0.02, 0.06);
  vec3 skyColor = mix(nightHorizon, nightZenith, pow(height, 0.7));

  // Waving Aurora Curtains
  if (height > 0.08) {
    float t = uTime * 0.09;

    // Projected horizontal & azimuthal coordinates
    float phi = atan(dir.z, dir.x);
    float verticalCurve = height * 3.5;

    // Layer 1: Main sweeping curtain
    vec2 p1 = vec2(phi * 2.8 + t * 0.35, verticalCurve - t * 0.1);
    float ray1 = fbmCurtain(vec2(p1.x * 2.5, p1.y * 0.8));
    float fold1 = sin(phi * 4.0 + snoise(vec2(phi * 2.0, t * 0.2)) * 2.5);
    float curtain1 = smoothstep(-0.2, 0.7, ray1 + fold1 * 0.35);

    // Layer 2: Faster wavy ribbon
    vec2 p2 = vec2(phi * 4.2 - t * 0.25, verticalCurve * 1.2 + t * 0.15);
    float ray2 = fbmCurtain(vec2(p2.x * 3.0, p2.y * 0.9));
    float curtain2 = smoothstep(-0.1, 0.8, ray2);

    // Layer 3: High ethereal violet haze
    vec2 p3 = vec2(phi * 1.8 + t * 0.18, verticalCurve * 0.6);
    float curtain3 = smoothstep(0.0, 0.9, snoise(p3 * 2.0));

    // Colors: #3CFFB0 (emerald) -> #2EC5FF (cyan) -> #B36BFF (violet)
    vec3 colEmerald = vec3(0.235, 1.0, 0.69); // #3CFFB0
    vec3 colCyan    = vec3(0.18, 0.772, 1.0); // #2EC5FF
    vec3 colViolet  = vec3(0.702, 0.42, 1.0); // #B36BFF

    // Gradient transition across altitude
    float hGrad = smoothstep(0.12, 0.65, height);
    vec3 auroraColor = mix(colEmerald, colCyan, hGrad);
    auroraColor = mix(auroraColor, colViolet, smoothstep(0.4, 0.85, height));

    // Vertical boundary fade
    float verticalMask = smoothstep(0.08, 0.25, height) * smoothstep(0.95, 0.55, height);

    // Combined curtain intensity (boosted for bloom glow)
    float totalCurtain = (curtain1 * 0.65 + curtain2 * 0.45 + curtain3 * 0.3) * verticalMask;

    // Recovery scaling + surge
    float intensity = (0.55 + uRecovery * 0.85 + uSurge * 1.5) * totalCurtain;

    // Luminous emission (ready to bloom)
    skyColor += auroraColor * intensity * 1.35;
  }

  // Sunrise dawn transition for ending
  if (uDawn > 0.0) {
    vec3 dawnHorizon = vec3(1.0, 0.58, 0.35); // Warm morning apricot
    vec3 dawnMid     = vec3(0.92, 0.38, 0.55); // Rose gold
    vec3 dawnZenith  = vec3(0.25, 0.45, 0.80); // Clear morning sky

    vec3 dawnSky = mix(dawnHorizon, dawnMid, pow(height, 0.5));
    dawnSky = mix(dawnSky, dawnZenith, pow(height, 1.2));

    // Glowing sun disc at horizon
    vec3 sunPos = normalize(vec3(0.3, 0.12, 0.95));
    float sunDot = max(0.0, dot(dir, sunPos));
    vec3 sunColor = vec3(1.0, 0.92, 0.65) * pow(sunDot, 128.0) * 4.0;
    vec3 sunGlow  = vec3(1.0, 0.55, 0.25) * pow(sunDot, 12.0) * 1.2;

    skyColor = mix(skyColor, dawnSky + sunColor + sunGlow, uDawn);
  }

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

// Star shader for organic twinkling
const starVertexShader = `
attribute float aSize;
attribute float aTwinkleOffset;
uniform float uTime;
varying float vBrightness;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  // Twinkle variation over time
  float tw = sin(uTime * 2.2 + aTwinkleOffset * 6.28) * 0.5 + 0.5;
  vBrightness = 0.45 + tw * 0.55;

  gl_PointSize = aSize * (1.0 + tw * 0.5);
}
`;

const starFragmentShader = `
varying float vBrightness;

void main() {
  // Soft round star point
  vec2 coord = gl_PointCoord - vec2(0.5);
  float dist = length(coord);
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.05, dist) * vBrightness;
  vec3 starTint = mix(vec3(0.85, 0.95, 1.0), vec3(1.0, 0.95, 0.8), vBrightness);
  gl_FragColor = vec4(starTint, alpha);
}
`;

export function createAuroraSky(): AuroraSkyController {
  // Large inverted sphere dome for sky
  const skyGeo = new THREE.SphereGeometry(150, 48, 32);
  skyGeo.scale(-1, 1, 1);

  const uniforms = {
    uTime: { value: 0 },
    uRecovery: { value: 0 },
    uDawn: { value: 0 },
    uSurge: { value: 0 },
  };

  const skyMat = new THREE.ShaderMaterial({
    vertexShader: auroraVertexShader,
    fragmentShader: auroraFragmentShader,
    uniforms,
    side: THREE.BackSide,
    depthWrite: false,
  });

  const skyMesh = new THREE.Mesh(skyGeo, skyMat);

  // 3,500+ Twinkling Stars
  const starCount = 3500;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  const twinkleOffsets = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.88 + 0.12); // Above horizon
    const r = 142 + Math.random() * 4;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

    starSizes[i] = Math.random() * 2.8 + 1.2;
    twinkleOffsets[i] = Math.random();
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  starGeo.setAttribute('aTwinkleOffset', new THREE.BufferAttribute(twinkleOffsets, 1));

  const starUniforms = { uTime: { value: 0 } };
  const starsMat = new THREE.ShaderMaterial({
    vertexShader: starVertexShader,
    fragmentShader: starFragmentShader,
    uniforms: starUniforms,
    transparent: true,
    depthWrite: false,
  });

  const stars = new THREE.Points(starGeo, starsMat);

  // Big Full Moon with Glowing Halo
  const moonGroup = new THREE.Group();
  moonGroup.position.set(-35, 45, -95);

  // Moon Sphere
  const moonGeo = new THREE.SphereGeometry(6.5, 24, 24);
  const moonMat = new THREE.MeshBasicMaterial({
    color: 0xfffae0, // Luminous warm cream
  });
  const moonSphere = new THREE.Mesh(moonGeo, moonMat);
  moonGroup.add(moonSphere);

  // Moon Halo Corona (Soft radial glow plane)
  const haloGeo = new THREE.PlaneGeometry(36, 36);
  // Procedural canvas radial gradient for halo
  const haloCanvas = document.createElement('canvas');
  haloCanvas.width = 256;
  haloCanvas.height = 256;
  const hCtx = haloCanvas.getContext('2d')!;
  const grad = hCtx.createRadialGradient(128, 128, 15, 128, 128, 120);
  grad.addColorStop(0.0, 'rgba(255, 250, 220, 0.85)');
  grad.addColorStop(0.25, 'rgba(125, 211, 252, 0.4)');
  grad.addColorStop(0.6, 'rgba(168, 85, 247, 0.15)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
  hCtx.fillStyle = grad;
  hCtx.fillRect(0, 0, 256, 256);

  const haloTex = new THREE.CanvasTexture(haloCanvas);
  const haloMat = new THREE.MeshBasicMaterial({
    map: haloTex,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const moonHalo = new THREE.Mesh(haloGeo, haloMat);
  moonHalo.position.z = -0.5;
  moonGroup.add(moonHalo);

  // Periodic Shooting Star (Every 5~8s)
  const shootGeo = new THREE.BufferGeometry();
  const shootPositions = new Float32Array(6);
  shootGeo.setAttribute('position', new THREE.BufferAttribute(shootPositions, 3));
  const shootMat = new THREE.LineBasicMaterial({
    color: 0xa5f3fc,
    transparent: true,
    opacity: 0,
    linewidth: 3,
    blending: THREE.AdditiveBlending,
  });
  const shootingStars = new THREE.LineSegments(shootGeo, shootMat);

  let shootActive = false;
  let shootTimer = 5.0;
  let shootProgress = 0;
  let shootStart = new THREE.Vector3();
  let shootDir = new THREE.Vector3();

  // Constellations group
  const constellationGroup = new THREE.Group();
  const constellationData: Record<number, number[][]> = {
    1: [[-30, 60, -80], [-20, 65, -82], [-10, 62, -78], [-5, 55, -80], [-15, 52, -85], [-30, 60, -80]],
    2: [[30, 70, -70], [38, 72, -65], [44, 68, -72], [50, 75, -68], [38, 72, -65]],
    3: [[-50, 75, 40], [-45, 80, 42], [-40, 78, 48], [-44, 73, 46], [-50, 75, 40], [-55, 70, 38]],
    4: [[10, 85, 30], [20, 88, 25], [15, 82, 35], [25, 84, 40], [35, 80, 38]],
    5: [[-10, 90, -20], [-12, 80, -20], [-8, 80, -20], [-10, 90, -20], [-10, 95, -20]],
  };
  const unlockedConstellations = new Set<number>();

  function buildConstellation(stageNum: number) {
    if (unlockedConstellations.has(stageNum)) return;
    unlockedConstellations.add(stageNum);
    const pts = constellationData[stageNum];
    if (!pts) return;

    const lineGeo = new THREE.BufferGeometry();
    const lineVertices: number[] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      lineVertices.push(pts[i][0], pts[i][1], pts[i][2]);
      lineVertices.push(pts[i + 1][0], pts[i + 1][1], pts[i + 1][2]);
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    constellationGroup.add(lines);

    const dotGeo = new THREE.BufferGeometry();
    const dotVertices: number[] = [];
    pts.forEach(p => dotVertices.push(p[0], p[1], p[2]));
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotVertices, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 5.5,
      sizeAttenuation: false,
    });
    const dots = new THREE.Points(dotGeo, dotMat);
    constellationGroup.add(dots);
  }

  let surgeDecay = 0;

  return {
    mesh: skyMesh,
    stars,
    shootingStars,
    moonGroup,
    constellationGroup,
    setRecovery: (rec: number) => {
      uniforms.uRecovery.value = THREE.MathUtils.clamp(rec / 100, 0, 1);
    },
    setDawn: (isDawn: boolean, progress: number = 1.0) => {
      uniforms.uDawn.value = isDawn ? progress : 0;
      if (isDawn) {
        moonGroup.visible = progress < 0.8;
      } else {
        moonGroup.visible = true;
      }
    },
    triggerStageSurge: (stageNumber: number) => {
      surgeDecay = 2.0;
      buildConstellation(stageNumber);
    },
    setQuality: (quality: 'low' | 'medium' | 'high') => {
      const count = quality === 'low' ? 1000 : quality === 'medium' ? 2200 : 3500;
      starGeo.setDrawRange(0, count);
    },
    update: (delta: number) => {
      uniforms.uTime.value += delta;
      starUniforms.uTime.value += delta;

      if (surgeDecay > 0) {
        surgeDecay = Math.max(0, surgeDecay - delta * 0.5);
        uniforms.uSurge.value = surgeDecay;
      }

      // Moon halo faces camera roughly
      moonHalo.lookAt(0, 5, 0);

      // Shooting stars cycle (5~8s)
      shootTimer -= delta;
      if (!shootActive && shootTimer <= 0) {
        shootActive = true;
        shootProgress = 0;
        shootTimer = 5.0 + Math.random() * 3.5;

        const angle = Math.random() * Math.PI * 2;
        shootStart.set(
          Math.cos(angle) * 75,
          65 + Math.random() * 25,
          Math.sin(angle) * 75
        );
        shootDir.set(
          (Math.random() - 0.5) * 50,
          -20 - Math.random() * 20,
          (Math.random() - 0.5) * 50
        ).normalize().multiplyScalar(55);
      }

      if (shootActive) {
        shootProgress += delta * 1.6;
        if (shootProgress >= 1.0) {
          shootActive = false;
          shootMat.opacity = 0;
        } else {
          shootMat.opacity = Math.sin(shootProgress * Math.PI) * 1.0;
          const curHead = shootStart.clone().addScaledVector(shootDir, shootProgress);
          const curTail = shootStart.clone().addScaledVector(shootDir, Math.max(0, shootProgress - 0.28));

          const pos = shootGeo.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, curTail.x, curTail.y, curTail.z);
          pos.setXYZ(1, curHead.x, curHead.y, curHead.z);
          pos.needsUpdate = true;
        }
      }
    },
  };
}
