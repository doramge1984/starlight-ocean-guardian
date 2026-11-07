/**
 * Low-Poly Stylized 3D Models & 2-Head Chibi Animal Avatars
 * Includes curved palm trees, lanterns, rising campfire embers, and bouncy animations.
 */
import * as THREE from 'three';

// Stylized Material Palette with Flat/Smooth Shading Contrast
const materials = {
  // Chibi Fur & Skin
  rabbitWhite: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.6, flatShading: true }),
  rabbitPink: new THREE.MeshStandardMaterial({ color: 0xfda4af, roughness: 0.7, flatShading: true }),
  cheeks: new THREE.MeshBasicMaterial({ color: 0xfb7185 }), // Rosy blush cheeks
  eyePupil: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
  eyeGlint: new THREE.MeshBasicMaterial({ color: 0xffffff }),

  foxOrange: new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.65, flatShading: true }),
  foxWhite: new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.7, flatShading: true }),
  foxBlack: new THREE.MeshStandardMaterial({ color: 0x271911, roughness: 0.8, flatShading: true }),

  bearBrown: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.75, flatShading: true }),
  bearSnout: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.8, flatShading: true }),

  penguinNavy: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.5, flatShading: true }),
  penguinWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6, flatShading: true }),
  penguinYellow: new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.5, flatShading: true }),

  otterWarm: new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.7, flatShading: true }),
  otterChest: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.75, flatShading: true }),

  // Island Environment
  sandShore: new THREE.MeshStandardMaterial({ color: 0xe0be8b, roughness: 0.9, flatShading: true }),
  rockCliff: new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95, flatShading: true }),
  palmTrunk: new THREE.MeshStandardMaterial({ color: 0x6b4226, roughness: 0.85, flatShading: true }),
  palmLeaves: new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.65, flatShading: true }),
  lanternWood: new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.85, flatShading: true }),
  lanternGlow: new THREE.MeshBasicMaterial({ color: 0xfef08a }),

  // Campfire
  woodChar: new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9, flatShading: true }),
  flameBright: new THREE.MeshBasicMaterial({ color: 0xfffbeb }),
  flameOrange: new THREE.MeshBasicMaterial({ color: 0xf97316, transparent: true, opacity: 0.9 }),

  // Marine Props & Corals
  turtleShell: new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.6, flatShading: true }),
  turtleSkin: new THREE.MeshStandardMaterial({ color: 0x4ade80, roughness: 0.5, flatShading: true }),
  coralPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5, emissive: 0x881337, emissiveIntensity: 0.35, flatShading: true }),
  coralCyan: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5, emissive: 0x083344, emissiveIntensity: 0.4, flatShading: true }),
  coralBleached: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9, flatShading: true }),
  fishBlue: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, emissive: 0x0284c7, emissiveIntensity: 0.4, flatShading: true }),
  fishOrange: new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.4, emissive: 0xea580c, emissiveIntensity: 0.3, flatShading: true }),
  dolphinSleek: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.15, flatShading: true }),

  // Tech & Billboard
  lighthouseWhite: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, flatShading: true }),
  lighthouseRed: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4, flatShading: true }),
  screenFrame: new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.6, flatShading: true }),
  beaconBeam: new THREE.MeshBasicMaterial({ color: 0xfef08a, transparent: true, opacity: 0.22, side: THREE.DoubleSide, depthWrite: false }),
  goldStar: new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.2 }),
};

export interface AnimatedAvatarGroup extends THREE.Group {
  userData: {
    avatarType: string;
    bodyGroup?: THREE.Group;
    headGroup?: THREE.Group;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    tail?: THREE.Mesh;
    ears?: THREE.Group;
    walkCycle: number;
    isMoving: boolean;
    isEmoting: boolean;
  };
}

/**
 * Creates 1 of 5 Chibi 2-Head Ratio Animal Avatars
 * With large expressive heads, blushing cheeks, sparkling eyes, and bouncy physics
 */
export function createAnimalAvatar(animalType: string = 'rabbit'): AnimatedAvatarGroup {
  const root = new THREE.Group() as AnimatedAvatarGroup;
  root.userData = {
    avatarType: animalType,
    walkCycle: 0,
    isMoving: false,
    isEmoting: false,
  };

  const bodyGroup = new THREE.Group();
  root.add(bodyGroup);
  root.userData.bodyGroup = bodyGroup;

  // Material selection based on animal
  let mainMat = materials.rabbitWhite;
  let chestMat = materials.rabbitPink;
  if (animalType === 'fox') { mainMat = materials.foxOrange; chestMat = materials.foxWhite; }
  if (animalType === 'bear') { mainMat = materials.bearBrown; chestMat = materials.bearSnout; }
  if (animalType === 'penguin') { mainMat = materials.penguinNavy; chestMat = materials.penguinWhite; }
  if (animalType === 'otter') { mainMat = materials.otterWarm; chestMat = materials.otterChest; }

  // 1. Cute Small Torso (Chibi 2-head ratio)
  const torsoGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.55, 8);
  torsoGeo.translate(0, 0.28, 0);
  const torso = new THREE.Mesh(torsoGeo, mainMat);
  torso.castShadow = true;
  bodyGroup.add(torso);

  // Chest / Belly
  const bellyGeo = new THREE.CylinderGeometry(0.22, 0.32, 0.45, 8, 1, false, 0, Math.PI);
  bellyGeo.translate(0, 0.28, 0.12);
  const belly = new THREE.Mesh(bellyGeo, chestMat);
  bodyGroup.add(belly);

  // 2. Large Expressive Head (Chibi ratio ~0.55 radius)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.82, 0);
  root.userData.headGroup = headGroup;
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.52, 10, 8);
  headGeo.scale(1.05, 0.95, 1.0);
  const headMesh = new THREE.Mesh(headGeo, mainMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Sparkling Anime Eyes (Pupil + Specular Highlight)
  const eyePupilGeo = new THREE.SphereGeometry(0.09, 8, 8);
  eyePupilGeo.scale(1, 1.25, 0.6);

  const leftPupil = new THREE.Mesh(eyePupilGeo, materials.eyePupil);
  leftPupil.position.set(0.18, 0.05, 0.48);
  const rightPupil = new THREE.Mesh(eyePupilGeo, materials.eyePupil);
  rightPupil.position.set(-0.18, 0.05, 0.48);

  // White Eye Highlights (Sparkles)
  const glintGeo = new THREE.SphereGeometry(0.035, 6, 6);
  const leftGlint = new THREE.Mesh(glintGeo, materials.eyeGlint);
  leftGlint.position.set(0.20, 0.09, 0.53);
  const rightGlint = new THREE.Mesh(glintGeo, materials.eyeGlint);
  rightGlint.position.set(-0.16, 0.09, 0.53);

  headGroup.add(leftPupil, rightPupil, leftGlint, rightGlint);

  // Rosy Blush Cheeks
  const cheekGeo = new THREE.CircleGeometry(0.08, 8);
  cheekGeo.scale(1.3, 0.8, 1);
  const leftCheek = new THREE.Mesh(cheekGeo, materials.cheeks);
  leftCheek.position.set(0.28, -0.06, 0.44);
  leftCheek.rotation.y = 0.35;
  const rightCheek = new THREE.Mesh(cheekGeo, materials.cheeks);
  rightCheek.position.set(-0.28, -0.06, 0.44);
  rightCheek.rotation.y = -0.35;
  headGroup.add(leftCheek, rightCheek);

  // Animal Specific Features
  if (animalType === 'rabbit') {
    // Tall cute floppy ears
    const earGroup = new THREE.Group();
    const earGeo = new THREE.ConeGeometry(0.14, 0.8, 6);
    earGeo.translate(0, 0.4, 0);

    const leftEar = new THREE.Mesh(earGeo, materials.rabbitWhite);
    leftEar.position.set(0.22, 0.45, 0);
    leftEar.rotation.z = -0.15;
    leftEar.rotation.x = -0.1;

    const rightEar = new THREE.Mesh(earGeo, materials.rabbitWhite);
    rightEar.position.set(-0.22, 0.45, 0);
    rightEar.rotation.z = 0.15;
    rightEar.rotation.x = -0.1;

    // Pink ear lining
    const innerGeo = new THREE.ConeGeometry(0.08, 0.6, 5);
    innerGeo.translate(0, 0.3, 0.05);
    const leftInner = new THREE.Mesh(innerGeo, materials.rabbitPink);
    const rightInner = new THREE.Mesh(innerGeo, materials.rabbitPink);
    leftEar.add(leftInner);
    rightEar.add(rightInner);

    earGroup.add(leftEar, rightEar);
    headGroup.add(earGroup);
    root.userData.ears = earGroup;

    // Cute fluffy tail
    const tailGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const tail = new THREE.Mesh(tailGeo, materials.rabbitWhite);
    tail.position.set(0, 0.15, -0.38);
    bodyGroup.add(tail);
    root.userData.tail = tail;

  } else if (animalType === 'fox') {
    // Fox snout & cute dark nose
    const snoutGeo = new THREE.ConeGeometry(0.18, 0.4, 6);
    snoutGeo.rotateX(Math.PI / 2);
    snoutGeo.translate(0, -0.06, 0.52);
    const snout = new THREE.Mesh(snoutGeo, materials.foxWhite);
    headGroup.add(snout);

    const noseGeo = new THREE.SphereGeometry(0.05, 5, 5);
    const nose = new THREE.Mesh(noseGeo, materials.foxBlack);
    nose.position.set(0, -0.06, 0.72);
    headGroup.add(nose);

    // Pointed ears with white fluffy inside
    const earGeo = new THREE.ConeGeometry(0.16, 0.45, 5);
    earGeo.translate(0, 0.22, 0);
    const leftEar = new THREE.Mesh(earGeo, materials.foxOrange);
    leftEar.position.set(0.28, 0.42, 0);
    leftEar.rotation.z = -0.35;
    const rightEar = new THREE.Mesh(earGeo, materials.foxOrange);
    rightEar.position.set(-0.28, 0.42, 0);
    rightEar.rotation.z = 0.35;
    headGroup.add(leftEar, rightEar);

    // Big bushy fox tail
    const tailGeo = new THREE.ConeGeometry(0.22, 0.75, 6);
    tailGeo.rotateX(-Math.PI / 3);
    tailGeo.translate(0, 0.25, -0.4);
    const tail = new THREE.Mesh(tailGeo, materials.foxOrange);
    bodyGroup.add(tail);
    root.userData.tail = tail;

  } else if (animalType === 'bear') {
    // Round ears
    const earGeo = new THREE.SphereGeometry(0.16, 6, 6);
    const leftEar = new THREE.Mesh(earGeo, materials.bearBrown);
    leftEar.position.set(0.38, 0.4, 0);
    const rightEar = new THREE.Mesh(earGeo, materials.bearBrown);
    rightEar.position.set(-0.38, 0.4, 0);
    headGroup.add(leftEar, rightEar);

    // Soft round snout
    const snoutGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.22, 6);
    snoutGeo.rotateX(Math.PI / 2);
    snoutGeo.translate(0, -0.08, 0.48);
    const snout = new THREE.Mesh(snoutGeo, materials.bearSnout);
    headGroup.add(snout);

  } else if (animalType === 'penguin') {
    // Orange beak
    const beakGeo = new THREE.ConeGeometry(0.12, 0.35, 5);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.translate(0, -0.05, 0.52);
    const beak = new THREE.Mesh(beakGeo, materials.penguinYellow);
    headGroup.add(beak);

    // Flippers
    const flipperGeo = new THREE.BoxGeometry(0.08, 0.45, 0.2);
    flipperGeo.translate(0, -0.2, 0);
    const leftArm = new THREE.Mesh(flipperGeo, materials.penguinNavy);
    leftArm.position.set(0.38, 0.45, 0);
    leftArm.rotation.z = -0.2;
    const rightArm = new THREE.Mesh(flipperGeo, materials.penguinNavy);
    rightArm.position.set(-0.38, 0.45, 0);
    rightArm.rotation.z = 0.2;
    bodyGroup.add(leftArm, rightArm);
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;

  } else if (animalType === 'otter') {
    // Little round ears
    const earGeo = new THREE.SphereGeometry(0.11, 5, 5);
    const leftEar = new THREE.Mesh(earGeo, materials.otterWarm);
    leftEar.position.set(0.35, 0.35, 0);
    const rightEar = new THREE.Mesh(earGeo, materials.otterWarm);
    rightEar.position.set(-0.35, 0.35, 0);
    headGroup.add(leftEar, rightEar);

    // Cute snout with whiskers
    const snoutGeo = new THREE.SphereGeometry(0.2, 6, 6);
    snoutGeo.scale(1.3, 0.85, 1);
    snoutGeo.translate(0, -0.1, 0.46);
    const snout = new THREE.Mesh(snoutGeo, materials.otterChest);
    headGroup.add(snout);

    // Swimming tail
    const tailGeo = new THREE.CylinderGeometry(0.14, 0.05, 0.65, 6);
    tailGeo.rotateX(-Math.PI / 3);
    tailGeo.translate(0, 0.15, -0.38);
    const tail = new THREE.Mesh(tailGeo, materials.otterWarm);
    bodyGroup.add(tail);
    root.userData.tail = tail;
  }

  // Cute Little Arms
  if (animalType !== 'penguin') {
    const armGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.38, 6);
    armGeo.translate(0, -0.18, 0);

    const leftArm = new THREE.Mesh(armGeo, mainMat);
    leftArm.position.set(0.36, 0.5, 0);
    const rightArm = new THREE.Mesh(armGeo, mainMat);
    rightArm.position.set(-0.36, 0.5, 0);
    bodyGroup.add(leftArm, rightArm);
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
  }

  // Short Cute Feet
  const footMat = animalType === 'penguin' ? materials.penguinYellow : mainMat;
  const footGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.25, 6);
  footGeo.translate(0, -0.12, 0.05);

  const leftLeg = new THREE.Mesh(footGeo, footMat);
  leftLeg.position.set(0.18, 0.05, 0);
  const rightLeg = new THREE.Mesh(footGeo, footMat);
  rightLeg.position.set(-0.18, 0.05, 0);
  bodyGroup.add(leftLeg, rightLeg);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;

  // Contact Shadow Disk
  const shadowGeo = new THREE.CircleGeometry(0.48, 16);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x040d1a, transparent: true, opacity: 0.45 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.01;
  root.add(shadow);

  return root;
}

/**
 * Curved Low-Poly Palm Tree
 */
export function createPalmTree(height: number = 5.5): THREE.Group {
  const tree = new THREE.Group();

  // Segmented curved trunk
  const trunkSegments = 5;
  const segHeight = height / trunkSegments;
  let currentY = 0;
  let currentCurve = 0;

  for (let i = 0; i < trunkSegments; i++) {
    const rTop = 0.28 - (i * 0.03);
    const rBot = 0.35 - (i * 0.03);
    const segGeo = new THREE.CylinderGeometry(rTop, rBot, segHeight, 6);
    segGeo.translate(0, segHeight / 2, 0);

    const seg = new THREE.Mesh(segGeo, materials.palmTrunk);
    seg.position.set(currentCurve, currentY, 0);
    seg.rotation.z = -0.06 * (i + 1);
    seg.castShadow = true;
    tree.add(seg);

    currentY += segHeight * 0.95;
    currentCurve += 0.22;
  }

  // Palm Crown Fronds (6 leaves fanning out)
  const crownGroup = new THREE.Group();
  crownGroup.position.set(currentCurve, currentY, 0);

  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const frondGeo = new THREE.ConeGeometry(0.45, 2.8, 4);
    frondGeo.scale(0.3, 1, 1);
    frondGeo.rotateX(Math.PI / 2.5);
    frondGeo.translate(0, 0, 1.2);

    const frond = new THREE.Mesh(frondGeo, materials.palmLeaves);
    frond.rotation.y = angle;
    frond.rotation.z = 0.25;
    frond.castShadow = true;
    crownGroup.add(frond);
  }

  tree.add(crownGroup);
  return tree;
}

/**
 * Cozy Coastline Lantern on Wooden Post
 */
export function createLantern(): THREE.Group {
  const group = new THREE.Group();

  const postGeo = new THREE.CylinderGeometry(0.06, 0.08, 1.8, 5);
  postGeo.translate(0, 0.9, 0);
  const post = new THREE.Mesh(postGeo, materials.lanternWood);
  post.castShadow = true;
  group.add(post);

  // Lantern Housing
  const houseGeo = new THREE.BoxGeometry(0.3, 0.38, 0.3);
  houseGeo.translate(0, 1.8, 0);
  const house = new THREE.Mesh(houseGeo, materials.lanternGlow);
  group.add(house);

  const lanternLight = new THREE.PointLight(0xfef08a, 1.5, 6);
  lanternLight.position.set(0, 1.8, 0);
  group.add(lanternLight);

  return group;
}

/**
 * Campfire with Rising Embers & Organic Light Flickering
 */
export function createCampfire(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isCampfire: true };

  // Ring of 8 stones
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const stoneGeo = new THREE.DodecahedronGeometry(0.22 + Math.random() * 0.06);
    const stone = new THREE.Mesh(stoneGeo, materials.rockCliff);
    stone.position.set(Math.cos(angle) * 0.75, 0.12, Math.sin(angle) * 0.75);
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(stone);
  }

  // Crossed charcoal logs
  for (let i = 0; i < 4; i++) {
    const logGeo = new THREE.CylinderGeometry(0.09, 0.09, 1.0, 6);
    logGeo.rotateZ(Math.PI / 4.2);
    logGeo.rotateY((i * Math.PI) / 2);
    const log = new THREE.Mesh(logGeo, materials.woodChar);
    log.position.y = 0.16;
    group.add(log);
  }

  // Flame cones
  const flameGroup = new THREE.Group();
  flameGroup.name = 'flames';

  const innerFlameGeo = new THREE.ConeGeometry(0.22, 0.7, 6);
  innerFlameGeo.translate(0, 0.35, 0);
  const innerFlame = new THREE.Mesh(innerFlameGeo, materials.flameBright);

  const outerFlameGeo = new THREE.ConeGeometry(0.4, 0.95, 6);
  outerFlameGeo.translate(0, 0.45, 0);
  const outerFlame = new THREE.Mesh(outerFlameGeo, materials.flameOrange);

  flameGroup.add(outerFlame, innerFlame);
  group.add(flameGroup);

  // Warm Campfire Point Light with flicker hook
  const fireLight = new THREE.PointLight(0xf97316, 3.2, 12);
  fireLight.position.y = 0.8;
  fireLight.name = 'fireLight';
  group.add(fireLight);

  // Rising Sparks & Embers (Points)
  const emberCount = 60;
  const emberGeo = new THREE.BufferGeometry();
  const emberPos = new Float32Array(emberCount * 3);
  const emberVel = new Float32Array(emberCount * 3);

  for (let i = 0; i < emberCount; i++) {
    emberPos[i * 3]     = (Math.random() - 0.5) * 0.4;
    emberPos[i * 3 + 1] = 0.3 + Math.random() * 2.5;
    emberPos[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

    emberVel[i * 3]     = (Math.random() - 0.5) * 0.2;
    emberVel[i * 3 + 1] = 0.8 + Math.random() * 0.8; // Upward speed
    emberVel[i * 3 + 2] = (Math.random() - 0.5) * 0.2;
  }

  emberGeo.setAttribute('position', new THREE.BufferAttribute(emberPos, 3));
  emberGeo.setAttribute('velocity', new THREE.BufferAttribute(emberVel, 3));

  const emberMat = new THREE.PointsMaterial({
    color: 0xfbbf24,
    size: 3.5,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: false,
  });

  const embers = new THREE.Points(emberGeo, emberMat);
  embers.name = 'embers';
  group.add(embers);

  return group;
}

/**
 * Procedural debris items with floating halos
 */
export function createDebrisItem(itemType: string): THREE.Group {
  const group = new THREE.Group();
  group.userData = { itemType, bobOffset: Math.random() * Math.PI * 2 };

  // Glowing beacon ring
  const ringGeo = new THREE.RingGeometry(0.4, 0.6, 16);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.7,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.05;
  group.add(ring);

  if (itemType.includes('bag') || itemType.includes('pe')) {
    const bagGeo = new THREE.DodecahedronGeometry(0.35, 1);
    bagGeo.scale(1.2, 0.6, 1.0);
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
      flatShading: true,
    });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.y = 0.3;
    group.add(bag);

  } else if (itemType.includes('bottle') || itemType.includes('pet')) {
    const bottleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      transparent: true,
      opacity: 0.75,
      flatShading: true,
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.rotation.z = Math.PI / 3;
    bottle.position.y = 0.25;

    const capGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb, flatShading: true });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0.16, 0.28, 0);
    group.add(bottle, cap);

  } else if (itemType.includes('cap') || itemType.includes('pp')) {
    const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, flatShading: true });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.2;
    group.add(cap);

  } else if (itemType.includes('buoy') || itemType.includes('ps')) {
    const buoyGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9, flatShading: true });
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.y = 0.3;
    group.add(buoy);

  } else if (itemType.includes('micro') || itemType.includes('pellet') || itemType.includes('fiber')) {
    for (let i = 0; i < 5; i++) {
      const bitGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
      const bitMat = new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xf43f5e : 0xfbbf24 });
      const bit = new THREE.Mesh(bitGeo, bitMat);
      bit.position.set((Math.random() - 0.5) * 0.3, 0.15 + Math.random() * 0.2, (Math.random() - 0.5) * 0.3);
      group.add(bit);
    }

  } else if (itemType.includes('net')) {
    const netGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const torusGeo = new THREE.TorusGeometry(0.25, 0.04, 6, 12);
      const netMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8, flatShading: true });
      const torus = new THREE.Mesh(torusGeo, netMat);
      torus.rotation.set(i * 0.7, i * 0.9, i * 0.4);
      torus.position.y = 0.25;
      netGroup.add(torus);
    }
    group.add(netGroup);

  } else {
    const defGeo = new THREE.DodecahedronGeometry(0.25);
    const defMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5, flatShading: true });
    const def = new THREE.Mesh(defGeo, defMat);
    def.position.y = 0.25;
    group.add(def);
  }

  // Floating sparkle star on top
  const starGeo = new THREE.OctahedronGeometry(0.12);
  const star = new THREE.Mesh(starGeo, materials.goldStar);
  star.position.y = 0.75;
  group.add(star);

  return group;
}

/**
 * Sea Turtle with Net for Stage 3
 */
export function createSeaTurtle(entangled: boolean = true): THREE.Group {
  const root = new THREE.Group();
  root.userData = { isEntangled: entangled, flipperCycle: 0 };

  const shellGeo = new THREE.SphereGeometry(0.65, 8, 6);
  shellGeo.scale(1.2, 0.45, 1.4);
  const shell = new THREE.Mesh(shellGeo, materials.turtleShell);
  shell.castShadow = true;
  root.add(shell);

  const bellyGeo = new THREE.SphereGeometry(0.6, 8, 6);
  bellyGeo.scale(1.15, 0.35, 1.35);
  bellyGeo.translate(0, -0.08, 0);
  const belly = new THREE.Mesh(bellyGeo, materials.turtleSkin);
  root.add(belly);

  const headGeo = new THREE.SphereGeometry(0.24, 6, 6);
  headGeo.scale(1, 0.8, 1.3);
  headGeo.translate(0, 0.05, 0.9);
  const head = new THREE.Mesh(headGeo, materials.turtleSkin);
  root.add(head);

  // Flippers
  const flipperGeo = new THREE.ConeGeometry(0.28, 0.85, 5);
  flipperGeo.scale(0.3, 1, 1);
  flipperGeo.rotateX(Math.PI / 2);

  const lf = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  lf.position.set(0.7, 0, 0.4);
  lf.rotation.z = -Math.PI / 4;

  const rf = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  rf.position.set(-0.7, 0, 0.4);
  rf.rotation.z = Math.PI / 4;

  root.add(lf, rf);
  root.userData.lf = lf;
  root.userData.rf = rf;

  if (entangled) {
    const netGroup = new THREE.Group();
    netGroup.name = 'ghostNetMesh';
    for (let i = 0; i < 6; i++) {
      const ringGeo = new THREE.TorusGeometry(0.45 + i * 0.05, 0.04, 5, 10);
      const netMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.9, wireframe: true });
      const ring = new THREE.Mesh(ringGeo, netMat);
      ring.position.set(0, 0.05 * i, 0.2 - 0.1 * i);
      ring.rotation.x = Math.PI / 3 + i * 0.2;
      netGroup.add(ring);
    }
    root.add(netGroup);
  }

  return root;
}

/**
 * Science Signpost
 */
export function createScienceSignpost(stageName: string = '밀도 탐사대'): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isSignpost: true };

  const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.5, 6);
  postGeo.translate(0, 0.75, 0);
  const post = new THREE.Mesh(postGeo, materials.palmTrunk);
  post.castShadow = true;
  group.add(post);

  const boardGeo = new THREE.BoxGeometry(0.95, 0.65, 0.08);
  boardGeo.translate(0, 1.35, 0.05);
  const board = new THREE.Mesh(boardGeo, materials.lanternWood);
  board.castShadow = true;
  group.add(board);

  const emblemGeo = new THREE.TorusGeometry(0.14, 0.035, 6, 12);
  emblemGeo.translate(0, 1.35, 0.1);
  const emblemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  group.add(emblem);

  const promptRingGeo = new THREE.RingGeometry(0.85, 0.95, 16);
  promptRingGeo.rotateX(-Math.PI / 2);
  const promptMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
  const prompt = new THREE.Mesh(promptRingGeo, promptMat);
  prompt.position.y = 0.02;
  group.add(prompt);

  return group;
}

/**
 * 3D Island Billboard
 */
export function createIslandBillboard(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isBillboard: true };

  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8);
  poleGeo.translate(0, 1.9, 0);

  const leftPole = new THREE.Mesh(poleGeo, materials.screenFrame);
  leftPole.position.x = -1.9;
  const rightPole = new THREE.Mesh(poleGeo, materials.screenFrame);
  rightPole.position.x = 1.9;
  group.add(leftPole, rightPole);

  const frameGeo = new THREE.BoxGeometry(4.3, 2.6, 0.2);
  frameGeo.translate(0, 2.8, 0);
  const frame = new THREE.Mesh(frameGeo, materials.screenFrame);
  group.add(frame);

  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#061124';
  ctx.fillRect(0, 0, 1024, 512);

  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 14;
  ctx.strokeRect(16, 16, 992, 480);

  ctx.fillStyle = '#67e8f9';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐ 별빛 바다 지킴이 실시간 전광판 ⭐', 512, 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '26px sans-serif';
  ctx.fillText('과학으로 되살리는 바다 • 우리 반 공동체', 512, 120);

  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.lineTo(984, 140);
  ctx.stroke();

  ctx.fillStyle = '#0f2942';
  ctx.fillRect(60, 160, 420, 140);
  ctx.fillRect(544, 160, 420, 140);

  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('🌊 누적 수거 쓰레기', 270, 205);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('342 개', 270, 275);

  ctx.fillStyle = '#34d399';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('🌱 환경 실천 서약', 754, 205);
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('78 명', 754, 275);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('🏆 명예의 전당 Top 5 (실시간)', 70, 350);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '24px sans-serif';
  ctx.fillText('1위 푸른바다수달 (3,840점)   2위 별빛돌고래 (3,720점)', 70, 395);
  ctx.fillText('3위 산호박사곰 (3,650점)     4위 바다거북친구 (3,510점)', 70, 435);
  ctx.fillText('5위 오로라펭귄 (3,480점)     ★ 반 코드: STAR01', 70, 475);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const screenMat = new THREE.MeshBasicMaterial({ map: texture });
  const screenGeo = new THREE.PlaneGeometry(4.0, 2.3);
  screenGeo.translate(0, 2.8, 0.11);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  group.add(screen);

  return group;
}

/**
 * Lighthouse with Rotating Beacon
 */
export function createLighthouse(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isLighthouse: true };

  const baseGeo = new THREE.CylinderGeometry(1.5, 2.0, 1.0, 8);
  const base = new THREE.Mesh(baseGeo, materials.rockCliff);
  base.position.y = 0.5;
  group.add(base);

  const h = 5.0;
  const towerGeo = new THREE.CylinderGeometry(0.75, 1.3, h, 8);
  towerGeo.translate(0, 1.0 + h / 2, 0);
  const tower = new THREE.Mesh(towerGeo, materials.lighthouseWhite);
  tower.castShadow = true;
  group.add(tower);

  const stripeGeo = new THREE.CylinderGeometry(0.95, 1.1, 1.0, 8);
  stripeGeo.translate(0, 3.2, 0);
  const stripe = new THREE.Mesh(stripeGeo, materials.lighthouseRed);
  group.add(stripe);

  const lanternRoomGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.9, 8);
  lanternRoomGeo.translate(0, 1.0 + h + 0.45, 0);
  const lanternRoom = new THREE.Mesh(lanternRoomGeo, materials.lanternGlow);
  group.add(lanternRoom);

  const beaconHead = new THREE.Group();
  beaconHead.name = 'beaconHead';
  beaconHead.position.set(0, 1.0 + h + 0.45, 0);

  const beamGeo = new THREE.ConeGeometry(3.5, 22, 14, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, 11);
  const beam = new THREE.Mesh(beamGeo, materials.beaconBeam);
  beaconHead.add(beam);

  const spot = new THREE.SpotLight(0xfef08a, 4, 35, Math.PI / 6, 0.5);
  spot.position.set(0, 0, 0);
  spot.target.position.set(0, 0, 18);
  beaconHead.add(spot);
  beaconHead.add(spot.target);

  group.add(beaconHead);
  return group;
}

/**
 * Leaping Dolphins for Ending
 */
export function createDolphin(): THREE.Group {
  const group = new THREE.Group();

  const bodyGeo = new THREE.CylinderGeometry(0.28, 0.06, 2.4, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, materials.dolphinSleek);
  group.add(body);

  const snoutGeo = new THREE.ConeGeometry(0.14, 0.55, 6);
  snoutGeo.rotateX(Math.PI / 2);
  snoutGeo.translate(0, -0.05, 1.4);
  const snout = new THREE.Mesh(snoutGeo, materials.dolphinSleek);
  group.add(snout);

  const finGeo = new THREE.ConeGeometry(0.16, 0.5, 4);
  finGeo.rotateZ(-Math.PI / 6);
  finGeo.translate(0, 0.38, 0);
  const fin = new THREE.Mesh(finGeo, materials.dolphinSleek);
  group.add(fin);

  const flukeGeo = new THREE.BoxGeometry(0.65, 0.04, 0.28);
  const fluke = new THREE.Mesh(flukeGeo, materials.dolphinSleek);
  fluke.position.set(0, 0, -1.2);
  group.add(fluke);

  return group;
}

/**
 * Low-poly tropical fish school
 */
export function createFishSchool(count: number = 8): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const fish = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.16, 0.55, 4);
    bodyGeo.scale(0.3, 1, 1);
    bodyGeo.rotateX(Math.PI / 2);
    const mat = i % 2 === 0 ? materials.fishBlue : materials.fishOrange;
    const body = new THREE.Mesh(bodyGeo, mat);

    const tailGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, -0.28,
      0, 0.16, -0.45,
      0, -0.16, -0.45
    ]);
    tailGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const tail = new THREE.Mesh(tailGeo, mat);

    fish.add(body, tail);
    fish.position.set(
      (Math.random() - 0.5) * 3.5,
      (Math.random() - 0.5) * 1.8,
      (Math.random() - 0.5) * 3.5
    );
    fish.userData = { speed: 0.9 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
    group.add(fish);
  }
  return group;
}

/**
 * Branching Coral Mesh
 */
export function createCoralBranch(colorType: 'bleached' | 'recovering' = 'recovering'): THREE.Group {
  const group = new THREE.Group();
  const mat = colorType === 'bleached' ? materials.coralBleached : materials.coralPink;

  for (let i = 0; i < 5; i++) {
    const branchGeo = new THREE.CylinderGeometry(0.05, 0.09, 0.65, 5);
    const branch = new THREE.Mesh(branchGeo, mat);
    const angle = (i / 5) * Math.PI * 2;
    branch.position.set(Math.cos(angle) * 0.16, 0.32, Math.sin(angle) * 0.16);
    branch.rotation.z = Math.sin(angle) * 0.35;
    branch.rotation.x = Math.cos(angle) * 0.35;
    group.add(branch);
  }
  return group;
}
