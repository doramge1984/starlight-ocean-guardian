import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import scienceData from '../data/science.json';
import { BookOpen, ChevronRight, X, Sparkles, Award } from 'lucide-react';

interface ScienceCardModalProps {
  stageId: number;
  initialLevel: 'elementary' | 'middle' | 'high';
  onClose: () => void;
  onProceedToExperiment?: () => void;
}

export const ScienceCardModal: React.FC<ScienceCardModalProps> = ({
  stageId,
  initialLevel,
  onClose,
  onProceedToExperiment,
}) => {
  const [level, setLevel] = useState<'elementary' | 'middle' | 'high'>(initialLevel);
  const [cardIndex, setCardIndex] = useState<number>(0);

  const stage = scienceData.stages.find((s) => s.id === stageId) || scienceData.stages[0];
  const card = stage.cards[cardIndex] || stage.cards[0];
  const levelData = card[level] as any;

  const handleNextLevel = () => {
    soundEngine.playExperimentAction();
    if (level === 'elementary') setLevel('middle');
    else if (level === 'middle') setLevel('high');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                {stage.title} • {stage.subTitle}
              </span>
              <h3 className="text-lg font-bold text-white">{card.title}</h3>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Level Selector Tabs */}
        <div className="px-5 pt-4 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/30">
          <span className="text-xs font-semibold text-slate-400">설명 수준 선택:</span>
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setLevel('elementary');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                level === 'elementary'
                  ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              🌱 초등
            </button>
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setLevel('middle');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                level === 'middle'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              🌿 중등
            </button>
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setLevel('high');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition border ${
                level === 'high'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
              }`}
            >
              🌳 고등
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col gap-4">
          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-cyan-950/50 border border-cyan-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-sm md:text-base font-semibold text-cyan-200 leading-relaxed">
              {levelData.summary}
            </p>
          </div>

          {/* Detailed Content */}
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60 text-xs md:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
            {levelData.content}
          </div>

          {/* Metaphor / Formula Highlight */}
          {levelData.analogy && (
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-300">
              💡 <strong>쉬운 비유:</strong> {levelData.analogy}
            </div>
          )}

          {levelData.formula && (
            <div className="bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 font-mono text-xs text-purple-300">
              ⚛️ <strong>화학식 및 관계식:</strong> {levelData.formula}
            </div>
          )}

          {/* Source Citation */}
          {card.sourceNote && (
            <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-2 font-mono">
              📚 근거 및 출처: {card.sourceNote}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl flex flex-wrap items-center justify-between gap-3">
          {/* Step up level button */}
          {level !== 'high' ? (
            <button
              onClick={handleNextLevel}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
            >
              <span>한 단계 더 깊이 보기 ({level === 'elementary' ? '🌿 중등 수준' : '🌳 고등 수준'})</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <span className="text-xs text-purple-400 font-mono">가장 심화된 고등 수준입니다</span>
          )}

          <div className="flex gap-2">
            {stage.cards.length > 1 && (
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  setCardIndex((prev) => (prev + 1) % stage.cards.length);
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
              >
                다음 카드 ({cardIndex + 1}/{stage.cards.length})
              </button>
            )}

            {onProceedToExperiment && (
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  onProceedToExperiment();
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition flex items-center gap-1.5"
              >
                <span>가상 실험실로 가기</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
