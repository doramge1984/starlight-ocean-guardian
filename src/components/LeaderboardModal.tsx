import React, { useState, useEffect } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { fetchTopScores, fetchTopQuizMasters, fetchClassRankings, type ScoreRecord, type ClassStats } from '../firebase';
import { Trophy, Users, Award, X, Sparkles, Filter } from 'lucide-react';

interface LeaderboardModalProps {
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'individual' | 'class' | 'quizMaster'>('individual');
  const [schoolFilter, setSchoolFilter] = useState<'all' | 'elementary' | 'middle' | 'high'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week'>('all');

  const [topScores, setTopScores] = useState<ScoreRecord[]>([]);
  const [quizMasters, setQuizMasters] = useState<ScoreRecord[]>([]);
  const [classRankings, setClassRankings] = useState<ClassStats[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, [schoolFilter, timeFilter, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'individual') {
        const data = await fetchTopScores(schoolFilter === 'all' ? undefined : schoolFilter, timeFilter);
        setTopScores(data);
      } else if (activeTab === 'quizMaster') {
        const data = await fetchTopQuizMasters();
        setQuizMasters(data);
      } else if (activeTab === 'class') {
        const data = await fetchClassRankings();
        setClassRankings(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getAnimalEmoji = (animal: string) => {
    switch (animal) {
      case 'rabbit': return '🐰 토끼';
      case 'fox': return '🦊 여우';
      case 'bear': return '🐻 곰';
      case 'penguin': return '🐧 펭귄';
      case 'otter': return '🦦 수달';
      default: return '🌊 바다친구';
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'elementary': return '🌱 초등';
      case 'middle': return '🌿 중등';
      case 'high': return '🌳 고등';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-amber-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-950 border border-amber-500/50 flex items-center justify-center text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-amber-400 font-semibold tracking-wider">
                실시간 랭킹 시스템
              </span>
              <h3 className="text-lg font-bold text-white">별빛 바다 명예의 전당</h3>
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

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-1.5">
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setActiveTab('individual');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeTab === 'individual'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🏆 개인 TOP 20
            </button>
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setActiveTab('class');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeTab === 'class'
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🏫 반별 순위
            </button>
            <button
              onClick={() => {
                soundEngine.playExperimentAction();
                setActiveTab('quizMaster');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                activeTab === 'quizMaster'
                  ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                  : 'bg-slate-800 border-slate-700 text-slate-300'
              }`}
            >
              🧠 '과학 박사' TOP 10
            </button>
          </div>

          {/* Sub Filters for Individual Tab */}
          {activeTab === 'individual' && (
            <div className="flex gap-1">
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-[11px] rounded-lg px-2 py-1 text-slate-200"
              >
                <option value="all">전체 학교급</option>
                <option value="elementary">초등학교</option>
                <option value="middle">중학교</option>
                <option value="high">고등학교</option>
              </select>

              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 text-[11px] rounded-lg px-2 py-1 text-slate-200"
              >
                <option value="all">전체 기간</option>
                <option value="week">이번 주</option>
              </select>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto max-h-[60vh] flex flex-col gap-2">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-sm">기록을 불러오는 중...</div>
          ) : activeTab === 'individual' ? (
            topScores.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">아직 등록된 기록이 없습니다.</div>
            ) : (
              topScores.map((record, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    index === 0
                      ? 'bg-amber-950/60 border-amber-400 shadow-md shadow-amber-500/20'
                      : index === 1
                      ? 'bg-slate-800/80 border-slate-600'
                      : index === 2
                      ? 'bg-amber-950/30 border-amber-800'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                        index === 0
                          ? 'bg-amber-400 text-slate-950'
                          : index === 1
                          ? 'bg-slate-300 text-slate-950'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">{record.nickname}</span>
                        <span className="text-xs">{getAnimalEmoji(record.animal)}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {getLevelLabel(record.schoolLevel)}
                        </span>
                        {record.classCode && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 font-mono">
                            {record.classCode}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        클리어: {record.stagesCleared}/5 스테이지 • 정답률 {record.quizAccuracy}%
                      </div>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-base text-amber-400">
                    {record.score.toLocaleString()}점
                  </span>
                </div>
              ))
            )
          ) : activeTab === 'class' ? (
            classRankings.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-sm">등록된 반 데이터가 없습니다.</div>
            ) : (
              classRankings.map((cls, index) => (
                <div
                  key={index}
                  className="p-3.5 rounded-2xl border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-cyan-800 text-cyan-200 flex items-center justify-center font-bold text-xs">
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-bold text-sm text-white font-mono flex items-center gap-2">
                        <span>반 코드: {cls.classCode}</span>
                        <span className="text-xs font-sans text-cyan-300 font-normal">
                          (서약 참여 {cls.pledgeCount}명)
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        전체 학생들이 합심하여 바다를 되살리는 중!
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">누적 수거량</span>
                    <span className="font-mono font-bold text-base text-cyan-300">
                      {cls.totalCollected.toLocaleString()}개
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            quizMasters.map((qm, index) => (
              <div
                key={index}
                className="p-3.5 rounded-2xl border border-purple-500/30 bg-purple-950/30 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-purple-800 text-purple-200 flex items-center justify-center font-bold text-xs">
                    {index + 1}
                  </span>
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{qm.nickname}</span>
                      <span className="text-xs">{getAnimalEmoji(qm.animal)}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      총점 {qm.score.toLocaleString()}점 • {getLevelLabel(qm.schoolLevel)}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400 block">첫 시도 정답률</span>
                  <span className="font-mono font-bold text-base text-purple-300">
                    {qm.quizAccuracy}%
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
