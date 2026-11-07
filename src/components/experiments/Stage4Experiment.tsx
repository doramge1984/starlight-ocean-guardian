import React, { useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Flame, Droplets, CheckCircle2, Zap } from 'lucide-react';

interface Stage4ExperimentProps {
  level: 'elementary' | 'middle' | 'high';
  onComplete: () => void;
}

export const Stage4Experiment: React.FC<Stage4ExperimentProps> = ({ level, onComplete }) => {
  const [co2Level, setCo2Level] = useState<number>(420); // ppm
  const [hasInteracted, setHasInteracted] = useState<boolean>(false);

  // Derive pH and chemical values based on CO2 ppm
  // Pre-industrial: 280 ppm -> pH 8.2
  // Current: ~420 ppm -> pH 8.1
  // Extreme: 650 ppm -> pH 7.8
  const phValue = (8.2 - ((co2Level - 280) / 400) * 0.45).toFixed(2);
  const shellIntegrity = Math.max(15, Math.min(100, Math.round(100 - ((co2Level - 280) / 400) * 80)));
  const hIonIncrease = Math.round(((Math.pow(10, 8.2 - parseFloat(phValue))) - 1) * 100);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    soundEngine.playExperimentAction();
    setCo2Level(parseInt(e.target.value, 10));
    if (!hasInteracted) {
      setHasInteracted(true);
      onComplete();
    }
  };

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Intro */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-rose-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Droplets className="w-6 h-6 text-rose-400 animate-pulse" />
          <div>
            <h4 className="font-bold text-rose-300 text-base md:text-lg">실험: CO₂ 슬라이더와 해양 산성화</h4>
            <p className="text-xs md:text-sm text-slate-300">
              {level === 'elementary' && '이산화탄소 슬라이더를 올려보세요! 바닷물이 시큼해지면서 조개껍데기가 어떻게 되는지 확인해 보세요.'}
              {level === 'middle' && 'CO₂ 흡수로 인한 탄산 형성, 수소 이온(H⁺) 증가와 pH 저하, 탄산칼슘(CaCO₃) 형성 저해를 관찰하세요.'}
              {level === 'high' && '해양 무기 탄소 평형계(Inorganic Carbon System)의 화학 반응식과 탄산 이온(CO₃²⁻) 고갈 메커니즘을 분석하세요.'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Controls & Metrics */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-700 flex flex-col gap-5">
        {/* CO2 Slider */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Flame className="w-4 h-4 text-rose-400" />
              대기 중 이산화탄소 (CO₂) 농도 조절:
            </span>
            <span className="font-mono font-bold text-rose-400 text-base">
              {co2Level} ppm
            </span>
          </div>
          <input
            type="range"
            min="280"
            max="680"
            step="10"
            value={co2Level}
            onChange={handleSliderChange}
            className="w-full accent-rose-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>280 ppm (산업화 이전)</span>
            <span className="text-amber-400 font-bold">420 ppm (현재 기준)</span>
            <span className="text-rose-400">680 ppm (고배출 가상)</span>
          </div>
        </div>

        {/* Meters Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">해수 산성도 (pH)</span>
            <span className={`text-2xl font-bold font-mono ${parseFloat(phValue) <= 7.9 ? 'text-rose-400' : 'text-cyan-400'}`}>
              pH {phValue}
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {parseFloat(phValue) < 8.1 ? '🔻 산성화 진행 중 (더 산성)' : '표준 약알칼리성'}
            </span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">수소 이온(H⁺) 농도</span>
            <span className="text-2xl font-bold font-mono text-amber-400">
              +{hIonIncrease}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1">기준 대비 과잉 축적</span>
          </div>

          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 flex flex-col items-center">
            <span className="text-xs text-slate-400 mb-1">조개껍데기 튼튼함</span>
            <span className={`text-2xl font-bold font-mono ${shellIntegrity <= 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {shellIntegrity}%
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              {shellIntegrity <= 40 ? '⚠️ 골격 균열 및 용해 발생!' : '안정적인 탄산칼슘 껍데기'}
            </span>
          </div>
        </div>

        {/* Visual Shell Simulation */}
        <div className="w-full h-44 bg-slate-950 rounded-xl border border-slate-700 relative overflow-hidden flex items-center justify-center p-4">
          <div className="flex items-center gap-8">
            {/* Visual Shell */}
            <div className="relative flex flex-col items-center">
              <div
                className="w-24 h-24 rounded-full border-4 transition-all duration-300 flex items-center justify-center font-bold text-xs"
                style={{
                  borderColor: shellIntegrity > 50 ? '#38bdf8' : '#f43f5e',
                  backgroundColor: `rgba(244, 63, 94, ${1 - shellIntegrity / 100})`,
                  opacity: Math.max(0.3, shellIntegrity / 100),
                  transform: `scale(${0.7 + (shellIntegrity / 100) * 0.3})`,
                }}
              >
                <span className="text-white text-center">
                  조개껍데기<br />(CaCO₃)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 mt-2 font-mono">
                껍데기 두께: {(shellIntegrity * 0.05).toFixed(1)} mm
              </span>
            </div>

            {/* Microscopic chemical interaction explanation */}
            <div className="flex flex-col gap-1.5 text-xs text-slate-300 max-w-xs">
              <div className="flex items-center gap-2 text-cyan-300 font-semibold">
                <span>바다 흡수:</span>
                <span>공기 중 나온 CO₂의 약 30%</span>
              </div>
              <div className="text-[11px] text-slate-400">
                수소 이온(H⁺)이 탄산 이온(CO₃²⁻)을 가로채면서, 조개가 껍데기(탄산칼슘)를 만들 벽돌 재료가 급격히 부족해집니다.
              </div>
            </div>
          </div>
        </div>

        {/* High School Chemistry Reactions Step-by-Step */}
        {level === 'high' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 font-mono text-xs text-cyan-300 flex flex-col gap-1.5">
            <span className="font-bold text-amber-300 mb-1">
              [고등 화학] 해양 산성화 5단계 평형 반응식
            </span>
            <div>1) CO₂(g) ⇌ CO₂(aq) (대기 CO₂ 해수 용해)</div>
            <div>2) CO₂(aq) + H₂O ⇌ H₂CO₃ (탄산 수화 반응)</div>
            <div>3) H₂CO₃ ⇌ H⁺ + HCO₃⁻ (수소 이온 방출로 pH 강하)</div>
            <div>4) H⁺ + CO₃²⁻ ⇌ HCO₃⁻ (탄산 이온 고갈로 껍데기 합성 저해)</div>
            <div>5) CaCO₃(s) + H⁺ ⇌ Ca²⁺ + HCO₃⁻ (기존 탄산칼슘 골격 화학적 용해)</div>
          </div>
        )}
      </div>

      {/* Key Takeaway Banner */}
      <div className="bg-slate-900/90 p-4 rounded-xl border border-amber-500/40 flex items-start gap-3">
        <Zap className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-amber-300 text-sm mb-1">
            💡 핵심 결론: "바다 살리기는 에너지 절약과도 연결돼 있어요!"
          </h5>
          <p className="text-xs text-slate-300 leading-relaxed">
            플라스틱 쓰레기를 줍는 것만큼이나, 우리가 일상에서 <strong>전기를 아끼고 화석연료 사용을 줄여 이산화탄소 배출을 줄이는 것</strong>이 바다 산성화를 막고 산호초를 살리는 과학적 해결책입니다.
          </p>
        </div>
      </div>
    </div>
  );
};
