import React, { useState, useEffect, useRef } from 'react';
import { ThreeCanvas } from './three/ThreeCanvas';
import { soundEngine } from './audio/soundEngine';
import { ScienceCardModal } from './components/ScienceCardModal';
import { QuizModal } from './components/QuizModal';
import { EndingModal } from './components/EndingModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { TeacherMenuModal } from './components/TeacherMenuModal';
import { Stage1Experiment } from './components/experiments/Stage1Experiment';
import { Stage2Experiment } from './components/experiments/Stage2Experiment';
import { Stage3Experiment } from './components/experiments/Stage3Experiment';
import { Stage4Experiment } from './components/experiments/Stage4Experiment';
import { Stage5Designer } from './components/experiments/Stage5Designer';

import {
  Sparkles,
  Volume2,
  VolumeX,
  Volume1,
  Award,
  BookOpen,
  FlaskConical,
  HelpCircle,
  Trophy,
  GraduationCap,
  Play,
  RotateCcw,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Smile,
  Heart,
  Star,
  Zap,
} from 'lucide-react';

export default function App() {
  // Game Flow States: 'start' | 'cinematic' | 'game' | 'ending'
  const [gameState, setGameState] = useState<'start' | 'cinematic' | 'game' | 'ending'>('start');

  // User Profile
  const [nickname, setNickname] = useState<string>('바다수달');
  const [nicknameError, setNicknameError] = useState<string | null>(null);
  const [animal, setAnimal] = useState<string>('otter');
  const [schoolLevel, setSchoolLevel] = useState<'elementary' | 'middle' | 'high'>('elementary');
  const [classCode, setClassCode] = useState<string>('');
  const [gameMode, setGameMode] = useState<'full' | 'quick'>('full');

  // Active Stage & Progress
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [stagesCleared, setStagesCleared] = useState<number>(0);
  const [oceanRecovery, setOceanRecovery] = useState<number>(15);
  const [score, setScore] = useState<number>(0);

  // Stats for results
  const [quizAttempts, setQuizAttempts] = useState<{ total: number; correctFirst: number }>({ total: 0, correctFirst: 0 });
  const [domainScores, setDomainScores] = useState<{ physics: number; chemistry: number; biology: number }>({ physics: 100, chemistry: 100, biology: 100 });
  const [isTurtleRescued, setIsTurtleRescued] = useState<boolean>(false);

  // Settings
  const [graphicsQuality, setGraphicsQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isQuietMode, setIsQuietMode] = useState<boolean>(false);
  const [activeEmote, setActiveEmote] = useState<string | null>(null);

  // Active Modals
  const [showScienceModal, setShowScienceModal] = useState<boolean>(false);
  const [showExperimentModal, setShowExperimentModal] = useState<boolean>(false);
  const [showQuizModal, setShowQuizModal] = useState<boolean>(false);
  const [showEndingModal, setShowEndingModal] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const [showTeacherMenu, setShowTeacherMenu] = useState<boolean>(false);

  // Mobile virtual joystick vector
  const [mobileMove, setMobileMove] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const joystickTouchId = useRef<number | null>(null);
  const joystickCenter = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Nickname validation: 2~8 chars, no profanities, no 4+ consecutive numbers
  const validateNickname = (name: string): boolean => {
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 8) {
      setNicknameError('별명은 2~8자 사이로 입력해 주세요.');
      return false;
    }
    if (/\d{4,}/.test(trimmed)) {
      setNicknameError('개인정보 보호를 위해 연속된 숫자 4자리 이상은 사용하실 수 없습니다.');
      return false;
    }
    const banned = ['바보', '멍청', '욕설', '시발', '개새'];
    for (const b of banned) {
      if (trimmed.includes(b)) {
        setNicknameError('부적절한 단어가 포함되어 있습니다.');
        return false;
      }
    }
    setNicknameError(null);
    return true;
  };

  // Start game action
  const handleStartGame = () => {
    if (!validateNickname(nickname)) return;

    soundEngine.init();
    soundEngine.setStage(1);
    soundEngine.setRecoveryRate(oceanRecovery);

    setGameState('cinematic');
  };

  const handleCinematicSkip = () => {
    soundEngine.playExperimentAction();
    setGameState('game');
  };

  // Picking up debris in 3D
  const handlePickDebris = (item: any) => {
    setScore((prev) => prev + (item?.score || 100));
    setOceanRecovery((prev) => Math.min(100, prev + 4));
    soundEngine.setRecoveryRate(oceanRecovery + 4);
  };

  // Rescuing turtle in Stage 3
  const handleRescueTurtle = () => {
    setIsTurtleRescued(true);
    setScore((prev) => prev + 250);
    setOceanRecovery((prev) => Math.min(100, prev + 8));
  };

  // Correct answer in quiz
  const handleQuizCorrect = (isFirst: boolean) => {
    setScore((prev) => prev + (isFirst ? 50 : 20));
    setOceanRecovery((prev) => Math.min(100, prev + 5));
    setQuizAttempts((prev) => ({
      total: prev.total + 1,
      correctFirst: prev.correctFirst + (isFirst ? 1 : 0),
    }));
  };

  // Stage Clear Progression
  const handleStageClear = () => {
    soundEngine.playBadgeFanfare();
    setShowQuizModal(false);

    const nextCleared = stagesCleared + 1;
    setStagesCleared(nextCleared);
    setScore((prev) => prev + 300); // Stage clear bonus
    setOceanRecovery((prev) => Math.min(100, prev + 10));

    // Handle Quick vs Full Exploration route
    if (gameMode === 'quick') {
      if (currentStage === 1) {
        setCurrentStage(2);
        soundEngine.setStage(2);
      } else if (currentStage === 2) {
        setCurrentStage(4);
        soundEngine.setStage(4);
      } else {
        // Quick mode finishes at stage 4
        setGameState('ending');
        setShowEndingModal(true);
      }
    } else {
      if (currentStage < 5) {
        const nextSt = currentStage + 1;
        setCurrentStage(nextSt);
        soundEngine.setStage(nextSt);
      } else {
        // Full mode ending
        setGameState('ending');
        setShowEndingModal(true);
      }
    }
  };

  // Trigger emote
  const triggerEmote = (emoji: string) => {
    soundEngine.playFootstep();
    setActiveEmote(emoji);
    setTimeout(() => setActiveEmote(null), 2500);
  };

  // Next task guidance bubble
  const getNextTaskGuidance = () => {
    switch (currentStage) {
      case 1:
        return '해변을 걸으며 쓰레기 증거(PE 비닐, PP 뚜껑, PET 병)를 줍고 가상 수조 실험을 확인하세요!';
      case 2:
        return '햇빛 바위에서 돋보기로 부서진 미세플라스틱과 분자 사슬을 관찰하고 퀴즈를 풀어보세요!';
      case 3:
        return isTurtleRescued
          ? '해양 동물들의 시각을 비교 체험하고 바다 퀴즈에 도전하세요!'
          : '얕은 바닷속으로 헤엄쳐 버려진 그물에 걸린 바다거북을 구해주세요!';
      case 4:
        return '오염된 산호 정원을 치우고, CO₂ 슬라이더로 해양 산성화 원리를 확인하세요!';
      case 5:
        return '등대 위에서 세상을 바꿀 친환경 게임 장치를 설계하고 기획 카드를 저장하세요!';
      default:
        return '바다를 과학으로 되살리고 있습니다!';
    }
  };

  const STAGE_NAMES = [
    '스테이지 1: 밀물 해변 (밀도와 부력)',
    '스테이지 2: 햇빛 바위 (고분자와 미세플라스틱)',
    '스테이지 3: 얕은 바닷속 (생태계와 그물)',
    '스테이지 4: 산호 정원 (해양 산성화와 에너지)',
    '스테이지 5: 등대 (그린 게임 디자이너)',
  ];

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-slate-100 select-none">
      {/* 1. Master 3D WebGL Canvas */}
      <div className="absolute inset-0 z-0">
        <ThreeCanvas
          currentStage={currentStage}
          recoveryRate={oceanRecovery}
          avatarType={animal}
          nickname={nickname}
          isCinematicActive={gameState === 'cinematic'}
          onCinematicComplete={() => setGameState('game')}
          onPickDebris={handlePickDebris}
          onInteractSignboard={(stId) => setShowScienceModal(true)}
          onRescueTurtle={handleRescueTurtle}
          isTurtleRescued={isTurtleRescued}
          isDawnEnding={gameState === 'ending'}
          graphicsQuality={graphicsQuality}
          activeEmote={activeEmote}
          mobileMoveVector={mobileMove}
        />
      </div>

      {/* 2. Top-Right Global Controls (Volume, Quality, Teacher, Leaderboard) */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        {/* Graphics Quality */}
        <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-1 flex gap-1">
          {(['low', 'medium', 'high'] as const).map((q) => (
            <button
              key={q}
              onClick={() => setGraphicsQuality(q)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition ${
                graphicsQuality === q
                  ? 'bg-cyan-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {q === 'low' ? '낮음' : q === 'medium' ? '보통' : '높음'}
            </button>
          ))}
        </div>

        {/* Quiet Mode for Classroom */}
        <button
          onClick={() => {
            const next = soundEngine.toggleQuietMode();
            setIsQuietMode(next);
          }}
          className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1 transition ${
            isQuietMode
              ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300'
              : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:bg-slate-800'
          }`}
          title="교실용 조용 모드 (소프트 음향)"
        >
          <Volume1 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">교실 조용모드</span>
        </button>

        {/* Master Mute Toggle */}
        <button
          onClick={() => {
            const next = soundEngine.toggleMute();
            setIsMuted(next);
          }}
          className="p-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition"
          title="소리 켜기/끄기"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Teacher Menu Button */}
        <button
          onClick={() => setShowTeacherMenu(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-500/50 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-purple-900/30"
        >
          <GraduationCap className="w-4 h-4 text-purple-300" />
          <span className="hidden sm:inline">선생님 메뉴</span>
        </button>

        {/* Leaderboard Button */}
        <button
          onClick={() => setShowLeaderboard(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-800 border border-amber-500/50 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition shadow-lg shadow-amber-900/30"
        >
          <Trophy className="w-4 h-4 text-amber-300" />
          <span className="hidden sm:inline">명예의 전당</span>
        </button>
      </div>

      {/* 3. Start Screen Overlay */}
      {gameState === 'start' && (
        <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900/90 border-2 border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 md:p-8 shadow-2xl flex flex-col gap-5">
            {/* Title & Core Message */}
            <div className="text-center flex flex-col items-center">
              <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-1">
                게임문화재단 교사 게임리터러시 공모전 출품작
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]">
                별빛 바다 지킴이: 과학으로 되살리는 바다
              </h1>
              <p className="text-xs md:text-sm text-cyan-200/90 mt-2 max-w-md leading-relaxed">
                “게임은 세상을 바꾸는 힘이 있습니다. 과학으로 바다의 문제를 이해하고, 바다를 되살리고, 직접 친환경 게임 장치를 설계합니다.”
              </p>
            </div>

            {/* Profile Form */}
            <div className="flex flex-col gap-3.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
              {/* Nickname */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-300">
                    탐험가 별명 (2~8자, 실명 대신 별명 입력):
                  </label>
                  {nicknameError && (
                    <span className="text-[11px] text-rose-400 font-semibold">{nicknameError}</span>
                  )}
                </div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => {
                    setNickname(e.target.value);
                    validateNickname(e.target.value);
                  }}
                  maxLength={8}
                  className="w-full px-3 py-2 bg-slate-900 border border-cyan-500/30 rounded-xl text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
                  placeholder="예: 푸른수달, 별빛고래"
                />
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  동물 아바타 선택:
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[
                    { id: 'rabbit', label: '🐰 토끼' },
                    { id: 'fox', label: '🦊 여우' },
                    { id: 'bear', label: '🐻 곰' },
                    { id: 'penguin', label: '🐧 펭귄' },
                    { id: 'otter', label: '🦦 수달' },
                  ].map((av) => (
                    <button
                      key={av.id}
                      onClick={() => setAnimal(av.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold transition border ${
                        animal === av.id
                          ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {av.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* School Level */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  학교급 (과학 설명과 퀴즈 기준 선택):
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'elementary', label: '🌱 초등학교' },
                    { id: 'middle', label: '🌿 중학교' },
                    { id: 'high', label: '🌳 고등학교' },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      onClick={() => setSchoolLevel(lvl.id as any)}
                      className={`py-2 rounded-xl text-xs font-bold transition border ${
                        schoolLevel === lvl.id
                          ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Class Code & Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    반 코드 (선택, 6자리):
                  </label>
                  <input
                    type="text"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    placeholder="예: STAR01"
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    탐험 모드:
                  </label>
                  <select
                    value={gameMode}
                    onChange={(e) => setGameMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none"
                  >
                    <option value="full">전체 탐험 (5스테이지)</option>
                    <option value="quick">빠른 체험 (1·2·4 + 엔딩, 약 8분)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartGame}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-base md:text-lg shadow-xl shadow-cyan-500/30 transition transform hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>바다로 들어가기 (3D 오프닝 시네마틱)</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Cinematic Descent Skip Button */}
      {gameState === 'cinematic' && (
        <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-8">
          <div className="text-center animate-pulse pt-12">
            <h2 className="text-3xl md:text-5xl font-black text-white drop-shadow-[0_0_25px_rgba(6,182,212,1)]">
              별빛 바다 지킴이
            </h2>
            <p className="text-sm md:text-base text-cyan-300 font-semibold mt-2">
              과학으로 되살리는 바다의 세계로 내려갑니다...
            </p>
          </div>

          <div className="flex justify-end pointer-events-auto">
            <button
              onClick={handleCinematicSkip}
              className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-200 hover:text-white font-semibold text-xs transition cursor-pointer"
            >
              시네마틱 건너뛰기 ⏩
            </button>
          </div>
        </div>
      )}

      {/* 5. Gameplay HUD */}
      {gameState === 'game' && (
        <>
          {/* Top-Left: Stage Name */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none">
            <div className="px-4 py-2.5 rounded-2xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-sm shadow-xl flex flex-col">
              <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
                CURRENT STAGE ({currentStage}/5)
              </span>
              <h2 className="text-sm md:text-base font-bold text-white">
                {STAGE_NAMES[currentStage - 1]}
              </h2>
            </div>
          </div>

          {/* Top-Center: Guidance Speech Bubble */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none max-w-md w-full px-4 hidden sm:block">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-xl flex items-center gap-2 text-center justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <p className="text-xs text-slate-200 font-medium truncate">
                {getNextTaskGuidance()}
              </p>
            </div>
          </div>

          {/* Top-Right Metrics: Recovery & Badges & Score */}
          <div className="absolute top-16 right-4 z-20 flex flex-col items-end gap-2 pointer-events-none">
            {/* Score & Recovery Pill */}
            <div className="px-4 py-2 rounded-2xl bg-slate-900/85 border border-cyan-500/40 backdrop-blur-sm shadow-xl flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-mono">바다 회복도</span>
                <span className="text-sm md:text-base font-bold font-mono text-cyan-400">
                  {Math.round(oceanRecovery)}%
                </span>
              </div>

              <div className="w-px h-6 bg-slate-800" />

              <div className="flex flex-col items-end">
                <span className="text-[10px] text-slate-400 font-mono">총점</span>
                <span className="text-sm md:text-base font-bold font-mono text-amber-400">
                  {score.toLocaleString()}점
                </span>
              </div>
            </div>

            {/* Stage Badges 5 Slots */}
            <div className="px-3 py-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((st) => (
                <div
                  key={st}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                    st <= stagesCleared
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/30'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                  title={`스테이지 ${st} 배지`}
                >
                  <Award className="w-3.5 h-3.5" />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Interactive Dock: Collapsible HUD as per Three.js Directive */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 w-full max-w-xl px-4 pointer-events-auto">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-wrap items-center justify-between gap-2">
              {/* Main Rhythm Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowScienceModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <BookOpen className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">과학 카드</span>
                </button>

                <button
                  onClick={() => setShowExperimentModal(true)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs border border-amber-500/30 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <FlaskConical className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">가상 실험</span>
                </button>

                <button
                  onClick={() => setShowQuizModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>바다 퀴즈</span>
                </button>
              </div>

              {/* Emote bar */}
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
                {['❤️', '⭐', '😊', '👏', '🌈'].map((emo) => (
                  <button
                    key={emo}
                    onClick={() => triggerEmote(emo)}
                    className="w-7 h-7 rounded-lg hover:bg-slate-800 flex items-center justify-center text-sm transition"
                    title={`감정 표현: ${emo}`}
                  >
                    {emo}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile On-Screen Virtual Controls */}
          <div className="absolute bottom-24 left-4 z-20 sm:hidden">
            {/* Simple Mobile D-Pad */}
            <div className="w-28 h-28 rounded-full bg-slate-900/80 border-2 border-cyan-500/40 relative flex items-center justify-center">
              <button
                onTouchStart={() => setMobileMove({ x: 0, y: -1 })}
                onTouchEnd={() => setMobileMove({ x: 0, y: 0 })}
                className="absolute top-1 w-8 h-8 rounded-full bg-slate-800 text-xs text-white flex items-center justify-center"
              >
                ▲
              </button>
              <button
                onTouchStart={() => setMobileMove({ x: 0, y: 1 })}
                onTouchEnd={() => setMobileMove({ x: 0, y: 0 })}
                className="absolute bottom-1 w-8 h-8 rounded-full bg-slate-800 text-xs text-white flex items-center justify-center"
              >
                ▼
              </button>
              <button
                onTouchStart={() => setMobileMove({ x: -1, y: 0 })}
                onTouchEnd={() => setMobileMove({ x: 0, y: 0 })}
                className="absolute left-1 w-8 h-8 rounded-full bg-slate-800 text-xs text-white flex items-center justify-center"
              >
                ◀
              </button>
              <button
                onTouchStart={() => setMobileMove({ x: 1, y: 0 })}
                onTouchEnd={() => setMobileMove({ x: 0, y: 0 })}
                className="absolute right-1 w-8 h-8 rounded-full bg-slate-800 text-xs text-white flex items-center justify-center"
              >
                ▶
              </button>
            </div>
          </div>
        </>
      )}

      {/* 6. Modals Layer */}

      {/* Science Card Modal */}
      {showScienceModal && (
        <ScienceCardModal
          stageId={currentStage}
          initialLevel={schoolLevel}
          onClose={() => setShowScienceModal(false)}
          onProceedToExperiment={() => {
            setShowScienceModal(false);
            setShowExperimentModal(true);
          }}
        />
      )}

      {/* Virtual Experiment Modal */}
      {showExperimentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
                  <FlaskConical className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
                    {STAGE_NAMES[currentStage - 1]}
                  </span>
                  <h3 className="text-lg font-bold text-white">가상 실험실 (Interactive Lab)</h3>
                </div>
              </div>

              <button
                onClick={() => setShowExperimentModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {/* Experiment Content */}
            <div className="p-6">
              {currentStage === 1 && (
                <Stage1Experiment
                  level={schoolLevel}
                  onComplete={() => {
                    setScore((prev) => prev + 150);
                    setOceanRecovery((prev) => Math.min(100, prev + 6));
                  }}
                />
              )}
              {currentStage === 2 && (
                <Stage2Experiment
                  level={schoolLevel}
                  onComplete={() => {
                    setScore((prev) => prev + 150);
                    setOceanRecovery((prev) => Math.min(100, prev + 6));
                  }}
                />
              )}
              {currentStage === 3 && (
                <Stage3Experiment
                  level={schoolLevel}
                  onComplete={() => {
                    setScore((prev) => prev + 150);
                    setOceanRecovery((prev) => Math.min(100, prev + 6));
                  }}
                />
              )}
              {currentStage === 4 && (
                <Stage4Experiment
                  level={schoolLevel}
                  onComplete={() => {
                    setScore((prev) => prev + 150);
                    setOceanRecovery((prev) => Math.min(100, prev + 6));
                  }}
                />
              )}
              {currentStage === 5 && (
                <Stage5Designer
                  level={schoolLevel}
                  playerNickname={nickname}
                  onComplete={() => {
                    setScore((prev) => prev + 200);
                    setOceanRecovery(100);
                  }}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-5 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl flex justify-between items-center">
              <span className="text-xs text-slate-400">
                실험을 완료하면 보너스 점수(+150점)와 회복도가 상승합니다.
              </span>
              <button
                onClick={() => {
                  setShowExperimentModal(false);
                  setShowQuizModal(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
              >
                <span>바다 퀴즈 풀러 가기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizModal
          stageId={currentStage}
          initialLevel={schoolLevel}
          onClose={() => setShowQuizModal(false)}
          onCorrectAnswer={handleQuizCorrect}
          onStageClear={handleStageClear}
        />
      )}

      {/* Ending Modal */}
      {showEndingModal && (
        <EndingModal
          score={score}
          quizAccuracy={
            quizAttempts.total > 0
              ? (quizAttempts.correctFirst / quizAttempts.total) * 100
              : 100
          }
          physicsAcc={domainScores.physics}
          chemistryAcc={domainScores.chemistry}
          biologyAcc={domainScores.biology}
          stagesCleared={stagesCleared}
          recoveryRate={oceanRecovery}
          playerNickname={nickname}
          animal={animal}
          schoolLevel={schoolLevel}
          classCode={classCode}
          mode={gameMode}
          onRestart={() => {
            setShowEndingModal(false);
            setGameState('start');
            setCurrentStage(1);
            setStagesCleared(0);
            setOceanRecovery(15);
            setScore(0);
          }}
          onOpenLeaderboard={() => setShowLeaderboard(true)}
        />
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal onClose={() => setShowLeaderboard(false)} />
      )}

      {/* Teacher Menu Modal */}
      {showTeacherMenu && (
        <TeacherMenuModal
          currentClassCode={classCode}
          onSelectClassCode={(code) => setClassCode(code)}
          onClose={() => setShowTeacherMenu(false)}
        />
      )}
    </div>
  );
}
