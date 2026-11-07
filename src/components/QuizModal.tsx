import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import scienceData from '../data/science.json';
import { HelpCircle, CheckCircle2, RotateCcw, Award, Sparkles, ChevronRight, Zap } from 'lucide-react';

interface QuizModalProps {
  stageId: number;
  initialLevel: 'elementary' | 'middle' | 'high';
  onClose: () => void;
  onCorrectAnswer: (isFirstAttempt: boolean) => void;
  onStageClear: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  stageId,
  initialLevel,
  onClose,
  onCorrectAnswer,
  onStageClear,
}) => {
  const [level, setLevel] = useState<'elementary' | 'middle' | 'high'>(initialLevel);
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [firstAttemptMap, setFirstAttemptMap] = useState<Record<number, boolean>>({});

  // Challenge mode
  const [isChallengeMode, setIsChallengeMode] = useState<boolean>(false);
  const [challengeAnswered, setChallengeAnswered] = useState<boolean>(false);
  const [challengeCorrect, setChallengeCorrect] = useState<boolean>(false);

  const stage = scienceData.stages.find((s) => s.id === stageId) || scienceData.stages[0];
  const totalQuestions = stage.quiz.length;
  const currentQuizItem = stage.quiz[questionIdx] || stage.quiz[0];
  const qData = currentQuizItem[level] as any;
  const challengeData = currentQuizItem.challenge;

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);

    const isFirst = firstAttemptMap[questionIdx] === undefined;
    if (isFirst) {
      setFirstAttemptMap((prev) => ({ ...prev, [questionIdx]: idx === qData.correctIndex }));
    }

    if (idx === qData.correctIndex) {
      setIsCorrect(true);
      soundEngine.playQuizCorrect();
      onCorrectAnswer(isFirst);
    } else {
      setIsCorrect(false);
      soundEngine.playQuizRetry();
    }
  };

  const handleRetry = () => {
    soundEngine.playQuizRetry();
    setSelectedOption(null);
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const handleNextQuestion = () => {
    soundEngine.playExperimentAction();
    if (questionIdx + 1 < totalQuestions) {
      setQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setIsChallengeMode(false);
      setChallengeAnswered(false);
    } else {
      // Stage Cleared!
      soundEngine.playBadgeFanfare();
      onStageClear();
    }
  };

  const handleChallengeOption = (idx: number) => {
    if (challengeAnswered) return;
    setChallengeAnswered(true);
    if (idx === challengeData.correctIndex) {
      setChallengeCorrect(true);
      soundEngine.playQuizCorrect();
      onCorrectAnswer(true);
    } else {
      setChallengeCorrect(false);
      soundEngine.playQuizRetry();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                {stage.title} • 바다 퀴즈 ({questionIdx + 1}/{totalQuestions})
              </span>
              <h3 className="text-lg font-bold text-white">
                {isChallengeMode ? '🔥 윗 단계 도전 문제' : `문제 ${questionIdx + 1}`}
              </h3>
            </div>
          </div>

          {/* Level Switcher */}
          {!isChallengeMode && (
            <div className="flex gap-1">
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  setLevel('elementary');
                  handleRetry();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                  level === 'elementary'
                    ? 'bg-emerald-600 border-emerald-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🌱 초등
              </button>
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  setLevel('middle');
                  handleRetry();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                  level === 'middle'
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🌿 중등
              </button>
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  setLevel('high');
                  handleRetry();
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition border ${
                  level === 'high'
                    ? 'bg-purple-600 border-purple-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                🌳 고등
              </button>
            </div>
          )}
        </div>

        {/* Question Content */}
        <div className="p-6 flex flex-col gap-4">
          {!isChallengeMode ? (
            <>
              {/* Question Text */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {qData.question}
                </p>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5">
                {qData.options.map((opt: string, idx: number) => {
                  let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750';
                  if (isAnswered) {
                    if (idx === qData.correctIndex) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-md shadow-emerald-500/20';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-950/80 border-rose-400 text-rose-300';
                    } else {
                      btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(idx)}
                      className={`p-3.5 rounded-xl border text-left font-medium text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{idx + 1}. {opt}</span>
                      {isAnswered && idx === qData.correctIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Explanation */}
              {isAnswered && (
                <div
                  className={`p-4 rounded-2xl border flex flex-col gap-2 ${
                    isCorrect
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                      : 'bg-amber-950/60 border-amber-500/40 text-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {isCorrect ? (
                      <>
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        <span>정답입니다! 바다 회복도가 올랐습니다 (+5%)</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-4 h-4 text-amber-400" />
                        <span>괜찮아요! 감점 없이 배울 수 있습니다. 해설을 읽고 다시 시도해 보세요!</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                    💡 {qData.explanation}
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Challenge Mode Question */
            <>
              <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/40">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold font-mono mb-1">
                  <Zap className="w-4 h-4" />
                  <span>보너스 +30 도전 문제</span>
                </div>
                <p className="text-base md:text-lg font-bold text-white leading-relaxed">
                  {challengeData.question}
                </p>
              </div>

              <div className="flex flex-col gap-2.5">
                {challengeData.options.map((opt: string, idx: number) => {
                  let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-750';
                  if (challengeAnswered) {
                    if (idx === challengeData.correctIndex) {
                      btnStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-300';
                    } else {
                      btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                    }
                  }
                  return (
                    <button
                      key={idx}
                      disabled={challengeAnswered}
                      onClick={() => handleChallengeOption(idx)}
                      className={`p-3.5 rounded-xl border text-left font-medium text-xs md:text-sm transition flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{idx + 1}. {opt}</span>
                    </button>
                  );
                })}
              </div>

              {challengeAnswered && (
                <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs md:text-sm text-slate-200">
                  💡 {challengeData.explanation}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 bg-slate-950/60 rounded-b-3xl flex items-center justify-between">
          <div>
            {isAnswered && isCorrect && !isChallengeMode && challengeData && (
              <button
                onClick={() => {
                  soundEngine.playExperimentAction();
                  setIsChallengeMode(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/80 hover:bg-amber-600 text-amber-100 font-bold text-xs transition border border-amber-400"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>윗 단계 도전 문제 풀기 (+30)</span>
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {isAnswered && !isCorrect && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 풀기</span>
              </button>
            )}

            {(isCorrect || challengeAnswered) && (
              <button
                onClick={handleNextQuestion}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs md:text-sm shadow-lg shadow-cyan-500/20 transition"
              >
                <span>
                  {questionIdx + 1 < totalQuestions ? '다음 문제로' : '스테이지 배지 획득하기!'}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
