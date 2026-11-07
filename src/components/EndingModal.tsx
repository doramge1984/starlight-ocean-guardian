import React, { useState, useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { saveGameRecord } from '../firebase';
import confetti from 'canvas-confetti';
import { Award, Heart, CheckCircle2, RotateCcw, Trophy, Sparkles, Sun } from 'lucide-react';

interface EndingModalProps {
  score: number;
  quizAccuracy: number;
  physicsAcc: number;
  chemistryAcc: number;
  biologyAcc: number;
  stagesCleared: number;
  recoveryRate: number;
  playerNickname: string;
  animal: string;
  schoolLevel: 'elementary' | 'middle' | 'high';
  classCode: string;
  mode: 'full' | 'quick';
  onRestart: () => void;
  onOpenLeaderboard: () => void;
}

const PLEDGES = [
  { id: 'tumbler', text: '🥤 일회용 컵 대신 개인 텀블러 매일 사용하기', desc: '플라스틱 일회용 컵을 줄여 해양 유입을 원천 차단해요.' },
  { id: 'recycle', text: '♻️ 플라스틱 분리배출 시 라벨 떼고 깨끗이 헹구기', desc: '재활용 선별 효율을 높여 자원 순환을 완성해요.' },
  { id: 'disposable', text: '🛍️ 장바구니와 에코백 쓰고 비닐봉지 받지 않기', desc: '바다거북이 해파리로 착각하지 않도록 비닐 사용을 줄여요.' },
  { id: 'share', text: '🗣️ 오늘 배운 바다 과학 사실 가족과 친구에게 알려주기', desc: '과학적 진실과 희망의 메시지를 널리 퍼뜨려요.' },
];

export const EndingModal: React.FC<EndingModalProps> = ({
  score,
  quizAccuracy,
  physicsAcc,
  chemistryAcc,
  biologyAcc,
  stagesCleared,
  recoveryRate,
  playerNickname,
  animal,
  schoolLevel,
  classCode,
  mode,
  onRestart,
  onOpenLeaderboard,
}) => {
  const [selectedPledge, setSelectedPledge] = useState<string>('tumbler');
  const [pledgeSubmitted, setPledgeSubmitted] = useState<boolean>(false);
  const [finalScore, setFinalScore] = useState<number>(score);

  useEffect(() => {
    soundEngine.playSunriseMusic();
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}
  }, []);

  const handlePledgeSubmit = async () => {
    soundEngine.playBadgeFanfare();
    const withPledgeScore = finalScore + 100;
    setFinalScore(withPledgeScore);
    setPledgeSubmitted(true);

    try {
      confetti({ particleCount: 80, spread: 60 });
    } catch (e) {}

    // Save ending record
    await saveGameRecord({
      nickname: playerNickname || '별빛 지킴이',
      animal,
      score: withPledgeScore,
      quizAccuracy,
      stagesCleared,
      mode,
      schoolLevel,
      classCode,
    });
  };

  const BADGES = [
    { id: 1, name: '부력 탐사가', sub: '물리' },
    { id: 2, name: '사슬 해독가', sub: '화학' },
    { id: 3, name: '생명 수호자', sub: '생명' },
    { id: 4, name: '산호 수호자', sub: '화학' },
    { id: 5, name: '마스터 디자이너', sub: '리터러시' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Banner with Sunrise Tone */}
        <div className="p-6 bg-gradient-to-r from-amber-950/80 via-orange-950/60 to-slate-950/90 border-b border-amber-500/30 rounded-t-3xl flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-400 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/30 mb-3">
            <Sun className="w-8 h-8 animate-spin" />
          </div>

          <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
            새벽 해가 뜨고, 바다가 다시 숨을 쉽니다
          </h3>
          <p className="text-xs md:text-sm text-amber-200/90 max-w-md italic">
            “좋은 게임은 끝날 때를 알아요. 오늘 과학으로 되살린 바다를 기억해 주세요.”
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Step 1: Pledge Selection */}
          {!pledgeSubmitted ? (
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-amber-500/40 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Heart className="w-4 h-4 text-rose-400" />
                <span>오늘의 실천 서약 하나 고르기 (+100점 보너스):</span>
              </div>

              <div className="flex flex-col gap-2">
                {PLEDGES.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      soundEngine.playExperimentAction();
                      setSelectedPledge(p.id);
                    }}
                    className={`p-3 rounded-xl border text-left transition flex flex-col ${
                      selectedPledge === p.id
                        ? 'border-amber-400 bg-amber-950/60 shadow-md shadow-amber-500/20 text-white'
                        : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-750'
                    }`}
                  >
                    <span className="font-bold text-xs md:text-sm">{p.text}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5">{p.desc}</span>
                  </button>
                ))}
              </div>

              <button
                onClick={handlePledgeSubmit}
                className="mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/30 transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>나의 바다 살리기 서약 완료하고 최종 점수 등록하기</span>
              </button>
            </div>
          ) : (
            <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-center text-xs text-emerald-300 font-semibold">
              ✨ 환경 서약이 전광판과 우리 반 집계에 안전하게 등록되었습니다!
            </div>
          )}

          {/* Results Summary Dashboard */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] text-slate-400">총 획득 점수</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-amber-400">
                {finalScore.toLocaleString()}점
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] text-slate-400">바다 회복도</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-cyan-400">
                {Math.round(recoveryRate)}%
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] text-slate-400">첫 시도 퀴즈 정답률</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-emerald-400">
                {Math.round(quizAccuracy)}%
              </span>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
              <span className="text-[11px] text-slate-400">완료 스테이지</span>
              <span className="text-xl md:text-2xl font-bold font-mono text-purple-400">
                {stagesCleared} / 5
              </span>
            </div>
          </div>

          {/* 5 Stage Badges */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2">
            <span className="text-xs font-semibold text-slate-300">획득한 5대 바다 과학 배지:</span>
            <div className="grid grid-cols-5 gap-2">
              {BADGES.map((b, idx) => {
                const isUnlocked = idx < stagesCleared;
                return (
                  <div
                    key={b.id}
                    className={`p-2 rounded-xl border flex flex-col items-center text-center transition ${
                      isUnlocked
                        ? 'border-amber-400 bg-amber-950/40 text-amber-300 shadow-md shadow-amber-500/20'
                        : 'border-slate-800 bg-slate-900 text-slate-600'
                    }`}
                  >
                    <Award className="w-6 h-6 mb-1" />
                    <span className="font-bold text-[10px] sm:text-xs leading-tight">{b.name}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-0.5">{b.sub}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Domain Accuracy Bar Charts */}
          <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-300">
              📊 영역별 과학 탐구 정답률:
            </span>

            {/* Physics */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>물리 (밀도와 부력)</span>
                <span className="font-mono text-cyan-400 font-semibold">{physicsAcc}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-700"
                  style={{ width: `${physicsAcc}%` }}
                />
              </div>
            </div>

            {/* Chemistry */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>화학 (고분자 사슬 & 해양 산성화)</span>
                <span className="font-mono text-rose-400 font-semibold">{chemistryAcc}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 transition-all duration-700"
                  style={{ width: `${chemistryAcc}%` }}
                />
              </div>
            </div>

            {/* Biology */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[11px] text-slate-300">
                <span>생명과학 (해양 생태계 & 혼획)</span>
                <span className="font-mono text-emerald-400 font-semibold">{biologyAcc}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${biologyAcc}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl flex items-center justify-between gap-3">
          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              onOpenLeaderboard();
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs transition border border-amber-500/30"
          >
            <Trophy className="w-4 h-4" />
            <span>명예의 전당 보기</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              onRestart();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-cyan-500/30 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>새로운 탐험 시작하기</span>
          </button>
        </div>
      </div>
    </div>
  );
};
