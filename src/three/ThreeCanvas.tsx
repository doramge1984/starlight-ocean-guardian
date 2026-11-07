import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import {
  createAnimalAvatar,
  createDebrisItem,
  createSeaTurtle,
  createScienceSignpost,
  createIslandBillboard,
  createCampfire,
  createLighthouse,
  createDolphin,
  createFishSchool,
  createCoralBranch,
  createPalmTree,
  createLantern,
  type AnimatedAvatarGroup,
} from './proceduralModels';
import { createAuroraSky, type AuroraSkyController } from './auroraSkyShader';
import { createOceanWater, type OceanWaterController } from './waterShader';
import itemsData from '../data/items.json';
import { soundEngine } from '../audio/soundEngine';

export interface ThreeCanvasProps {
  currentStage: number;
  recoveryRate: number;
  avatarType: string;
  nickname: string;
  isCinematicActive: boolean;
  onCinematicComplete: () => void;
  onPickDebris: (item: any) => void;
  onInteractSignboard: (stageId: number) => void;
  onRescueTurtle: () => void;
  isTurtleRescued: boolean;
  isDawnEnding: boolean;
  graphicsQuality: 'low' | 'medium' | 'high';
  activeEmote: string | null;
  mobileMoveVector: { x: number; y: number };
  isStartScreen?: boolean;
}

// Custom subtle Vignette Shader Pass
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.05 },
    darkness: { value: 1.25 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vig = clamp(dot(uv, uv), 0.0, 1.0);
      gl_FragColor = vec4(texel.rgb * (1.0 - vig * (darkness - 1.0)), texel.a);
    }
  `,
};

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({
  currentStage,
  recoveryRate,
  avatarType,
  nickname,
  isCinematicActive,
  onCinematicComplete,
  onPickDebris,
  onInteractSignboard,
  onRescueTurtle,
  isTurtleRescued,
  isDawnEnding,
  graphicsQuality,
  activeEmote,
  mobileMoveVector,
  isStartScreen = false,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);

  const stateRef = useRef({
    currentStage,
    recoveryRate,
    avatarType,
    nickname,
    isCinematicActive,
    isTurtleRescued,
    isDawnEnding,
    graphicsQuality,
    activeEmote,
    mobileMoveVector,
    isStartScreen,
    onCinematicComplete,
    onPickDebris,
    onInteractSignboard,
    onRescueTurtle,
  });

  useEffect(() => {
    stateRef.current = {
      currentStage,
      recoveryRate,
      avatarType,
      nickname,
      isCinematicActive,
      isTurtleRescued,
      isDawnEnding,
      graphicsQuality,
      activeEmote,
      mobileMoveVector,
      isStartScreen,
      onCinematicComplete,
      onPickDebris,
      onInteractSignboard,
      onRescueTurtle,
    };
  });

  useEffect(() => {
    if (!mountRef.current) return;

    // Detect software WebGL guard
    const isSoftwareGl = (() => {
      try {
        const gl = document.createElement('canvas').getContext('webgl2');
        if (!gl) return true;
        const ext = gl.getExtension('WEBGL_debug_renderer_info');
        const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
        const gpu = String(gl.getParameter(param));
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
      } catch (e) {
        return false;
      }
    })();

    // Scene & Deep Night Fog
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x051329, 0.0125);

    const camera = new THREE.PerspectiveCamera(
      52,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      350
    );

    // Initial Camera looking up at aurora and moon
    camera.position.set(0, 38, 55);
    camera.lookAt(-20, 25, -50);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl && graphicsQuality !== 'low',
      powerPreference: 'high-performance',
      alpha: false,
    });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(
      isSoftwareGl || graphicsQuality === 'low'
        ? 1.0
        : graphicsQuality === 'medium'
        ? Math.min(window.devicePixelRatio, 1.5)
        : Math.min(window.devicePixelRatio, 2.0)
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl && graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Procedural Studio Environment for PBR Reflections
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {}

    // Lighting Rig: Moonlight Key + Cool Sky Fill
    const hemisphereLight = new THREE.HemisphereLight(0x38bdf8, 0x061124, 0.65);
    scene.add(hemisphereLight);

    // Directional Moonlight matching Moon Position (-35, 45, -95)
    const moonDirLight = new THREE.DirectionalLight(0xdbeafe, 1.9);
    moonDirLight.position.set(-35, 45, -95);
    moonDirLight.castShadow = !isSoftwareGl && graphicsQuality !== 'low';
    moonDirLight.shadow.mapSize.width = 1024;
    moonDirLight.shadow.mapSize.height = 1024;
    moonDirLight.shadow.camera.near = 10;
    moonDirLight.shadow.camera.far = 160;
    moonDirLight.shadow.camera.left = -35;
    moonDirLight.shadow.camera.right = 35;
    moonDirLight.shadow.camera.top = 35;
    moonDirLight.shadow.camera.bottom = -35;
    moonDirLight.shadow.bias = -0.0004;
    scene.add(moonDirLight);

    // Post-Processing Composer (EffectComposer + UnrealBloomPass + Vignette + OutputPass)
    let composer: EffectComposer | null = null;
    if (!isSoftwareGl && graphicsQuality !== 'low') {
      try {
        composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        // UnrealBloomPass: dreamy night glow
        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(mountRef.current.clientWidth, mountRef.current.clientHeight),
          graphicsQuality === 'high' ? 1.2 : 0.7, // intensity
          0.75, // radius
          0.55  // threshold
        );
        composer.addPass(bloomPass);

        // Vignette Pass
        const vignettePass = new ShaderPass(VignetteShader);
        composer.addPass(vignettePass);

        const outputPass = new OutputPass();
        composer.addPass(outputPass);
      } catch (err) {
        console.warn('Post-processing init fallback:', err);
        composer = null;
      }
    }

    // Aurora Sky, Stars, Full Moon & Constellations
    const auroraSky: AuroraSkyController = createAuroraSky();
    auroraSky.setQuality(graphicsQuality);
    scene.add(auroraSky.mesh);
    scene.add(auroraSky.stars);
    scene.add(auroraSky.shootingStars);
    scene.add(auroraSky.moonGroup);
    scene.add(auroraSky.constellationGroup);

    // Ocean Water Surface
    const oceanWater: OceanWaterController = createOceanWater();
    oceanWater.setQuality(graphicsQuality);
    scene.add(oceanWater.mesh);

    // Stylized Island Terrain (Low-Poly Beach & Rocks)
    const islandGroup = new THREE.Group();
    const terrainGeo = new THREE.CylinderGeometry(28, 38, 3.8, 36);
    terrainGeo.translate(0, 1.8, 0);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xdec092,
      roughness: 0.9,
      flatShading: true,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, sandMat);
    terrainMesh.receiveShadow = true;
    islandGroup.add(terrainMesh);

    // Rocky outcrops on north cliff
    for (let i = 0; i < 9; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(2.2 + Math.random() * 2.8);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95, flatShading: true });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = (i / 9) * Math.PI - Math.PI / 2;
      rock.position.set(Math.cos(angle) * 26, 2.5 + Math.random() * 2, Math.sin(angle) * 26);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      islandGroup.add(rock);
    }

    // Curved Palm Trees
    const palmPositions = [
      { x: -16, z: 8, rot: 0.4 },
      { x: -14, z: 15, rot: -0.2 },
      { x: 18, z: 6, rot: 1.1 },
      { x: 12, z: -18, rot: -1.3 },
      { x: -18, z: -12, rot: 2.2 },
    ];
    palmPositions.forEach(p => {
      const palm = createPalmTree(5.5 + Math.random());
      palm.position.set(p.x, 3.6, p.z);
      palm.rotation.y = p.rot;
      islandGroup.add(palm);
    });

    // Cozy Coastline Lanterns
    const lanternPositions = [
      { x: 5, z: 15 },
      { x: -6, z: 16 },
      { x: 15, z: 12 },
      { x: -14, z: 0 },
    ];
    lanternPositions.forEach(lp => {
      const lantern = createLantern();
      lantern.position.set(lp.x, 3.6, lp.z);
      islandGroup.add(lantern);
    });

    // Campfire with flickering point light & rising embers
    const campfire = createCampfire();
    campfire.position.set(0, 3.6, 6);
    islandGroup.add(campfire);

    // 3D Billboard & Lighthouse & Signpost
    const billboard = createIslandBillboard();
    billboard.position.set(-11, 3.6, 0);
    billboard.rotation.y = Math.PI / 5.5;
    islandGroup.add(billboard);

    const lighthouse = createLighthouse();
    lighthouse.position.set(17, 3.6, -14);
    islandGroup.add(lighthouse);

    const signpost = createScienceSignpost('밀도 탐사대');
    signpost.position.set(10, 3.6, 12);
    signpost.rotation.y = -Math.PI / 4;
    islandGroup.add(signpost);

    // Colorful Corals around coastline
    const coralGroup = new THREE.Group();
    for (let i = 0; i < 15; i++) {
      const coral = createCoralBranch(i % 3 === 0 ? 'bleached' : 'recovering');
      coral.position.set(
        Math.cos(i * 0.42) * 23,
        0.2,
        Math.sin(i * 0.42) * 23
      );
      coralGroup.add(coral);
    }
    islandGroup.add(coralGroup);

    // Tropical Fish School
    const fishSchool = createFishSchool(8);
    fishSchool.position.set(-12, -0.6, 18);
    scene.add(fishSchool);

    // Sea Turtle (Stage 3)
    let turtleMesh: THREE.Group | null = createSeaTurtle(!stateRef.current.isTurtleRescued);
    turtleMesh.position.set(8, -0.2, 17);
    turtleMesh.rotation.y = -Math.PI / 3;
    scene.add(turtleMesh);

    // Leaping Dolphins (Ending)
    const dolphinsGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const dolph = createDolphin();
      dolph.position.set(-30 + i * 15, -1.5, 45 + i * 8);
      dolph.rotation.y = Math.PI / 4;
      dolphinsGroup.add(dolph);
    }
    scene.add(dolphinsGroup);

    scene.add(islandGroup);

    // Chibi 2-Head Avatar
    let avatar: AnimatedAvatarGroup = createAnimalAvatar(stateRef.current.avatarType);
    avatar.position.set(0, 3.6, 10);
    scene.add(avatar);

    // Debris items in 3D
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);

    function spawnDebrisForStage(stageNum: number) {
      while (debrisGroup.children.length > 0) {
        debrisGroup.remove(debrisGroup.children[0]);
      }
      const stageItems = itemsData.filter(it => it.stage === stageNum || (stageNum >= 3 && it.stage <= stageNum));
      const pool = stageItems.length > 0 ? stageItems : itemsData;

      pool.forEach((item, index) => {
        const mesh = createDebrisItem(item.id);
        const angle = (index / pool.length) * Math.PI * 2 + Math.random() * 0.5;
        const rad = item.floats ? 18 + Math.random() * 8 : 12 + Math.random() * 10;
        const yPos = item.floats ? 0.1 : 3.6;

        mesh.position.set(Math.cos(angle) * rad, yPos, Math.sin(angle) * rad);
        mesh.userData.itemData = item;
        debrisGroup.add(mesh);
      });
    }

    spawnDebrisForStage(stateRef.current.currentStage);

    // Key controls
    const keys: Record<string, boolean> = {};
    const onKeyDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key.toLowerCase() === 'e') {
        checkPlayerInteraction();
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Mouse camera orbit
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cameraOrbitAngle = 0;
    let cameraPitch = 0.35;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || stateRef.current.isCinematicActive) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraOrbitAngle -= dx * 0.006;
      cameraPitch = Math.max(0.1, Math.min(1.2, cameraPitch + dy * 0.005));
    };
    const onMouseUp = () => {
      isDragging = false;
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    function checkPlayerInteraction() {
      const pPos = avatar.position;

      for (let i = debrisGroup.children.length - 1; i >= 0; i--) {
        const itemObj = debrisGroup.children[i];
        if (itemObj.position.distanceTo(pPos) < 2.5) {
          const itemData = itemObj.userData.itemData;
          debrisGroup.remove(itemObj);
          soundEngine.playPickup();
          stateRef.current.onPickDebris(itemData);
          setInteractPrompt(null);
          return;
        }
      }

      if (signpost.position.distanceTo(pPos) < 3.2) {
        soundEngine.playExperimentAction();
        stateRef.current.onInteractSignboard(stateRef.current.currentStage);
        return;
      }

      if (
        stateRef.current.currentStage === 3 &&
        !stateRef.current.isTurtleRescued &&
        turtleMesh &&
        turtleMesh.position.distanceTo(pPos) < 3.5
      ) {
        soundEngine.playTurtleRescue();
        const netChild = turtleMesh.getObjectByName('ghostNetMesh');
        if (netChild) turtleMesh.remove(netChild);
        stateRef.current.onRescueTurtle();
        setInteractPrompt(null);
        return;
      }
    }

    // Animation Tick Variables
    let clock = new THREE.Clock();
    let cinematicTimer = 0;
    let dolphinJumpTime = 0;
    let stepSoundTimer = 0;
    let startScreenOrbit = 0;
    let reqId = 0;

    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // 1. Sky & Ocean Updates
      auroraSky.setRecovery(stateRef.current.recoveryRate);
      auroraSky.setDawn(stateRef.current.isDawnEnding);
      auroraSky.update(delta);

      oceanWater.setRecovery(stateRef.current.recoveryRate);
      oceanWater.setDawn(stateRef.current.isDawnEnding);
      oceanWater.update(delta, avatar.position);

      // 2. Lighthouse Beacon Rotation
      const beaconHead = lighthouse.getObjectByName('beaconHead');
      if (beaconHead) {
        beaconHead.rotation.y += delta * 1.1;
      }

      // 3. Campfire Light Flicker & Rising Embers
      const fireLight = campfire.getObjectByName('fireLight') as THREE.PointLight;
      if (fireLight) {
        fireLight.intensity = 2.8 + Math.sin(elapsed * 15) * 0.6 + Math.sin(elapsed * 7) * 0.3;
      }

      const flames = campfire.getObjectByName('flames');
      if (flames) {
        flames.scale.y = 0.9 + Math.sin(elapsed * 14) * 0.16;
        flames.rotation.y = elapsed * 2.8;
      }

      // Embers physics (rising into the air)
      const embers = campfire.getObjectByName('embers') as THREE.Points;
      if (embers) {
        const posAttr = embers.geometry.attributes.position as THREE.BufferAttribute;
        const velAttr = embers.geometry.attributes.velocity as THREE.BufferAttribute;
        for (let i = 0; i < posAttr.count; i++) {
          let y = posAttr.getY(i) + velAttr.getY(i) * delta;
          let x = posAttr.getX(i) + (velAttr.getX(i) + Math.sin(elapsed * 3 + i) * 0.1) * delta;
          let z = posAttr.getZ(i) + velAttr.getZ(i) * delta;

          if (y > 3.0) {
            y = 0.3;
            x = (Math.random() - 0.5) * 0.35;
            z = (Math.random() - 0.5) * 0.35;
          }
          posAttr.setXYZ(i, x, y, z);
        }
        posAttr.needsUpdate = true;
      }

      // 4. Bobbing Debris
      debrisGroup.children.forEach(child => {
        child.position.y += Math.sin(elapsed * 2.2 + (child.userData.bobOffset || 0)) * 0.003;
        child.rotation.y += delta * 0.6;
      });

      // 5. Fish Schooling
      fishSchool.children.forEach(fish => {
        const spd = fish.userData.speed || 1.0;
        const off = fish.userData.offset || 0;
        fish.position.x += Math.sin(elapsed * spd + off) * 0.012;
        fish.position.z += Math.cos(elapsed * spd + off) * 0.012;
      });

      // 6. Ending Dolphins
      if (stateRef.current.isDawnEnding) {
        dolphinJumpTime += delta * 1.5;
        dolphinsGroup.children.forEach((dolph, i) => {
          const t = dolphinJumpTime + i * 1.2;
          const cycle = Math.sin(t);
          dolph.position.y = cycle > 0 ? cycle * 4.2 - 1.0 : -1.8;
          dolph.rotation.x = cycle > 0 ? (cycle - 0.5) * 1.3 : 0;
        });
      }

      // 7. Camera Dynamics: Start Screen Orbit vs 6-Second Descent vs 3rd-Person Follow
      if (stateRef.current.isStartScreen) {
        // Gentle, mesmerizing panoramic camera rotation admiring aurora and full moon
        startScreenOrbit += delta * 0.04;
        const r = 58;
        camera.position.x = Math.sin(startScreenOrbit) * r;
        camera.position.z = Math.cos(startScreenOrbit) * r;
        camera.position.y = 35 + Math.sin(startScreenOrbit * 0.5) * 5;
        camera.lookAt(-10, 20, -35); // towards aurora and moon horizon

      } else if (stateRef.current.isCinematicActive) {
        // 6-Second cinematic descent down to the island
        cinematicTimer += delta;
        const prog = Math.min(1.0, cinematicTimer / 6.0);
        const ease = 1 - Math.pow(1 - prog, 3);

        camera.position.x = THREE.MathUtils.lerp(0, 0, ease);
        camera.position.y = THREE.MathUtils.lerp(42, 6.8, ease);
        camera.position.z = THREE.MathUtils.lerp(62, 17.5, ease);
        camera.lookAt(avatar.position.x, avatar.position.y + 0.9, avatar.position.z);

        if (prog >= 1.0) {
          stateRef.current.onCinematicComplete();
        }

      } else {
        // Gameplay Avatar Movement & Chibi Bouncy Walking
        let moveX = 0;
        let moveZ = 0;

        if (keys['w'] || keys['arrowup']) moveZ -= 1;
        if (keys['s'] || keys['arrowdown']) moveZ += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        if (stateRef.current.mobileMoveVector.x !== 0 || stateRef.current.mobileMoveVector.y !== 0) {
          moveX = stateRef.current.mobileMoveVector.x;
          moveZ = stateRef.current.mobileMoveVector.y;
        }

        const isRunning = keys['shift'] || false;
        const moveSpeed = (isRunning ? 6.8 : 4.2) * delta;
        const isMoving = moveX !== 0 || moveZ !== 0;
        avatar.userData.isMoving = isMoving;

        if (isMoving) {
          const inputAngle = Math.atan2(moveX, moveZ);
          const worldAngle = inputAngle + cameraOrbitAngle;

          avatar.position.x += Math.sin(worldAngle) * moveSpeed;
          avatar.position.z += Math.cos(worldAngle) * moveSpeed;
          avatar.rotation.y = THREE.MathUtils.damp(avatar.rotation.y, worldAngle, 12, delta);

          const distFromCenter = Math.hypot(avatar.position.x, avatar.position.z);
          if (distFromCenter > 25.5) {
            avatar.position.x = (avatar.position.x / distFromCenter) * 25.5;
            avatar.position.z = (avatar.position.z / distFromCenter) * 25.5;
          }

          const slopeT = Math.min(1.0, Math.max(0.0, (distFromCenter - 14) / 10));
          const targetY = THREE.MathUtils.lerp(3.6, 0.2, slopeT);
          avatar.position.y = targetY;

          // Chibi Bouncy Walk: vertical bob + lateral wobble
          avatar.userData.walkCycle += delta * (isRunning ? 15 : 10);
          const cycle = avatar.userData.walkCycle;

          if (avatar.userData.bodyGroup) {
            avatar.userData.bodyGroup.position.y = Math.abs(Math.sin(cycle)) * 0.14;
            avatar.userData.bodyGroup.rotation.z = Math.sin(cycle) * 0.08;
          }

          const swing = Math.sin(cycle) * 0.45;
          if (avatar.userData.leftLeg) avatar.userData.leftLeg.rotation.x = swing;
          if (avatar.userData.rightLeg) avatar.userData.rightLeg.rotation.x = -swing;
          if (avatar.userData.leftArm) avatar.userData.leftArm.rotation.x = -swing;
          if (avatar.userData.rightArm) avatar.userData.rightArm.rotation.x = swing;

          // Ear bounce
          if (avatar.userData.ears) {
            avatar.userData.ears.rotation.x = -0.1 + Math.sin(cycle * 2) * 0.08;
          }

          stepSoundTimer += delta;
          if (stepSoundTimer > (isRunning ? 0.26 : 0.40)) {
            stepSoundTimer = 0;
            soundEngine.playFootstep(targetY < 1.0);
          }
        } else {
          // Gentle breathing bob
          if (avatar.userData.bodyGroup) {
            avatar.userData.bodyGroup.position.y = Math.sin(elapsed * 2.8) * 0.025;
            avatar.userData.bodyGroup.rotation.z = 0;
          }
          if (avatar.userData.leftLeg) avatar.userData.leftLeg.rotation.x = 0;
          if (avatar.userData.rightLeg) avatar.userData.rightLeg.rotation.x = 0;
          if (avatar.userData.leftArm) avatar.userData.leftArm.rotation.x = 0;
          if (avatar.userData.rightArm) avatar.userData.rightArm.rotation.x = 0;
        }

        if (avatar.userData.tail) {
          avatar.userData.tail.rotation.y = Math.sin(elapsed * 4.5) * 0.22;
        }

        // Smooth 3rd-Person Follow Camera with damping
        const camDist = 7.2;
        const camHeight = 3.0 + cameraPitch * 2.8;
        const targetCamX = avatar.position.x - Math.sin(cameraOrbitAngle) * camDist;
        const targetCamZ = avatar.position.z - Math.cos(cameraOrbitAngle) * camDist;
        const targetCamY = avatar.position.y + camHeight;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 5.5, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 5.5, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 5.5, delta);
        camera.lookAt(avatar.position.x, avatar.position.y + 1.0, avatar.position.z);

        // Interaction Prompts
        let foundPrompt: string | null = null;
        for (let i = 0; i < debrisGroup.children.length; i++) {
          if (debrisGroup.children[i].position.distanceTo(avatar.position) < 2.5) {
            foundPrompt = 'E: 쓰레기 증거 줍기 (밀도/재질 탐사)';
            break;
          }
        }
        if (!foundPrompt && signpost.position.distanceTo(avatar.position) < 3.2) {
          foundPrompt = 'E: 과학 표지판 읽기';
        }
        if (
          !foundPrompt &&
          stateRef.current.currentStage === 3 &&
          !stateRef.current.isTurtleRescued &&
          turtleMesh &&
          turtleMesh.position.distanceTo(avatar.position) < 3.5
        ) {
          foundPrompt = 'E: 바다거북 폐그물 매듭 풀기';
        }
        setInteractPrompt(foundPrompt);
      }

      // Render with post-processing or direct WebGL
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }

      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);

    const onResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      if (composer) composer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('resize', onResize);
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      if (mountRef.current && renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [graphicsQuality]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {interactPrompt && !isCinematicActive && !isStartScreen && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-5 py-2.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-400 text-cyan-300 font-bold text-xs md:text-sm shadow-2xl shadow-cyan-500/50 flex items-center gap-2 animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>{interactPrompt}</span>
          </div>
        </div>
      )}

      {activeEmote && !isCinematicActive && !isStartScreen && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none animate-floatUp">
          <div className="text-4xl filter drop-shadow-[0_0_15px_rgba(255,255,255,0.9)]">
            {activeEmote}
          </div>
        </div>
      )}
    </div>
  );
};
