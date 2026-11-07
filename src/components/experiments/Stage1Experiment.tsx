import React, { useState } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import { Waves, CheckCircle2, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface Stage1ExperimentProps {
  level: 'elementary' | 'middle' | 'high';
  onComplete: () => void;
}

interface TestItem {
  id: string;
  name: string;
  material: string;
  density: number;
  color: string;
}

const ITEMS: TestItem[] = [
  { id: 'pe', name: '비닐봉지 (PE)', material: '폴리에틸렌', density: 0.92, color: 'bg-cyan-500' },
  { id: 'pp', name: '병뚜껑 (PP)', material: '폴리프로필렌', density: 0.90, color: 'bg-amber-500' },
  { id: 'pet', name: '음료병 (PET)', material: '폴리에틸렌 테레프탈레이트', density: 1.38, color: 'bg-blue-500' },
  { id: 'pvc', name: '배관 파편 (PVC)', material: '폴리염화비닐', density: 1.40, color: 'bg-slate-400' },
  { id: 'ps', name: '스티로폼 (EPS)', material: '발포 폴리스티렌', density: 0.05, color: 'bg-slate-100 text-slate-800' },
];

export const Stage1Experiment: React.FC<Stage1ExperimentProps> = ({ level, onComplete }) => {
  const [freshTankItem, setFreshTankItem] = useState<TestItem | null>(null);
  const [saltTankItem, setSaltTankItem] = useState<TestItem | null>(null);
  const [biofoulingActive, setBiofoulingActive] = useState(false);
  const [testedCount, setTestedCount] = useState<Set<string>>(new Set());

  const handleDropItem = (item: TestItem, tank: 'fresh' | 'salt') => {
    soundEngine.playExperimentAction();
    if (tank === 'fresh') setFreshTankItem(item);
    if (tank === 'salt') setSaltTankItem(item);

    setTestedCount(prev => {
      const next = new Set(prev);
      next.add(item.id);
      if (next.size >= 3) {
        onComplete();
      }
      return next;
    });
  };

  const getEffectiveDensity = (item: TestItem | null) => {
    if (!item) return 0;
    return biofoulingActive ? item.density + 0.18 : item.density;
  };

  const freshWaterDensity = 1.00;
  const saltWaterDensity = 1.03;

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Intro instruction */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Waves className="w-6 h-6 text-cyan-400 animate-pulse" />
          <div>
            <h4 className="font-bold text-cyan-300 text-base md:text-lg">실험: 뜰까 가라앉을까 수조</h4>
            <p className="text-xs md:text-sm text-slate-300">
              {level === 'elementary' && '플라스틱을 민물과 바닷물 수조에 넣어 보세요! 어떤 것이 뜨고 가라앉을까요?'}
              {level === 'middle' && '담수(1.00g/cm³)와 해수(약 1.03g/cm³)의 밀도 차이에 따른 부유·침강을 관찰하세요.'}
              {level === 'high' && '유체 정역학적 부력과 고분자 밀도(ρ)를 비교 분석하고 생물 부착(Biofouling) 효과를 검증하세요.'}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            soundEngine.playExperimentAction();
            setBiofoulingActive(!biofoulingActive);
          }}
          className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition border ${
            biofoulingActive
              ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-500/30'
              : 'bg-slate-700 hover:bg-slate-600 border-slate-500 text-slate-200'
          }`}
        >
          {biofoulingActive ? '🌿 생물 부착 활성화 중 (무거워짐)' : '🌱 생물 부착(Biofouling) 시험'}
        </button>
      </div>

      {/* Tanks Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Freshwater Tank (1.00) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-blue-500/30 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-blue-400 text-sm">💧 민물 (담수) 수조</span>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono">
              밀도 기준선: 1.00 g/cm³
            </span>
          </div>

          {/* Visual Tank */}
          <div className="w-full h-48 bg-gradient-to-b from-blue-900/20 via-blue-800/40 to-blue-950/80 rounded-xl border-2 border-blue-400/40 relative overflow-hidden flex flex-col justify-between p-2">
            {/* Water Surface */}
            <div className="absolute top-2 left-0 right-0 h-1 bg-cyan-300/60 shadow-[0_0_10px_rgba(103,232,249,0.8)]" />

            {/* Placed Item Position */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {freshTankItem ? (
                <div
                  className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-700 flex items-center gap-2 ${
                    freshTankItem.color
                  } ${
                    getEffectiveDensity(freshTankItem) < freshWaterDensity
                      ? 'absolute top-3 transform translate-y-0 text-white'
                      : 'absolute bottom-3 transform translate-y-0 text-white'
                  }`}
                >
                  <span>{freshTankItem.name}</span>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded">
                    {getEffectiveDensity(freshTankItem).toFixed(2)} g/cm³
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">아래에서 플라스틱을 선택하세요</span>
              )}
            </div>

            {/* Bottom ground */}
            <div className="text-[11px] text-blue-300/70 text-center font-mono">
              {freshTankItem
                ? getEffectiveDensity(freshTankItem) < freshWaterDensity
                  ? '✨ 수면에 뜸 (밀도 < 1.00)'
                  : '⬇️ 바닥으로 가라앉음 (밀도 > 1.00)'
                : '수조 바닥'}
            </div>
          </div>
        </div>

        {/* Saltwater Tank (1.03) */}
        <div className="bg-slate-900/90 rounded-2xl p-4 border border-cyan-500/40 flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <span className="font-bold text-cyan-400 text-sm">🌊 바닷물 (해수) 수조</span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono">
              밀도 기준선: 약 1.03 g/cm³
            </span>
          </div>

          {/* Visual Tank */}
          <div className="w-full h-48 bg-gradient-to-b from-cyan-950/20 via-cyan-900/40 to-cyan-950/90 rounded-xl border-2 border-cyan-400/50 relative overflow-hidden flex flex-col justify-between p-2">
            {/* Water Surface with bioluminescence sparkle */}
            <div className="absolute top-2 left-0 right-0 h-1.5 bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.9)]" />

            {/* Placed Item Position */}
            <div className="relative w-full h-full flex flex-col items-center justify-center">
              {saltTankItem ? (
                <div
                  className={`px-4 py-2 rounded-xl font-bold shadow-lg transition-all duration-700 flex items-center gap-2 ${
                    saltTankItem.color
                  } ${
                    getEffectiveDensity(saltTankItem) < saltWaterDensity
                      ? 'absolute top-3 transform translate-y-0 text-white'
                      : 'absolute bottom-3 transform translate-y-0 text-white'
                  }`}
                >
                  <span>{saltTankItem.name}</span>
                  <span className="text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded">
                    {getEffectiveDensity(saltTankItem).toFixed(2)} g/cm³
                  </span>
                </div>
              ) : (
                <span className="text-slate-500 text-xs">아래에서 플라스틱을 선택하세요</span>
              )}
            </div>

            {/* Bottom ground */}
            <div className="text-[11px] text-cyan-300/80 text-center font-mono">
              {saltTankItem
                ? getEffectiveDensity(saltTankItem) < saltWaterDensity
                  ? '✨ 바닷물 표면에 뜸 (밀도 < 1.03)'
                  : '⬇️ 해저 바닥으로 퇴적됨 (밀도 > 1.03)'
                : '해저 바닥'}
            </div>
          </div>
        </div>
      </div>

      {/* Selectable Items */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-200">
            실험할 플라스틱 조각 선택 (클릭하여 양쪽 수조에 투입):
          </span>
          <span className="text-xs text-cyan-400">
            완료: {testedCount.size} / 3종류 이상
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
          {ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleDropItem(item, 'fresh');
                handleDropItem(item, 'salt');
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between hover:scale-102 ${
                freshTankItem?.id === item.id
                  ? 'border-cyan-400 bg-cyan-950/60 shadow-md shadow-cyan-500/20'
                  : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs md:text-sm text-white">{item.name}</span>
                {testedCount.has(item.id) && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
              </div>
              <div className="text-[11px] text-slate-400 mb-1">{item.material}</div>
              <div className="text-[11px] font-mono text-cyan-300 font-semibold">
                밀도: {item.density} g/cm³
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Density Bar Graph Comparison */}
      <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 flex flex-col gap-2">
        <span className="text-xs font-semibold text-slate-300">
          📊 밀도 막대그래프 비교 (기준선: 물 1.00g/cm³, 바닷물 약 1.03g/cm³)
        </span>
        <div className="relative w-full h-8 bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          {/* 1.00 fresh water line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-blue-400 z-10"
            style={{ left: `${(1.00 / 1.6) * 100}%` }}
          >
            <span className="absolute -top-5 -left-6 text-[10px] text-blue-300 font-mono font-bold">
              물 1.00
            </span>
          </div>
          {/* 1.03 salt water line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10"
            style={{ left: `${(1.03 / 1.6) * 100}%` }}
          >
            <span className="absolute -top-5 -left-4 text-[10px] text-cyan-300 font-mono font-bold">
              바닷물 1.03
            </span>
          </div>

          {/* Current selected item bar */}
          {saltTankItem && (
            <div
              className={`h-full transition-all duration-500 ${saltTankItem.color}`}
              style={{
                width: `${(getEffectiveDensity(saltTankItem) / 1.6) * 100}%`,
              }}
            />
          )}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono px-1">
          <span>0.0 g/cm³</span>
          <span>0.5</span>
          <span>1.0</span>
          <span>1.5</span>
          <span>1.6 g/cm³</span>
        </div>
      </div>
    </div>
  );
};
