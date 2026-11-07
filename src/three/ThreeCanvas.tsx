import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
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
  onActionTriggered?: () => void;
}

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
  onActionTriggered,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Proximity prompt state for UI overlay
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);

  // References to preserve across renders
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

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04101e, 0.012);

    const camera = new THREE.PerspectiveCamera(
      55,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      300
    );

    // Initial cinematic camera position (high sky overlooking aurora)
    camera.position.set(0, 45, 65);
    camera.lookAt(0, 5, 0);

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
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = !isSoftwareGl && graphicsQuality !== 'low';
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    mountRef.current.appendChild(renderer.domElement);

    // Procedural Studio Environment for PBR
    try {
      const pmremGenerator = new THREE.PMREMGenerator(renderer);
      scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
      pmremGenerator.dispose();
    } catch (e) {}

    // Lighting rig
    const hemisphereLight = new THREE.HemisphereLight(0x38bdf8, 0x0f172a, 0.7);
    scene.add(hemisphereLight);

    const keyMoonLight = new THREE.DirectionalLight(0xa5f3fc, 1.8);
    keyMoonLight.position.set(25, 40, -35);
    keyMoonLight.castShadow = !isSoftwareGl && graphicsQuality !== 'low';
    keyMoonLight.shadow.mapSize.width = 1024;
    keyMoonLight.shadow.mapSize.height = 1024;
    keyMoonLight.shadow.camera.near = 10;
    keyMoonLight.shadow.camera.far = 120;
    keyMoonLight.shadow.camera.left = -30;
    keyMoonLight.shadow.camera.right = 30;
    keyMoonLight.shadow.camera.top = 30;
    keyMoonLight.shadow.camera.bottom = -30;
    keyMoonLight.shadow.bias = -0.0005;
    scene.add(keyMoonLight);

    // Aurora Sky & Ocean
    const auroraSky: AuroraSkyController = createAuroraSky();
    scene.add(auroraSky.mesh);
    scene.add(auroraSky.stars);
    scene.add(auroraSky.shootingStars);
    scene.add(auroraSky.constellationGroup);

    const oceanWater: OceanWaterController = createOceanWater();
    scene.add(oceanWater.mesh);

    // Procedural Island Terrain
    const islandGroup = new THREE.Group();
    const terrainGeo = new THREE.CylinderGeometry(28, 38, 3.5, 32);
    terrainGeo.translate(0, 1.6, 0);
    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xdec092,
      roughness: 0.9,
      metalness: 0.05,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, sandMat);
    terrainMesh.receiveShadow = true;
    islandGroup.add(terrainMesh);

    // Rocky outcrops on north cliff
    for (let i = 0; i < 9; i++) {
      const rockGeo = new THREE.DodecahedronGeometry(2.0 + Math.random() * 2.5);
      const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.95 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      const angle = (i / 9) * Math.PI - Math.PI / 2;
      rock.position.set(Math.cos(angle) * 26, 2.5 + Math.random() * 2, Math.sin(angle) * 26);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.castShadow = true;
      rock.receiveShadow = true;
      islandGroup.add(rock);
    }

    // Props: Campfire, Billboard, Lighthouse, Signpost
    const campfire = createCampfire();
    campfire.position.set(0, 3.4, 6);
    islandGroup.add(campfire);

    const billboard = createIslandBillboard();
    billboard.position.set(-10, 3.4, 0);
    billboard.rotation.y = Math.PI / 6;
    islandGroup.add(billboard);

    const lighthouse = createLighthouse();
    lighthouse.position.set(16, 3.4, -14);
    islandGroup.add(lighthouse);

    const signpost = createScienceSignpost('밀도 탐사대');
    signpost.position.set(10, 3.4, 12);
    signpost.rotation.y = -Math.PI / 4;
    islandGroup.add(signpost);

    // Corals on shallow water border
    const coralGroup = new THREE.Group();
    for (let i = 0; i < 14; i++) {
      const coral = createCoralBranch(i % 3 === 0 ? 'bleached' : 'recovering');
      coral.position.set(
        Math.cos(i * 0.45) * 22,
        0.2,
        Math.sin(i * 0.45) * 22
      );
      coralGroup.add(coral);
    }
    islandGroup.add(coralGroup);

    // Fish School
    const fishSchool = createFishSchool(8);
    fishSchool.position.set(-12, -0.6, 18);
    scene.add(fishSchool);

    // Sea Turtle (Stage 3)
    let turtleMesh: THREE.Group | null = createSeaTurtle(!stateRef.current.isTurtleRescued);
    turtleMesh.position.set(8, -0.2, 16);
    turtleMesh.rotation.y = -Math.PI / 3;
    scene.add(turtleMesh);

    // Ending Leaping Dolphins
    const dolphinsGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const dolph = createDolphin();
      dolph.position.set(
        -30 + i * 15,
        -1.5,
        45 + i * 8
      );
      dolph.rotation.y = Math.PI / 4;
      dolphinsGroup.add(dolph);
    }
    scene.add(dolphinsGroup);

    scene.add(islandGroup);

    // Player Avatar
    let avatar: AnimatedAvatarGroup = createAnimalAvatar(stateRef.current.avatarType);
    avatar.position.set(0, 3.4, 10);
    scene.add(avatar);

    // Debris items array in 3D
    const debrisGroup = new THREE.Group();
    scene.add(debrisGroup);

    function spawnDebrisForStage(stageNum: number) {
      // Clear existing debris
      while (debrisGroup.children.length > 0) {
        debrisGroup.remove(debrisGroup.children[0]);
      }

      const stageItems = itemsData.filter((it) => it.stage === stageNum || (stageNum >= 3 && it.stage <= stageNum));
      const pool = stageItems.length > 0 ? stageItems : itemsData;

      pool.forEach((item, index) => {
        const mesh = createDebrisItem(item.id);
        const angle = (index / pool.length) * Math.PI * 2 + Math.random() * 0.5;
        const rad = item.floats ? 18 + Math.random() * 8 : 12 + Math.random() * 10;
        const yPos = item.floats ? 0.1 : 3.4; // water surface or beach

        mesh.position.set(Math.cos(angle) * rad, yPos, Math.sin(angle) * rad);
        mesh.userData.itemData = item;
        debrisGroup.add(mesh);
      });
    }

    spawnDebrisForStage(stateRef.current.currentStage);

    // Input handling
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

    // Pointer orbit camera control
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

    // Proximity interaction check
    function checkPlayerInteraction() {
      const pPos = avatar.position;

      // 1. Check debris collection
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

      // 2. Check Signboard
      if (signpost.position.distanceTo(pPos) < 3.2) {
        soundEngine.playExperimentAction();
        stateRef.current.onInteractSignboard(stateRef.current.currentStage);
        return;
      }

      // 3. Check Turtle Rescue (Stage 3)
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

    // Animation variables
    let clock = new THREE.Clock();
    let cinematicTimer = 0;
    let dolphinJumpTime = 0;
    let stepSoundTimer = 0;
    let reqId = 0;

    // Tick loop
    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // 1. Update Sky & Water
      auroraSky.setRecovery(stateRef.current.recoveryRate);
      auroraSky.setDawn(stateRef.current.isDawnEnding);
      auroraSky.update(delta);

      oceanWater.setRecovery(stateRef.current.recoveryRate);
      oceanWater.setDawn(stateRef.current.isDawnEnding);
      oceanWater.update(delta, avatar.position);

      // 2. Rotate Lighthouse beacon
      const beaconHead = lighthouse.getObjectByName('beaconHead');
      if (beaconHead) {
        beaconHead.rotation.y += delta * 1.2;
      }

      // 3. Campfire flame flickers
      const flames = campfire.getObjectByName('flames');
      if (flames) {
        flames.scale.y = 0.85 + Math.sin(elapsed * 12) * 0.18;
        flames.rotation.y = elapsed * 3;
      }

      // 4. Bobbing debris items
      debrisGroup.children.forEach((child) => {
        child.position.y += Math.sin(elapsed * 2 + (child.userData.bobOffset || 0)) * 0.003;
        child.rotation.y += delta * 0.6;
      });

      // 5. Fish schooling
      fishSchool.children.forEach((fish) => {
        const spd = fish.userData.speed || 1.0;
        const off = fish.userData.offset || 0;
        fish.position.x += Math.sin(elapsed * spd + off) * 0.01;
        fish.position.z += Math.cos(elapsed * spd + off) * 0.01;
      });

      // 6. Ending Dolphins leaping
      if (stateRef.current.isDawnEnding) {
        dolphinJumpTime += delta * 1.5;
        dolphinsGroup.children.forEach((dolph, i) => {
          const t = dolphinJumpTime + i * 1.2;
          const cycle = Math.sin(t);
          dolph.position.y = cycle > 0 ? cycle * 4.0 - 1.0 : -1.8;
          dolph.rotation.x = cycle > 0 ? (cycle - 0.5) * 1.2 : 0;
        });
      }

      // 7. Cinematic Camera vs Gameplay Third-Person
      if (stateRef.current.isCinematicActive) {
        cinematicTimer += delta;
        const prog = Math.min(1.0, cinematicTimer / 6.0);
        // Smooth cubic ease down to the island
        const ease = 1 - Math.pow(1 - prog, 3);

        camera.position.x = THREE.MathUtils.lerp(0, 0, ease);
        camera.position.y = THREE.MathUtils.lerp(45, 6.5, ease);
        camera.position.z = THREE.MathUtils.lerp(65, 18, ease);
        camera.lookAt(avatar.position.x, avatar.position.y + 0.8, avatar.position.z);

        if (prog >= 1.0) {
          stateRef.current.onCinematicComplete();
        }
      } else {
        // Player Input Movement
        let moveX = 0;
        let moveZ = 0;

        if (keys['w'] || keys['arrowup']) moveZ -= 1;
        if (keys['s'] || keys['arrowdown']) moveZ += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        // Mobile joystick input
        if (stateRef.current.mobileMoveVector.x !== 0 || stateRef.current.mobileMoveVector.y !== 0) {
          moveX = stateRef.current.mobileMoveVector.x;
          moveZ = stateRef.current.mobileMoveVector.y;
        }

        const isRunning = keys['shift'] || false;
        const moveSpeed = (isRunning ? 6.5 : 4.0) * delta;

        const isMoving = moveX !== 0 || moveZ !== 0;
        avatar.userData.isMoving = isMoving;

        if (isMoving) {
          // Camera-relative movement angle
          const inputAngle = Math.atan2(moveX, moveZ);
          const worldAngle = inputAngle + cameraOrbitAngle;

          avatar.position.x += Math.sin(worldAngle) * moveSpeed;
          avatar.position.z += Math.cos(worldAngle) * moveSpeed;
          avatar.rotation.y = THREE.MathUtils.damp(avatar.rotation.y, worldAngle, 12, delta);

          // Bound within island & shallow water
          const distFromCenter = Math.hypot(avatar.position.x, avatar.position.z);
          if (distFromCenter > 25.0) {
            avatar.position.x = (avatar.position.x / distFromCenter) * 25.0;
            avatar.position.z = (avatar.position.z / distFromCenter) * 25.0;
          }

          // Elevation height map: center is 3.4, edge slopes to water 0.2
          const slopeT = Math.min(1.0, Math.max(0.0, (distFromCenter - 14) / 10));
          const targetY = THREE.MathUtils.lerp(3.4, 0.2, slopeT);
          avatar.position.y = targetY;

          // Leg/arm walk swing
          avatar.userData.walkCycle += delta * (isRunning ? 14 : 9);
          const swing = Math.sin(avatar.userData.walkCycle) * 0.45;
          if (avatar.userData.leftLeg) avatar.userData.leftLeg.rotation.x = swing;
          if (avatar.userData.rightLeg) avatar.userData.rightLeg.rotation.x = -swing;
          if (avatar.userData.leftArm) avatar.userData.leftArm.rotation.x = -swing;
          if (avatar.userData.rightArm) avatar.userData.rightArm.rotation.x = swing;

          // Footstep audio
          stepSoundTimer += delta;
          if (stepSoundTimer > (isRunning ? 0.28 : 0.42)) {
            stepSoundTimer = 0;
            soundEngine.playFootstep(targetY < 1.0);
          }
        } else {
          // Idle breathing
          avatar.position.y += Math.sin(elapsed * 3) * 0.001;
          if (avatar.userData.leftLeg) avatar.userData.leftLeg.rotation.x = 0;
          if (avatar.userData.rightLeg) avatar.userData.rightLeg.rotation.x = 0;
          if (avatar.userData.leftArm) avatar.userData.leftArm.rotation.x = 0;
          if (avatar.userData.rightArm) avatar.userData.rightArm.rotation.x = 0;
        }

        // Tail wagging if present
        if (avatar.userData.tail) {
          avatar.userData.tail.rotation.y = Math.sin(elapsed * 5) * 0.2;
        }

        // Third-Person Camera follow
        const camDist = 7.5;
        const camHeight = 3.2 + cameraPitch * 3.0;
        const targetCamX = avatar.position.x - Math.sin(cameraOrbitAngle) * camDist;
        const targetCamZ = avatar.position.z - Math.cos(cameraOrbitAngle) * camDist;
        const targetCamY = avatar.position.y + camHeight;

        camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 6, delta);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 6, delta);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 6, delta);
        camera.lookAt(avatar.position.x, avatar.position.y + 1.1, avatar.position.z);

        // Check proximity for UI prompts
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

      renderer.render(scene, camera);
      reqId = requestAnimationFrame(tick);
    };

    reqId = requestAnimationFrame(tick);

    // Resize handler
    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
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
      {/* Three.js Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Proximity Interaction Floating Tooltip */}
      {interactPrompt && !isCinematicActive && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border-2 border-cyan-400 text-cyan-300 font-bold text-xs md:text-sm shadow-2xl shadow-cyan-500/40 flex items-center gap-2 animate-bounce">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
            <span>{interactPrompt}</span>
          </div>
        </div>
      )}

      {/* Active Avatar Emote Floating Overhead */}
      {activeEmote && !isCinematicActive && (
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none animate-floatUp">
          <div className="text-4xl filter drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">
            {activeEmote}
          </div>
        </div>
      )}
    </div>
  );
};
