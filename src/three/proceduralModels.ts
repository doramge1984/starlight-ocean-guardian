/**
 * Procedural Low-Poly 3D Models for Starlight Ocean Guardian
 * 100% code-generated THREE.Group meshes (zero external 3D models or textures).
 */
import * as THREE from 'three';

// Shared reusable materials
const materials = {
  // Avatars
  rabbitFur: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.8 }),
  rabbitEarInner: new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.9 }),
  foxFur: new THREE.MeshStandardMaterial({ color: 0xe06c28, roughness: 0.75 }),
  foxWhite: new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.8 }),
  foxDark: new THREE.MeshStandardMaterial({ color: 0x331e13, roughness: 0.9 }),
  bearFur: new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.85 }),
  bearSnout: new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }),
  penguinBlack: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }),
  penguinBelly: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7 }),
  penguinBeak: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.5 }),
  otterFur: new THREE.MeshStandardMaterial({ color: 0x854d0e, roughness: 0.8 }),
  otterChest: new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.85 }),
  eyes: new THREE.MeshBasicMaterial({ color: 0x0f172a }),
  glowEyes: new THREE.MeshBasicMaterial({ color: 0x38bdf8 }),

  // Nature & Props
  woodTrunk: new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.9 }),
  woodPlank: new THREE.MeshStandardMaterial({ color: 0x8b5a2b, roughness: 0.8 }),
  rockDark: new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.9 }),
  rockSand: new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.95 }),
  sandGround: new THREE.MeshStandardMaterial({ color: 0xe2ba84, roughness: 0.9 }),
  greenGrass: new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),

  // Corals (Recovering / Bleached)
  coralBleached: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 }),
  coralPink: new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.6, emissive: 0x881337, emissiveIntensity: 0.2 }),
  coralCyan: new THREE.MeshStandardMaterial({ color: 0x06b6d4, roughness: 0.5, emissive: 0x083344, emissiveIntensity: 0.3 }),
  coralPurple: new THREE.MeshStandardMaterial({ color: 0xa855f7, roughness: 0.6, emissive: 0x3b0764, emissiveIntensity: 0.2 }),

  // Creatures
  turtleShell: new THREE.MeshStandardMaterial({ color: 0x1e3a2f, roughness: 0.7 }),
  turtleSkin: new THREE.MeshStandardMaterial({ color: 0x34d399, roughness: 0.6 }),
  fishBlue: new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.4, emissive: 0x0284c7, emissiveIntensity: 0.3 }),
  fishOrange: new THREE.MeshStandardMaterial({ color: 0xfb923c, roughness: 0.4, emissive: 0xea580c, emissiveIntensity: 0.2 }),
  dolphinGrey: new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.3, metalness: 0.1 }),

  // Beacon & Tech
  beaconTower: new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
  beaconStripe: new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.5 }),
  lampGlass: new THREE.MeshStandardMaterial({ color: 0xfef08a, emissive: 0xfef08a, emissiveIntensity: 0.9, transparent: true, opacity: 0.8 }),
  screenFrame: new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.5 }),
  goldStar: new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xd97706, emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.2 }),
};

export interface AnimatedAvatarGroup extends THREE.Group {
  userData: {
    avatarType: string;
    leftLeg?: THREE.Mesh;
    rightLeg?: THREE.Mesh;
    leftArm?: THREE.Mesh;
    rightArm?: THREE.Mesh;
    head?: THREE.Group;
    ears?: THREE.Group;
    tail?: THREE.Mesh;
    walkCycle: number;
    isMoving: boolean;
    isEmoting: boolean;
    emoteType?: string;
  };
}

/**
 * Creates 1 of 5 low-poly procedural animal avatars
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

  // Common torso
  const torsoGeo = new THREE.CylinderGeometry(0.35, 0.42, 0.8, 8);
  torsoGeo.translate(0, 0.4, 0);

  let torsoMat = materials.rabbitFur;
  if (animalType === 'fox') torsoMat = materials.foxFur;
  if (animalType === 'bear') torsoMat = materials.bearFur;
  if (animalType === 'penguin') torsoMat = materials.penguinBlack;
  if (animalType === 'otter') torsoMat = materials.otterFur;

  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.castShadow = true;
  torso.receiveShadow = true;
  bodyGroup.add(torso);

  // Belly patch
  let bellyMat = materials.rabbitFur;
  if (animalType === 'fox') bellyMat = materials.foxWhite;
  if (animalType === 'bear') bellyMat = materials.bearSnout;
  if (animalType === 'penguin') bellyMat = materials.penguinBelly;
  if (animalType === 'otter') bellyMat = materials.otterChest;

  const bellyGeo = new THREE.CylinderGeometry(0.25, 0.32, 0.65, 8, 1, false, 0, Math.PI);
  bellyGeo.translate(0, 0.4, 0.15);
  const belly = new THREE.Mesh(bellyGeo, bellyMat);
  bodyGroup.add(belly);

  // Head group
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.85, 0);
  root.userData.head = headGroup;
  bodyGroup.add(headGroup);

  const headGeo = new THREE.SphereGeometry(0.4, 8, 7);
  const headMesh = new THREE.Mesh(headGeo, torsoMat);
  headMesh.castShadow = true;
  headGroup.add(headMesh);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.06, 6, 6);
  const leftEye = new THREE.Mesh(eyeGeo, materials.eyes);
  leftEye.position.set(0.15, 0.08, 0.35);
  const rightEye = new THREE.Mesh(eyeGeo, materials.eyes);
  rightEye.position.set(-0.15, 0.08, 0.35);
  headGroup.add(leftEye, rightEye);

  // Unique Animal Features
  if (animalType === 'rabbit') {
    // Long ears
    const earGroup = new THREE.Group();
    const earGeo = new THREE.ConeGeometry(0.12, 0.7, 6);
    earGeo.translate(0, 0.35, 0);

    const leftEar = new THREE.Mesh(earGeo, materials.rabbitFur);
    leftEar.position.set(0.18, 0.35, 0);
    leftEar.rotation.z = -0.15;
    leftEar.rotation.x = -0.1;

    const rightEar = new THREE.Mesh(earGeo, materials.rabbitFur);
    rightEar.position.set(-0.18, 0.35, 0);
    rightEar.rotation.z = 0.15;
    rightEar.rotation.x = -0.1;

    // Pink ear inner
    const earInnerGeo = new THREE.ConeGeometry(0.07, 0.5, 6);
    earInnerGeo.translate(0, 0.25, 0.04);
    const leftInner = new THREE.Mesh(earInnerGeo, materials.rabbitEarInner);
    leftEar.add(leftInner);
    const rightInner = new THREE.Mesh(earInnerGeo, materials.rabbitEarInner);
    rightEar.add(rightInner);

    earGroup.add(leftEar, rightEar);
    headGroup.add(earGroup);
    root.userData.ears = earGroup;

    // Small cute tail
    const tailGeo = new THREE.SphereGeometry(0.12, 6, 6);
    const tail = new THREE.Mesh(tailGeo, materials.rabbitFur);
    tail.position.set(0, 0.2, -0.42);
    bodyGroup.add(tail);
    root.userData.tail = tail;

  } else if (animalType === 'fox') {
    // Fox snout & ears
    const snoutGeo = new THREE.ConeGeometry(0.18, 0.35, 6);
    snoutGeo.rotateX(Math.PI / 2);
    snoutGeo.translate(0, -0.05, 0.4);
    const snout = new THREE.Mesh(snoutGeo, materials.foxWhite);
    headGroup.add(snout);

    const noseGeo = new THREE.SphereGeometry(0.05, 5, 5);
    const nose = new THREE.Mesh(noseGeo, materials.foxDark);
    nose.position.set(0, -0.05, 0.58);
    headGroup.add(nose);

    // Pointed ears
    const earGeo = new THREE.ConeGeometry(0.14, 0.35, 5);
    earGeo.translate(0, 0.18, 0);
    const leftEar = new THREE.Mesh(earGeo, materials.foxFur);
    leftEar.position.set(0.22, 0.32, 0);
    leftEar.rotation.z = -0.3;
    const rightEar = new THREE.Mesh(earGeo, materials.foxFur);
    rightEar.position.set(-0.22, 0.32, 0);
    rightEar.rotation.z = 0.3;
    headGroup.add(leftEar, rightEar);

    // Big bushy tail
    const tailGeo = new THREE.ConeGeometry(0.2, 0.7, 6);
    tailGeo.rotateX(-Math.PI / 3);
    tailGeo.translate(0, 0.3, -0.35);
    const tail = new THREE.Mesh(tailGeo, materials.foxFur);
    bodyGroup.add(tail);
    root.userData.tail = tail;

  } else if (animalType === 'bear') {
    // Round ears
    const earGeo = new THREE.SphereGeometry(0.14, 6, 6);
    const leftEar = new THREE.Mesh(earGeo, materials.bearFur);
    leftEar.position.set(0.3, 0.32, 0);
    const rightEar = new THREE.Mesh(earGeo, materials.bearFur);
    rightEar.position.set(-0.3, 0.32, 0);
    headGroup.add(leftEar, rightEar);

    // Broad snout
    const snoutGeo = new THREE.CylinderGeometry(0.16, 0.2, 0.2, 6);
    snoutGeo.rotateX(Math.PI / 2);
    snoutGeo.translate(0, -0.08, 0.38);
    const snout = new THREE.Mesh(snoutGeo, materials.bearSnout);
    headGroup.add(snout);

  } else if (animalType === 'penguin') {
    // Orange beak
    const beakGeo = new THREE.ConeGeometry(0.1, 0.3, 5);
    beakGeo.rotateX(Math.PI / 2);
    beakGeo.translate(0, -0.05, 0.42);
    const beak = new THREE.Mesh(beakGeo, materials.penguinBeak);
    headGroup.add(beak);

    // Flippers
    const flipperGeo = new THREE.BoxGeometry(0.08, 0.55, 0.25);
    flipperGeo.translate(0, -0.25, 0);
    const leftArm = new THREE.Mesh(flipperGeo, materials.penguinBlack);
    leftArm.position.set(0.42, 0.65, 0);
    leftArm.rotation.z = -0.2;
    const rightArm = new THREE.Mesh(flipperGeo, materials.penguinBlack);
    rightArm.position.set(-0.42, 0.65, 0);
    rightArm.rotation.z = 0.2;
    bodyGroup.add(leftArm, rightArm);
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;

  } else if (animalType === 'otter') {
    // Little round ears
    const earGeo = new THREE.SphereGeometry(0.09, 5, 5);
    const leftEar = new THREE.Mesh(earGeo, materials.otterFur);
    leftEar.position.set(0.28, 0.25, 0);
    const rightEar = new THREE.Mesh(earGeo, materials.otterFur);
    rightEar.position.set(-0.28, 0.25, 0);
    headGroup.add(leftEar, rightEar);

    // Whiskers snout
    const snoutGeo = new THREE.SphereGeometry(0.18, 6, 6);
    snoutGeo.scale(1.2, 0.8, 1);
    snoutGeo.translate(0, -0.1, 0.35);
    const snout = new THREE.Mesh(snoutGeo, materials.otterChest);
    headGroup.add(snout);

    // Long swimmer tail
    const tailGeo = new THREE.CylinderGeometry(0.12, 0.04, 0.7, 6);
    tailGeo.rotateX(-Math.PI / 3);
    tailGeo.translate(0, 0.15, -0.4);
    const tail = new THREE.Mesh(tailGeo, materials.otterFur);
    bodyGroup.add(tail);
    root.userData.tail = tail;
  }

  // Limbs (Arms & Legs) if not penguin flippers
  if (animalType !== 'penguin') {
    const limbGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.45, 6);
    limbGeo.translate(0, -0.22, 0);

    const leftArm = new THREE.Mesh(limbGeo, torsoMat);
    leftArm.position.set(0.4, 0.7, 0);
    const rightArm = new THREE.Mesh(limbGeo, torsoMat);
    rightArm.position.set(-0.4, 0.7, 0);
    bodyGroup.add(leftArm, rightArm);
    root.userData.leftArm = leftArm;
    root.userData.rightArm = rightArm;
  }

  // Legs / Feet
  const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.35, 6);
  legGeo.translate(0, -0.18, 0);
  const leftLeg = new THREE.Mesh(legGeo, animalType === 'penguin' ? materials.penguinBeak : torsoMat);
  leftLeg.position.set(0.2, 0.1, 0);
  const rightLeg = new THREE.Mesh(legGeo, animalType === 'penguin' ? materials.penguinBeak : torsoMat);
  rightLeg.position.set(-0.2, 0.1, 0);
  bodyGroup.add(leftLeg, rightLeg);
  root.userData.leftLeg = leftLeg;
  root.userData.rightLeg = rightLeg;

  // Contact shadow disk
  const shadowGeo = new THREE.CircleGeometry(0.45, 12);
  shadowGeo.rotateX(-Math.PI / 2);
  const shadowMat = new THREE.MeshBasicMaterial({ color: 0x091428, transparent: true, opacity: 0.35 });
  const shadow = new THREE.Mesh(shadowGeo, shadowMat);
  shadow.position.y = 0.01;
  root.add(shadow);

  return root;
}

/**
 * Procedural debris items for 3D exploration
 */
export function createDebrisItem(itemType: string): THREE.Group {
  const group = new THREE.Group();
  group.userData = { itemType, bobOffset: Math.random() * Math.PI * 2 };

  // Floating highlight beacon ring
  const ringGeo = new THREE.RingGeometry(0.4, 0.55, 12);
  ringGeo.rotateX(-Math.PI / 2);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.position.y = 0.05;
  group.add(ring);

  if (itemType.includes('bag') || itemType.includes('pe')) {
    // Crinkled plastic bag
    const bagGeo = new THREE.DodecahedronGeometry(0.35, 1);
    bagGeo.scale(1.2, 0.6, 1.0);
    const bagMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      roughness: 0.2,
      metalness: 0.1,
      transparent: true,
      opacity: 0.75
    });
    const bag = new THREE.Mesh(bagGeo, bagMat);
    bag.position.y = 0.3;
    group.add(bag);

  } else if (itemType.includes('bottle') || itemType.includes('pet')) {
    // Clear PET bottle
    const bottleGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.5, 8);
    const bottleMat = new THREE.MeshStandardMaterial({
      color: 0x93c5fd,
      roughness: 0.1,
      transparent: true,
      opacity: 0.65
    });
    const bottle = new THREE.Mesh(bottleGeo, bottleMat);
    bottle.rotation.z = Math.PI / 3;
    bottle.position.y = 0.25;

    // Small blue cap
    const capGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.08, 8);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x2563eb });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(0.16, 0.28, 0);
    group.add(bottle, cap);

  } else if (itemType.includes('cap') || itemType.includes('pp')) {
    // Yellow bottle cap
    const capGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 10);
    const capMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3 });
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.y = 0.2;
    group.add(cap);

  } else if (itemType.includes('buoy') || itemType.includes('ps')) {
    // White EPS buoy
    const buoyGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const buoyMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.9 });
    const buoy = new THREE.Mesh(buoyGeo, buoyMat);
    buoy.position.y = 0.3;
    group.add(buoy);

  } else if (itemType.includes('micro') || itemType.includes('pellet') || itemType.includes('fiber')) {
    // Cluster of tiny microplastic fragments with sparkle
    for (let i = 0; i < 5; i++) {
      const bitGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
      const bitMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xf43f5e : 0xfbbf24
      });
      const bit = new THREE.Mesh(bitGeo, bitMat);
      bit.position.set(
        (Math.random() - 0.5) * 0.3,
        0.15 + Math.random() * 0.2,
        (Math.random() - 0.5) * 0.3
      );
      bit.rotation.set(Math.random(), Math.random(), Math.random());
      group.add(bit);
    }

  } else if (itemType.includes('net')) {
    // Tangled ghost net bundle
    const netGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const torusGeo = new THREE.TorusGeometry(0.25, 0.04, 6, 12);
      const netMat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.8 });
      const torus = new THREE.Mesh(torusGeo, netMat);
      torus.rotation.set(i * 0.7, i * 0.9, i * 0.4);
      torus.position.y = 0.25;
      netGroup.add(torus);
    }
    group.add(netGroup);

  } else {
    // Default debris
    const defGeo = new THREE.DodecahedronGeometry(0.25);
    const defMat = new THREE.MeshStandardMaterial({ color: 0xf472b6, roughness: 0.5 });
    const def = new THREE.Mesh(defGeo, defMat);
    def.position.y = 0.25;
    group.add(def);
  }

  // Floating sparkle star on top
  const starGeo = new THREE.OctahedronGeometry(0.12);
  const star = new THREE.Mesh(starGeo, materials.goldStar);
  star.position.y = 0.7;
  group.add(star);

  return group;
}

/**
 * Sea Turtle with entangled net for Stage 3 rescue minigame
 */
export function createSeaTurtle(entangled: boolean = true): THREE.Group {
  const root = new THREE.Group();
  root.userData = { isEntangled: entangled, flipperCycle: 0 };

  // Shell
  const shellGeo = new THREE.SphereGeometry(0.6, 8, 6);
  shellGeo.scale(1.2, 0.45, 1.4);
  const shell = new THREE.Mesh(shellGeo, materials.turtleShell);
  shell.castShadow = true;
  root.add(shell);

  // Underbelly
  const bellyGeo = new THREE.SphereGeometry(0.55, 8, 6);
  bellyGeo.scale(1.15, 0.35, 1.35);
  bellyGeo.translate(0, -0.08, 0);
  const belly = new THREE.Mesh(bellyGeo, materials.turtleSkin);
  root.add(belly);

  // Head
  const headGeo = new THREE.SphereGeometry(0.22, 6, 6);
  headGeo.scale(1, 0.8, 1.3);
  headGeo.translate(0, 0.05, 0.85);
  const head = new THREE.Mesh(headGeo, materials.turtleSkin);
  root.add(head);

  // Flippers (Left Front, Right Front, Left Rear, Right Rear)
  const flipperGeo = new THREE.ConeGeometry(0.25, 0.8, 5);
  flipperGeo.scale(0.3, 1, 1);
  flipperGeo.rotateX(Math.PI / 2);

  const lf = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  lf.position.set(0.65, 0, 0.4);
  lf.rotation.z = -Math.PI / 4;

  const rf = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  rf.position.set(-0.65, 0, 0.4);
  rf.rotation.z = Math.PI / 4;

  const lr = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  lr.scale.set(0.6, 0.6, 0.6);
  lr.position.set(0.45, 0, -0.6);
  lr.rotation.z = -Math.PI / 6;

  const rr = new THREE.Mesh(flipperGeo, materials.turtleSkin);
  rr.scale.set(0.6, 0.6, 0.6);
  rr.position.set(-0.45, 0, -0.6);
  rr.rotation.z = Math.PI / 6;

  root.add(lf, rf, lr, rr);
  root.userData.lf = lf;
  root.userData.rf = rf;

  // Entangling ghost net bundle if entangled
  if (entangled) {
    const netGroup = new THREE.Group();
    netGroup.name = 'ghostNetMesh';
    for (let i = 0; i < 6; i++) {
      const ringGeo = new THREE.TorusGeometry(0.4 + i * 0.05, 0.04, 5, 10);
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
 * Science Signboard for coastline interactive cards (Press E)
 */
export function createScienceSignpost(stageName: string = '밀도 탐사대'): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isSignpost: true };

  // Post
  const postGeo = new THREE.CylinderGeometry(0.08, 0.08, 1.4, 6);
  postGeo.translate(0, 0.7, 0);
  const post = new THREE.Mesh(postGeo, materials.woodTrunk);
  post.castShadow = true;
  group.add(post);

  // Board
  const boardGeo = new THREE.BoxGeometry(0.9, 0.6, 0.08);
  boardGeo.translate(0, 1.25, 0.05);
  const board = new THREE.Mesh(boardGeo, materials.woodPlank);
  board.castShadow = true;
  group.add(board);

  // Glowing question mark / science icon emblem
  const emblemGeo = new THREE.TorusGeometry(0.12, 0.03, 6, 12);
  emblemGeo.translate(0, 1.25, 0.1);
  const emblemMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  const emblem = new THREE.Mesh(emblemGeo, emblemMat);
  group.add(emblem);

  // Ground prompt ring
  const promptRingGeo = new THREE.RingGeometry(0.8, 0.9, 16);
  promptRingGeo.rotateX(-Math.PI / 2);
  const promptMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
  const prompt = new THREE.Mesh(promptRingGeo, promptMat);
  prompt.position.y = 0.02;
  group.add(prompt);

  return group;
}

/**
 * 3D Island Billboard (우리 반 누적 수거 수, 서약 수, TOP 5 전광판)
 */
export function createIslandBillboard(statsText: string = '우리 반 바다 정화 현황'): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isBillboard: true };

  // Sturdy metallic poles
  const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.5, 8);
  poleGeo.translate(0, 1.75, 0);

  const leftPole = new THREE.Mesh(poleGeo, materials.screenFrame);
  leftPole.position.x = -1.8;
  const rightPole = new THREE.Mesh(poleGeo, materials.screenFrame);
  rightPole.position.x = 1.8;
  group.add(leftPole, rightPole);

  // Screen Backing Frame
  const frameGeo = new THREE.BoxGeometry(4.2, 2.5, 0.2);
  frameGeo.translate(0, 2.6, 0);
  const frame = new THREE.Mesh(frameGeo, materials.screenFrame);
  group.add(frame);

  // Canvas Texture Screen with live stats
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // High-contrast clean dark-mode sci-fi display
  ctx.fillStyle = '#09152b';
  ctx.fillRect(0, 0, 1024, 512);

  // Glowing borders
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 12;
  ctx.strokeRect(16, 16, 992, 480);

  // Header
  ctx.fillStyle = '#67e8f9';
  ctx.font = 'bold 44px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⭐ 별빛 바다 지킴이 실시간 전광판 ⭐', 512, 75);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '28px sans-serif';
  ctx.fillText('과학으로 되살리는 바다 • 우리 반 공동체', 512, 120);

  // Horizontal divider
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(40, 140);
  ctx.lineTo(984, 140);
  ctx.stroke();

  // Metrics Boxes
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

  // Top 5 preview
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
  const screenGeo = new THREE.PlaneGeometry(3.9, 2.2);
  screenGeo.translate(0, 2.6, 0.11);
  const screen = new THREE.Mesh(screenGeo, screenMat);
  group.add(screen);

  return group;
}

/**
 * Campfire with glowing flame and embers
 */
export function createCampfire(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isCampfire: true };

  // Ring of stones
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const stoneGeo = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.05);
    const stone = new THREE.Mesh(stoneGeo, materials.rockDark);
    stone.position.set(Math.cos(angle) * 0.7, 0.1, Math.sin(angle) * 0.7);
    stone.rotation.set(Math.random(), Math.random(), Math.random());
    group.add(stone);
  }

  // Cross logs
  for (let i = 0; i < 4; i++) {
    const logGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.9, 6);
    logGeo.rotateZ(Math.PI / 4);
    logGeo.rotateY((i * Math.PI) / 2);
    const log = new THREE.Mesh(logGeo, materials.woodTrunk);
    log.position.y = 0.15;
    group.add(log);
  }

  // Flame cones
  const flameGroup = new THREE.Group();
  flameGroup.name = 'flames';

  const innerFlameGeo = new THREE.ConeGeometry(0.2, 0.6, 6);
  innerFlameGeo.translate(0, 0.3, 0);
  const innerFlameMat = new THREE.MeshBasicMaterial({ color: 0xffedd5 });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);

  const outerFlameGeo = new THREE.ConeGeometry(0.35, 0.8, 6);
  outerFlameGeo.translate(0, 0.4, 0);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xf97316,
    transparent: true,
    opacity: 0.85
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);

  flameGroup.add(outerFlame, innerFlame);
  group.add(flameGroup);

  // Warm campfire light
  const fireLight = new THREE.PointLight(0xf97316, 2.5, 8);
  fireLight.position.y = 0.6;
  group.add(fireLight);

  return group;
}

/**
 * Lighthouse for Stage 5 with rotating warm beacon beam
 */
export function createLighthouse(): THREE.Group {
  const group = new THREE.Group();
  group.userData = { isLighthouse: true };

  // Base rock pedestal
  const baseGeo = new THREE.CylinderGeometry(1.4, 1.8, 0.8, 8);
  const base = new THREE.Mesh(baseGeo, materials.rockDark);
  base.position.y = 0.4;
  group.add(base);

  // White and Red striped tower
  const h = 4.5;
  const towerGeo = new THREE.CylinderGeometry(0.7, 1.2, h, 8);
  towerGeo.translate(0, 0.8 + h / 2, 0);
  const tower = new THREE.Mesh(towerGeo, materials.beaconTower);
  tower.castShadow = true;
  group.add(tower);

  // Red band stripes
  const stripeGeo = new THREE.CylinderGeometry(0.9, 1.0, 0.9, 8);
  stripeGeo.translate(0, 2.6, 0);
  const stripe = new THREE.Mesh(stripeGeo, materials.beaconStripe);
  group.add(stripe);

  // Lantern room
  const lanternRoomGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.8, 8);
  lanternRoomGeo.translate(0, 0.8 + h + 0.4, 0);
  const lanternRoom = new THREE.Mesh(lanternRoomGeo, materials.lampGlass);
  group.add(lanternRoom);

  // Rotating beacon head group
  const beaconHead = new THREE.Group();
  beaconHead.name = 'beaconHead';
  beaconHead.position.set(0, 0.8 + h + 0.4, 0);

  // Volumetric light beam cone
  const beamGeo = new THREE.ConeGeometry(3.0, 18, 12, 1, true);
  beamGeo.rotateX(Math.PI / 2);
  beamGeo.translate(0, 0, 9);
  const beamMat = new THREE.MeshBasicMaterial({
    color: 0xfef08a,
    transparent: true,
    opacity: 0.18,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beaconHead.add(beam);

  // Spot light
  const spot = new THREE.SpotLight(0xfef08a, 4, 30, Math.PI / 6, 0.5);
  spot.position.set(0, 0, 0);
  spot.target.position.set(0, 0, 15);
  beaconHead.add(spot);
  beaconHead.add(spot.target);

  group.add(beaconHead);

  return group;
}

/**
 * Leaping Dolphins for Ending scene
 */
export function createDolphin(): THREE.Group {
  const group = new THREE.Group();

  // Sleek curved body
  const bodyGeo = new THREE.CylinderGeometry(0.25, 0.05, 2.2, 8);
  bodyGeo.rotateX(Math.PI / 2);
  const body = new THREE.Mesh(bodyGeo, materials.dolphinGrey);
  group.add(body);

  // Snout
  const snoutGeo = new THREE.ConeGeometry(0.12, 0.5, 6);
  snoutGeo.rotateX(Math.PI / 2);
  snoutGeo.translate(0, -0.05, 1.3);
  const snout = new THREE.Mesh(snoutGeo, materials.dolphinGrey);
  group.add(snout);

  // Dorsal fin
  const finGeo = new THREE.ConeGeometry(0.15, 0.45, 4);
  finGeo.rotateZ(-Math.PI / 6);
  finGeo.translate(0, 0.35, 0);
  const fin = new THREE.Mesh(finGeo, materials.dolphinGrey);
  group.add(fin);

  // Tail flukes
  const flukeGeo = new THREE.BoxGeometry(0.6, 0.04, 0.25);
  const fluke = new THREE.Mesh(flukeGeo, materials.dolphinGrey);
  fluke.position.set(0, 0, -1.1);
  group.add(fluke);

  return group;
}

/**
 * Low-poly tropical fish school
 */
export function createFishSchool(count: number = 6): THREE.Group {
  const group = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const fish = new THREE.Group();
    const bodyGeo = new THREE.ConeGeometry(0.15, 0.5, 4);
    bodyGeo.scale(0.3, 1, 1);
    bodyGeo.rotateX(Math.PI / 2);
    const mat = i % 2 === 0 ? materials.fishBlue : materials.fishOrange;
    const body = new THREE.Mesh(bodyGeo, mat);

    // Tail fin
    const tailGeo = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      0, 0, -0.25,
      0, 0.15, -0.4,
      0, -0.15, -0.4
    ]);
    tailGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const tail = new THREE.Mesh(tailGeo, mat);

    fish.add(body, tail);
    fish.position.set(
      (Math.random() - 0.5) * 3,
      (Math.random() - 0.5) * 1.5,
      (Math.random() - 0.5) * 3
    );
    fish.userData = { speed: 0.8 + Math.random() * 0.5, offset: Math.random() * Math.PI * 2 };
    group.add(fish);
  }
  return group;
}

/**
 * Branching Coral Mesh (Stage 4 & underwater)
 */
export function createCoralBranch(colorType: 'bleached' | 'recovering' = 'recovering'): THREE.Group {
  const group = new THREE.Group();
  const mat = colorType === 'bleached' ? materials.coralBleached : materials.coralPink;

  for (let i = 0; i < 5; i++) {
    const branchGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.6, 5);
    const branch = new THREE.Mesh(branchGeo, mat);
    const angle = (i / 5) * Math.PI * 2;
    branch.position.set(Math.cos(angle) * 0.15, 0.3, Math.sin(angle) * 0.15);
    branch.rotation.z = Math.sin(angle) * 0.35;
    branch.rotation.x = Math.cos(angle) * 0.35;
    group.add(branch);
  }
  return group;
}
