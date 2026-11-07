import React, { useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Eye, Fish, CheckCircle2, AlertCircle } from 'lucide-react';

interface Stage3ExperimentProps {
  level: 'elementary' | 'middle' | 'high';
  onComplete: () => void;
}

export const Stage3Experiment: React.FC<Stage3ExperimentProps> = ({ level, onComplete }) => {
  const [animalView, setAnimalView] = useState<'human' | 'turtle' | 'fish'>('human');
  const [testedViews, setTestedViews] = useState<Set<string>>(new Set(['human']));

  const handleSelectView = (view: 'human' | 'turtle' | 'fish') => {
    soundEngine.playExperimentAction();
    setAnimalView(view);
    setTestedViews(prev => {
      const next = new Set(prev);
      next.add(view);
      if (next.size >= 2) {
        onComplete();
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Header */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-emerald-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Fish className="w-6 h-6 text-emerald-400 animate-pulse" />
          <div>
            <h4 className="font-bold text-emerald-300 text-base md:text-lg">실험: 먹이일까 쓰레기일까? 시각 비교</h4>
            <p className="text-xs md:text-sm text-slate-300">
              {level === 'elementary' && '바다거북과 물고기의 눈으로 보면 비닐봉지와 해파리가 얼마나 똑같아 보이는지 확인해 보세요!'}
              {level === 'middle' && '해양 동물의 시각적 굴절률 착각과 부착 조류의 DMS 후각 유인으로 인한 오음식 원리를 탐구합니다.'}
              {level === 'high' && '영양 단계 전이(Trophic Transfer) 및 유해 화학 첨가제(가소제)의 만성 생체 독성 기전을 분석합니다.'}
            </p>
          </div>
        </div>
      </div>

      {/* View Selector Tabs */}
      <div className="flex justify-center gap-2">
        <button
          onClick={() => handleSelectView('human')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition border ${
            animalView === 'human'
              ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>👤 사람의 눈 (선명함)</span>
        </button>

        <button
          onClick={() => handleSelectView('turtle')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition border ${
            animalView === 'turtle'
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <span>🐢 바다거북의 눈 (비닐 vs 해파리)</span>
        </button>

        <button
          onClick={() => handleSelectView('fish')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold transition border ${
            animalView === 'fish'
              ? 'bg-amber-600 border-amber-400 text-white shadow-lg shadow-amber-500/20'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
          }`}
        >
          <span>🐟 작은 물고기의 눈 (플라스틱 알갱이 vs 알)</span>
        </button>
      </div>

      {/* Visual Comparator Arena */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Plastic Object */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700 flex flex-col items-center">
          <span className="text-xs font-semibold text-rose-400 mb-2">
            {animalView === 'fish' ? '⚠️ 1차 미세플라스틱 알갱이' : '⚠️ 바다에 버려진 투명 비닐봉지'}
          </span>

          <div
            className={`w-full h-52 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
              animalView === 'human'
                ? 'bg-blue-950/70 border border-blue-500/30'
                : 'bg-teal-950/90 border border-emerald-500/50 blur-[1px]'
            }`}
          >
            {/* Visual object rendering */}
            {animalView === 'fish' ? (
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  />
                ))}
              </div>
            ) : (
              <div className="w-24 h-32 rounded-3xl bg-cyan-200/40 border-2 border-white/60 shadow-lg transform rotate-6 animate-pulse flex items-center justify-center text-xs text-cyan-200 font-bold">
                비닐봉지
              </div>
            )}

            {/* Scent overlay note */}
            {animalView !== 'human' && (
              <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/90 border border-emerald-400/40 px-2 py-1 rounded text-[11px] text-emerald-300 text-center font-mono">
                조류가 자라며 먹이 냄새(DMS)가 풍겨 식욕을 강하게 자극합니다!
              </div>
            )}
          </div>
        </div>

        {/* Right: Real Prey */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-slate-700 flex flex-col items-center">
          <span className="text-xs font-semibold text-emerald-400 mb-2">
            {animalView === 'fish' ? '✨ 물고기의 진짜 먹이 (물벼룩·물고기 알)' : '✨ 바다거북이 좋아하는 진짜 해파리'}
          </span>

          <div
            className={`w-full h-52 rounded-xl flex items-center justify-center relative overflow-hidden transition-all duration-500 ${
              animalView === 'human'
                ? 'bg-blue-950/70 border border-blue-500/30'
                : 'bg-teal-950/90 border border-emerald-500/50 blur-[1px]'
            }`}
          >
            {animalView === 'fish' ? (
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                  />
                ))}
              </div>
            ) : (
              <div className="w-24 h-32 rounded-3xl bg-pink-200/40 border-2 border-pink-100/60 shadow-lg transform -rotate-6 animate-pulse flex items-center justify-center text-xs text-pink-200 font-bold">
                진짜 해파리
              </div>
            )}

            {animalView !== 'human' && (
              <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/90 border border-emerald-400/40 px-2 py-1 rounded text-[11px] text-emerald-300 text-center font-mono">
                물속 시야에서는 왼쪽의 쓰레기와 모양·움직임이 거의 구별되지 않습니다!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Scientific Lab Study Box */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-amber-300 text-sm mb-1">
            🔬 실험실 연구가 밝혀낸 과학적 사실
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed">
            실험실 연구에서 미세플라스틱과 플라스틱 속 화학물질(가소제, 첨가제)은 해양 동물의
            <strong> 발달을 늦추고, 번식에 문제를 일으키며, 질병과 싸우는 면역력을 약화</strong>시킬 수 있다는 결과가 확인되었습니다.
          </p>
        </div>
      </div>
    </div>
  );
};
