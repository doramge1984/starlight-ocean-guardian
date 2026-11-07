import React, { useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Sun, Waves, Search, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface Stage2ExperimentProps {
  level: 'elementary' | 'middle' | 'high';
  onComplete: () => void;
}

export const Stage2Experiment: React.FC<Stage2ExperimentProps> = ({ level, onComplete }) => {
  const [uvExposure, setUvExposure] = useState<number>(0);
  const [waveStress, setWaveStress] = useState<number>(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1); // 1 = macro, 2 = micro, 3 = molecular

  const degradationScore = uvExposure + waveStress;
  const isMicroplasticStage = degradationScore >= 4;

  const handleApplyUV = () => {
    soundEngine.playExperimentAction();
    setUvExposure((prev) => Math.min(prev + 1, 3));
    if (degradationScore + 1 >= 4 && zoomLevel >= 2) {
      onComplete();
    }
  };

  const handleApplyWave = () => {
    soundEngine.playExperimentAction();
    setWaveStress((prev) => Math.min(prev + 1, 3));
    if (degradationScore + 1 >= 4 && zoomLevel >= 2) {
      onComplete();
    }
  };

  const handleZoomChange = (z: number) => {
    soundEngine.playExperimentAction();
    setZoomLevel(z);
    if (degradationScore >= 4 && z >= 2) {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Intro */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-amber-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sun className="w-6 h-6 text-amber-400 animate-spin" />
          <div>
            <h4 className="font-bold text-amber-300 text-base md:text-lg">실험: 사슬 끊기와 미세플라스틱의 진실</h4>
            <p className="text-xs md:text-sm text-slate-300">
              {level === 'elementary' && '햇빛과 파도 버튼을 눌러 큰 플라스틱이 어떻게 쪼개지는지 보고, 돋보기로 분자 사슬을 관찰하세요!'}
              {level === 'middle' && '자외선과 물리적 마찰로 5mm 미만의 2차 미세플라스틱이 되지만, 고분자 사슬은 보존됨을 확인하세요.'}
              {level === 'high' && '자외선 광산화(Photo-oxidation)와 취성 파괴 메커니즘을 시뮬레이션하고 C-C 주사슬 결합 안정성을 검증하세요.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Simulation Viewport */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700 flex flex-col items-center">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between w-full mb-4 gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyUV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/80 hover:bg-amber-600 text-xs md:text-sm font-semibold transition border border-amber-400/50"
            >
              <Sun className="w-4 h-4 text-amber-200" />
              <span>☀️ 햇빛(UV 자외선) 쬐기 ({uvExposure}/3)</span>
            </button>
            <button
              onClick={handleApplyWave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-600 text-xs md:text-sm font-semibold transition border border-cyan-400/50"
            >
              <Waves className="w-4 h-4 text-cyan-200" />
              <span>🌊 거센 파도 마찰 가하기 ({waveStress}/3)</span>
            </button>
          </div>

          {/* Zoom tabs */}
          <div className="flex items-center bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleZoomChange(1)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                zoomLevel === 1 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 보통 눈
            </button>
            <button
              onClick={() => handleZoomChange(2)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                zoomLevel === 2 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🔬 돋보기 (5mm 자)
            </button>
            <button
              onClick={() => handleZoomChange(3)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                zoomLevel === 3 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚛️ 분자 사슬 확대
            </button>
          </div>
        </div>

        {/* Visual Canvas Area */}
        <div className="w-full h-64 bg-slate-950 rounded-xl border border-slate-700 relative overflow-hidden flex items-center justify-center p-4">
          {/* Zoom Level 1: Macro View */}
          {zoomLevel === 1 && (
            <div className="flex flex-col items-center justify-center">
              {degradationScore === 0 && (
                <div className="w-28 h-36 bg-amber-500 rounded-2xl border-4 border-amber-300 shadow-xl flex items-center justify-center text-slate-950 font-bold text-sm">
                  큰 플라스틱 통
                </div>
              )}
              {degradationScore > 0 && degradationScore < 4 && (
                <div className="relative">
                  <div className="w-28 h-36 bg-amber-600 rounded-2xl border-2 border-dashed border-red-400/80 shadow-lg flex items-center justify-center text-slate-100 font-semibold text-xs text-center p-2">
                    ⚡ 표면 균열 및 크랙 발생!
                  </div>
                  <div className="text-center text-xs text-amber-300 mt-2">
                    햇빛과 파도로 약해지고 있습니다...
                  </div>
                </div>
              )}
              {degradationScore >= 4 && (
                <div className="flex flex-wrap gap-2 max-w-xs justify-center items-center">
                  {[...Array(16)].map((_, i) => (
                    <div
                      key={i}
                      className="w-3.5 h-3.5 bg-amber-400 rounded-sm shadow-sm animate-pulse"
                      style={{ animationDelay: `${i * 80}ms` }}
                    />
                  ))}
                  <div className="w-full text-center text-xs text-rose-300 font-semibold mt-3">
                    작고 부서진 파편들로 쪼개졌습니다! 상단 [돋보기]를 켜서 크기를 재어 보세요.
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Zoom Level 2: Micro View with 5mm ruler */}
          {zoomLevel === 2 && (
            <div className="flex flex-col items-center justify-center w-full max-w-md">
              <div className="flex items-center gap-6 mb-4">
                {/* Pencil eraser comparison */}
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-pink-400 border border-white flex items-center justify-center text-[10px] text-slate-950 font-bold">
                    지우개
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1">연필 지우개 (약 5mm)</span>
                </div>

                <span className="text-lg font-bold text-slate-500">VS</span>

                {/* Microplastic particle */}
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 bg-amber-400 rounded-sm border border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center justify-center text-[9px] text-slate-950 font-bold">
                    파편
                  </div>
                  <span className="text-[11px] text-amber-300 font-semibold mt-1">
                    미세플라스틱 (&lt; 5mm)
                  </span>
                </div>
              </div>

              {/* 5mm Ruler Overlay */}
              <div className="w-full bg-slate-900 border border-cyan-500/40 rounded-lg p-2.5 flex flex-col gap-1">
                <div className="flex justify-between items-center text-xs font-mono text-cyan-300">
                  <span>| 0mm</span>
                  <span>| 2.5mm</span>
                  <span className="font-bold text-amber-400">| 5.0mm (미세플라스틱 기준)</span>
                </div>
                <div className="w-full h-2 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500 rounded" />
              </div>
            </div>
          )}

          {/* Zoom Level 3: Molecular Chain View */}
          {zoomLevel === 3 && (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="text-xs text-cyan-300 font-mono mb-3">
                🔬 초고배율 원자 구조 관찰: 탄소-탄소(C-C) 공유결합 고분자 사슬
              </div>
              <div className="flex items-center gap-1 overflow-x-auto py-2">
                {['C', 'C', 'C', 'C', 'C', 'C', 'C', 'C'].map((atom, i) => (
                  <React.Fragment key={i}>
                    <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-cyan-400 flex items-center justify-center font-mono font-bold text-cyan-300 shadow-md">
                      {atom}
                    </div>
                    {i < 7 && <div className="w-5 h-1 bg-cyan-400" />}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs text-center max-w-sm">
                ✨ 겉모습은 잘게 부서졌지만, <strong>분자 사슬은 끊어지지 않고 온전히 유지</strong>되고 있습니다!
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Myth Debunking Card */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-rose-500/30 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-rose-300 text-sm mb-1">
            ⚠️ 오해 바로잡기: "플라스틱이 분해되는 데 몇백 년 걸린다?"
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed">
            "몇백 년 지나면 마법처럼 사라진다"는 말은 과학적으로 정확하지 않습니다. 플라스틱은 햇빛, 물, 미생물, 온도, 장소에 따라 부서지는 속도가 다르며, <strong>완전히 사라지는(생분해되는) 것이 아니라 눈에 보이지 않을 만큼 미세한 조각(미세플라스틱)으로 쪼개진 채 영구히 바다에 남을 수 있습니다.</strong>
          </p>
        </div>
      </div>
    </div>
  );
};
