import React, { useState, useRef } from 'react';
import { soundEngine } from '../../audio/soundEngine';
import nudgesData from '../../data/nudges.json';
import { Gamepad2, Sparkles, Download, CheckCircle2, Briefcase, Award } from 'lucide-react';

interface Stage5DesignerProps {
  level: 'elementary' | 'middle' | 'high';
  onComplete: () => void;
  playerNickname: string;
}

const GENRES = [
  { id: 'runner', name: '🏃 달리기 (Runner)', desc: '장애물을 피하며 빠르게 해변을 달리는 액션' },
  { id: 'puzzle', name: '🧩 퍼즐 (Puzzle)', desc: '재질과 밀도에 맞게 쓰레기를 분류하는 퍼즐' },
  { id: 'care', name: '🐾 캐릭터 키우기 (Simulation)', desc: '깨끗해진 바다에서 바다거북과 수달을 돌보는 힐링' },
  { id: 'adventure', name: '🗺️ 탐험 (Adventure)', desc: '미지의 해저와 산호초를 탐사하며 비밀을 밝히는 모험' },
  { id: 'sports', name: '⚽ 스포츠 (Sports)', desc: '바다 동물들과 함께하는 클린 오션 비치발리볼' },
];

const SCIENCE_FACTS = [
  { id: 'density', title: '밀도와 부력', desc: '바닷물(1.03)보다 가벼운 플라스틱은 뜨고 무거운 것은 가라앉는다' },
  { id: 'polymer', title: '고분자와 미세플라스틱', desc: '자연에서 사라지지 않고 5mm 미만의 미세플라스틱으로 영구 잔류한다' },
  { id: 'ecosystem', title: '해양 생물 오음식 & 유령 그물', desc: '비닐봉지를 해파리로 착각해 삼키고, 버려진 어구에 얽매인다' },
  { id: 'acidification', title: '해양 산성화와 에너지', desc: 'CO₂ 흡수로 탄산이 늘어나 산호와 조개껍데기가 녹고 성장이 멈춘다' },
];

export const Stage5Designer: React.FC<Stage5DesignerProps> = ({ level, onComplete, playerNickname }) => {
  const [selectedGenre, setSelectedGenre] = useState<string>('adventure');
  const [selectedScience, setSelectedScience] = useState<string>('ecosystem');
  const [selectedNudges, setSelectedNudges] = useState<string[]>(['nudge_tree', 'nudge_quest']);
  const [gameTitle, setGameTitle] = useState<string>('별빛 바다 구출 대작전');
  const [activeTab, setActiveTab] = useState<'design' | 'careers'>('design');
  const [cardGenerated, setCardGenerated] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const toggleNudge = (id: string) => {
    soundEngine.playExperimentAction();
    if (selectedNudges.includes(id)) {
      if (selectedNudges.length > 1) {
        setSelectedNudges(selectedNudges.filter(n => n !== id));
      }
    } else {
      if (selectedNudges.length < 2) {
        setSelectedNudges([...selectedNudges, id]);
      } else {
        setSelectedNudges([selectedNudges[1], id]);
      }
    }
  };

  const handleGenerateAndSave = () => {
    soundEngine.playBadgeFanfare();
    setCardGenerated(true);
    onComplete();

    // Render Canvas Card
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 1200, 700);
    bgGrad.addColorStop(0, '#09152b');
    bgGrad.addColorStop(1, '#062d47');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1200, 700);

    // Decorative glowing border
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 1160, 660);

    // Header Badge
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText('⭐ 나의 그린 게임 기획 카드 (Green Game Design Card) ⭐', 60, 80);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '24px sans-serif';
    ctx.fillText(`기획자: ${playerNickname || '별빛 바다 지킴이'} | 게임문화재단 게임리터러시`, 60, 125);

    // Title Box
    ctx.fillStyle = '#0f2942';
    ctx.fillRect(60, 160, 1080, 90);
    ctx.strokeStyle = '#67e8f9';
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 160, 1080, 90);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 42px sans-serif';
    ctx.fillText(`🎮 게임 이름: ${gameTitle}`, 90, 220);

    // 3 Columns: Genre, Science, Nudges
    ctx.fillStyle = '#0b1d33';
    ctx.fillRect(60, 280, 340, 320);
    ctx.fillRect(430, 280, 340, 320);
    ctx.fillRect(800, 280, 340, 320);

    // Col 1: Genre
    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('1. 선택한 장르', 80, 325);
    const genreObj = GENRES.find(g => g.id === selectedGenre);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(genreObj?.name || '', 80, 380);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    wrapText(ctx, genreObj?.desc || '', 80, 420, 300, 28);

    // Col 2: Science Fact
    ctx.fillStyle = '#34d399';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('2. 연계 과학 사실', 450, 325);
    const sciObj = SCIENCE_FACTS.find(s => s.id === selectedScience);
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(sciObj?.title || '', 450, 380);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    wrapText(ctx, sciObj?.desc || '', 450, 420, 300, 28);

    // Col 3: Green Nudges
    ctx.fillStyle = '#f59e0b';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('3. 그린 넛지 장치 (2개)', 820, 325);
    selectedNudges.forEach((nid, i) => {
      const nudgeObj = nudgesData.nudges.find(n => n.id === nid);
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`${nudgeObj?.icon} ${nudgeObj?.title}`, 820, 380 + i * 110);
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '18px sans-serif';
      wrapText(ctx, nudgeObj?.tagline || '', 820, 410 + i * 110, 300, 24);
    });

    // Footer motto
    ctx.fillStyle = '#67e8f9';
    ctx.font = 'italic 22px sans-serif';
    ctx.fillText('“좋은 게임은 세상을 바꾸는 힘이 있고, 끝날 때를 압니다.”', 60, 640);

    // Trigger download
    const link = document.createElement('a');
    link.download = `나의_그린게임_기획카드_${playerNickname || '지킴이'}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  function wrapText(context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = context.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        context.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, y);
  }

  return (
    <div className="flex flex-col gap-5 text-slate-100">
      {/* Intro Header */}
      <div className="bg-slate-800/80 p-4 rounded-xl border border-cyan-500/30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 text-cyan-400 animate-bounce" />
          <div>
            <h4 className="font-bold text-cyan-300 text-base md:text-lg">
              스테이지 5: 등대 – 그린 게임 디자이너
            </h4>
            <p className="text-xs md:text-sm text-slate-300">
              세계의 게임 회사들도 게임 속에 환경을 지키는 장치를 넣고 있어요. 이제 여러분이 직접 친환경 게임을 설계할 차례입니다!
            </p>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('design')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition border ${
              activeTab === 'design'
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            🎮 게임 기획 워크벤치
          </button>
          <button
            onClick={() => setActiveTab('careers')}
            className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition border ${
              activeTab === 'careers'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            💼 미래 진로 카드 (3종)
          </button>
        </div>
      </div>

      {activeTab === 'design' ? (
        <div className="flex flex-col gap-4">
          {/* Game Title Input */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-300">
              나의 그린 게임 이름 정하기:
            </label>
            <input
              type="text"
              value={gameTitle}
              onChange={(e) => setGameTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-cyan-500/40 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-cyan-400"
              placeholder="예: 별빛 바다 구출 대작전"
            />
          </div>

          {/* Step 1: Genre */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
            <span className="text-xs font-semibold text-cyan-300">
              Step 1. 좋아하는 게임 장르 선택 (1개):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {GENRES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => {
                    soundEngine.playExperimentAction();
                    setSelectedGenre(g.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedGenre === g.id
                      ? 'border-cyan-400 bg-cyan-950/60 shadow-md shadow-cyan-500/20'
                      : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold text-xs md:text-sm text-white mb-1">{g.name}</div>
                  <div className="text-[11px] text-slate-400">{g.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Science Fact */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
            <span className="text-xs font-semibold text-emerald-300">
              Step 2. 게임에 반영할 오늘 배운 과학 사실 선택 (1개):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SCIENCE_FACTS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    soundEngine.playExperimentAction();
                    setSelectedScience(s.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedScience === s.id
                      ? 'border-emerald-400 bg-emerald-950/60 shadow-md shadow-emerald-500/20'
                      : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750'
                  }`}
                >
                  <div className="font-bold text-xs md:text-sm text-white mb-1">{s.title}</div>
                  <div className="text-[11px] text-slate-400">{s.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Green Nudges */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold text-amber-300">
                Step 3. 게임에 탑재할 '그린 넛지(Green Nudge)' 장치 선택 (2개):
              </span>
              <span className="text-xs text-amber-400 font-mono">
                {selectedNudges.length} / 2개 선택됨
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {nudgesData.nudges.map((n) => {
                const isSelected = selectedNudges.includes(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => toggleNudge(n.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-950/60 shadow-md shadow-amber-500/20'
                        : 'border-slate-700 bg-slate-800/80 hover:bg-slate-750'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs md:text-sm text-white">
                        {n.icon} {n.title}
                      </span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </div>
                    <div className="text-[11px] text-slate-300 font-medium mb-1">{n.tagline}</div>
                    <div className="text-[10px] text-slate-400">{n.mechanism}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Generate & Download Card Button */}
          <div className="flex justify-center mt-2">
            <button
              onClick={handleGenerateAndSave}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm md:text-base shadow-xl shadow-cyan-500/30 transform hover:scale-102 transition"
            >
              <Download className="w-5 h-5" />
              <span>나의 그린 게임 기획 카드 완성 및 이미지로 저장 (+150 보너스)</span>
            </button>
          </div>
        </div>
      ) : (
        /* Career Cards */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nudgesData.careers.map((career) => (
            <div
              key={career.id}
              className="bg-slate-900/90 rounded-2xl p-5 border border-purple-500/30 flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-400/50 flex items-center justify-center text-purple-300 mb-3">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-white text-base mb-1">{career.title}</h5>
                <p className="text-xs font-semibold text-purple-300 mb-3">{career.subtitle}</p>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{career.description}</p>
              </div>

              <div className="border-t border-slate-800 pt-3">
                <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                  필요한 핵심 역량:
                </span>
                <div className="flex flex-wrap gap-1">
                  {career.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded bg-purple-950/80 text-purple-200 border border-purple-700/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
