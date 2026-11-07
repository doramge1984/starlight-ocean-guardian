import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createAnimalAvatar } from '../three/proceduralModels';

interface AvatarPreviewProps {
  animalType: string;
  nickname: string;
}

export const AvatarPreview: React.FC<AvatarPreviewProps> = ({ animalType, nickname }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const width = container.clientWidth || 160;
    const height = container.clientHeight || 160;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.35, 3.8);
    camera.lookAt(0, 0.95, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Warm three-point lighting for avatar showcase
    const keyLight = new THREE.DirectionalLight(0xfff7ed, 2.2);
    keyLight.position.set(2, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.4);
    fillLight.position.set(-2, 1, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xa855f7, 1.8);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    // Avatar
    const avatar = createAnimalAvatar(animalType);
    avatar.position.set(0, 0.05, 0);
    scene.add(avatar);

    let reqId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      const elapsed = clock.getElapsedTime();
      avatar.rotation.y = elapsed * 0.75;
      if (avatar.userData.bodyGroup) {
        avatar.userData.bodyGroup.position.y = 0.20 + Math.sin(elapsed * 3.5) * 0.04;
      }
      renderer.render(scene, camera);
      reqId = requestAnimationFrame(animate);
    };

    reqId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(reqId);
      renderer.dispose();
      container.innerHTML = '';
    };
  }, [animalType]);

  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-cyan-500/30 shadow-inner">
      <div ref={containerRef} className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center cursor-pointer" />
      <div className="mt-1 px-3 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-400/50 text-[11px] font-bold text-cyan-200 flex items-center gap-1 shadow-sm">
        <span>⭐</span>
        <span>{nickname.trim() || '별빛 지킴이'}</span>
      </div>
    </div>
  );
};
