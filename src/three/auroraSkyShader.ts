/**
 * Aurora Borealis & Cosmic Sky Shader with Constellations
 * Real-time GLSL multi-layered waving ribbons, twinkling stars, and stage clear constellations.
 */
import * as THREE from 'three';

export interface AuroraSkyController {
  mesh: THREE.Mesh;
  stars: THREE.Points;
  shootingStars: THREE.LineSegments;
  constellationGroup: THREE.Group;
  update: (delta: number) => void;
  setRecovery: (recoveryPercent: number) => void;
  setDawn: (isDawn: boolean, progress?: number) => void;
  triggerStageSurge: (stageNumber: number) => void;
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
uniform float uDawn;     // 0.0 = night aurora, 1.0 = sunrise
uniform float uSurge;    // 0.0 ~ 2.0 surge burst on stage clear

varying vec3 vWorldPosition;
varying vec2 vUv;

// 2D Simplex-like noise helper
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);
  vec2 i1;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;
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

void main() {
  vec3 dir = normalize(vWorldPosition);
  float height = clamp(dir.y, 0.0, 1.0);

  // Night base sky gradient (Deep midnight blue/indigo)
  vec3 nightHorizon = vec3(0.04, 0.08, 0.16);
  vec3 nightZenith  = vec3(0.01, 0.02, 0.05);
  vec3 skyColor = mix(nightHorizon, nightZenith, height);

  // Aurora curtains calculation (Only above horizon height > 0.15)
  if (height > 0.1) {
    float t = uTime * 0.15;
    vec2 coord1 = vec2(dir.x * 2.2 + t * 0.4, dir.z * 1.5 - t * 0.2);
    vec2 coord2 = vec2(dir.x * 3.8 - t * 0.3, dir.z * 2.5 + t * 0.5);

    float n1 = snoise(coord1);
    float n2 = snoise(coord2);

    // Flowing ribbon shape
    float ribbon = smoothstep(0.15, 0.65, n1 * 0.6 + n2 * 0.4 + 0.3);
    float heightFade = smoothstep(0.1, 0.4, height) * smoothstep(0.95, 0.5, height);

    // Multi-color palette: Emerald, Cyan, Violet
    vec3 emerald = vec3(0.06, 0.95, 0.55);
    vec3 cyan    = vec3(0.02, 0.75, 0.95);
    vec3 violet  = vec3(0.65, 0.25, 0.95);

    float colorMix = sin(dir.x * 4.0 + uTime * 0.2) * 0.5 + 0.5;
    vec3 auroraTint = mix(emerald, cyan, colorMix);
    auroraTint = mix(auroraTint, violet, smoothstep(0.4, 0.8, height));

    // Recovery intensity scaling (Initially dim, increasingly vibrant, plus surge bonus)
    float intensity = (0.35 + uRecovery * 0.65 + uSurge * 0.8) * ribbon * heightFade;
    skyColor += auroraTint * intensity;
  }

  // Sunrise dawn transition for the ending
  if (uDawn > 0.0) {
    vec3 dawnHorizon = vec3(0.98, 0.55, 0.32); // Warm coral gold
    vec3 dawnZenith  = vec3(0.25, 0.45, 0.75); // Soft morning blue
    vec3 dawnColor = mix(dawnHorizon, dawnZenith, pow(height, 0.6));

    // Sun disc at horizon
    float sunDot = max(0.0, dot(dir, normalize(vec3(0.3, 0.12, 0.95))));
    vec3 sunDisc = vec3(1.0, 0.9, 0.6) * pow(sunDot, 64.0) * 3.0;

    skyColor = mix(skyColor, dawnColor + sunDisc, uDawn);
  }

  gl_FragColor = vec4(skyColor, 1.0);
}
`;

export function createAuroraSky(): AuroraSkyController {
  // Large inverted sphere dome for sky
  const skyGeo = new THREE.SphereGeometry(140, 32, 24);
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

  // Twinkling Starfield
  const starCount = 800;
  const starGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    // Upper hemisphere
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.85 + 0.15); // Above horizon
    const r = 135;

    positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.cos(phi);
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    starSizes[i] = Math.random() * 2.5 + 1.2;
  }

  starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));

  const starsMat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 2.0,
    transparent: true,
    opacity: 0.85,
    sizeAttenuation: false,
  });
  const stars = new THREE.Points(starGeo, starsMat);

  // Periodic Shooting Star
  const shootGeo = new THREE.BufferGeometry();
  const shootPositions = new Float32Array(6);
  shootGeo.setAttribute('position', new THREE.BufferAttribute(shootPositions, 3));
  const shootMat = new THREE.LineBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0,
    linewidth: 2,
  });
  const shootingStars = new THREE.LineSegments(shootGeo, shootMat);

  let shootActive = false;
  let shootTimer = 4.0;
  let shootProgress = 0;
  let shootStart = new THREE.Vector3();
  let shootDir = new THREE.Vector3();

  // Constellations group
  const constellationGroup = new THREE.Group();

  // Stage constellations data:
  // 1: 고래자리 (Cetus/Whale), 2: 물병자리 (Aquarius), 3: 돌고래자리 (Delphinus), 4: 카시오페이아 (Cassiopeia), 5: 등대자리 (Lighthouse)
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
      opacity: 0.9,
      linewidth: 2,
    });
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    constellationGroup.add(lines);

    // Add star node dots
    const dotGeo = new THREE.BufferGeometry();
    const dotVertices: number[] = [];
    pts.forEach(p => dotVertices.push(p[0], p[1], p[2]));
    dotGeo.setAttribute('position', new THREE.Float32BufferAttribute(dotVertices, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 4.5,
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
    constellationGroup,
    setRecovery: (rec: number) => {
      uniforms.uRecovery.value = THREE.MathUtils.clamp(rec / 100, 0, 1);
    },
    setDawn: (isDawn: boolean, progress: number = 1.0) => {
      uniforms.uDawn.value = isDawn ? progress : 0;
    },
    triggerStageSurge: (stageNumber: number) => {
      surgeDecay = 1.8;
      buildConstellation(stageNumber);
    },
    update: (delta: number) => {
      uniforms.uTime.value += delta;

      // Handle surge decay
      if (surgeDecay > 0) {
        surgeDecay = Math.max(0, surgeDecay - delta * 0.6);
        uniforms.uSurge.value = surgeDecay;
      }

      // Shooting stars cycle
      shootTimer -= delta;
      if (!shootActive && shootTimer <= 0) {
        shootActive = true;
        shootProgress = 0;
        shootTimer = 6.0 + Math.random() * 6.0;

        // Choose random start and direction
        const angle = Math.random() * Math.PI * 2;
        shootStart.set(
          Math.cos(angle) * 70,
          60 + Math.random() * 30,
          Math.sin(angle) * 70
        );
        shootDir.set(
          (Math.random() - 0.5) * 40,
          -15 - Math.random() * 15,
          (Math.random() - 0.5) * 40
        ).normalize().multiplyScalar(45);
      }

      if (shootActive) {
        shootProgress += delta * 1.8;
        if (shootProgress >= 1.0) {
          shootActive = false;
          shootMat.opacity = 0;
        } else {
          shootMat.opacity = Math.sin(shootProgress * Math.PI) * 0.9;
          const curHead = shootStart.clone().addScaledVector(shootDir, shootProgress);
          const curTail = shootStart.clone().addScaledVector(shootDir, Math.max(0, shootProgress - 0.25));

          const pos = shootGeo.attributes.position as THREE.BufferAttribute;
          pos.setXYZ(0, curTail.x, curTail.y, curTail.z);
          pos.setXYZ(1, curHead.x, curHead.y, curHead.z);
          pos.needsUpdate = true;
        }
      }
    },
  };
}
