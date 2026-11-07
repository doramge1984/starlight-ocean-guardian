import React, { useState } from 'react';
import { soundEngine } from '../audio/soundEngine';
import { GraduationCap, Projector, BookCheck, MessageSquare, FileCode, X, Copy, Check } from 'lucide-react';

interface TeacherMenuModalProps {
  currentClassCode: string;
  onSelectClassCode: (code: string) => void;
  onClose: () => void;
}

export const TeacherMenuModal: React.FC<TeacherMenuModalProps> = ({
  currentClassCode,
  onSelectClassCode,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'projector' | 'curriculum' | 'discussion' | 'dataEdit'>('projector');
  const [newCode, setNewCode] = useState<string>(currentClassCode || 'OCEAN7');
  const [copied, setCopied] = useState<boolean>(false);

  const generateRandomCode = () => {
    soundEngine.playExperimentAction();
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let res = '';
    for (let i = 0; i < 6; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCode(res);
    onSelectClassCode(res);
  };

  const copyToClipboard = () => {
    soundEngine.playQuizCorrect();
    navigator.clipboard.writeText(newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const DISCUSSION_QUESTIONS = [
    {
      q: "Q1. 플라스틱이 바다 표면뿐만 아니라 수천 미터 깊은 해저 바닥에도 쌓이는 물리적 원리는 무엇일까요?",
      point: "지도 핵심: 물질 고유의 밀도(PE, PP < 1.03 < PET, PVC)와 생물 부착(Biofouling)으로 인한 수직 침강 동역학 상기"
    },
    {
      q: "Q2. '플라스틱이 500년 뒤 완전히 사라진다'는 말이 과학적 오해인 이유는 무엇일까요?",
      point: "지도 핵심: 고분자 탄소 사슬(C-C 결합)이 자연 미생물에 의해 생분해되지 않고 5mm 미만의 미세플라스틱으로 쪼개져 남는 점 강조"
    },
    {
      q: "Q3. 버려진 폐그물이 바다 생물을 끊임없이 위협하는 '유령 어업'을 막기 위해 과학자들은 어떤 친환경 기술을 연구하고 있나요?",
      point: "지도 핵심: 일정 시간 후 물과 이산화탄소로 자연 분해되는 해양 생분해성 수지(PBS/PBAT) 어구 기술"
    },
    {
      q: "Q4. 플라스틱 쓰레기를 줍는 것 외에, 우리가 교실에서 전기를 아끼는 것이 왜 산호초를 살리는 일과 직접 연결될까요?",
      point: "지도 핵심: 화석연료 연소로 배출된 CO₂의 30%를 바다가 흡수하여 pH를 낮추고 산호·조개의 탄산칼슘(CaCO₃) 합성을 방해하는 해양 산성화 연계"
    },
    {
      q: "Q5. '게임은 끝날 때를 안다'는 엔딩 메시지를 통해 우리가 실천할 수 있는 건강한 게임 문화와 현실 속 환경 행동은 무엇일까요?",
      point: "지도 핵심: 게임 속 성취감과 그린 넛지를 일상 삶(텀블러, 분리배출, 지속 가능한 선택)으로 전이시키는 주체적 게임 리터러시 함양"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col text-slate-100">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-mono text-cyan-400 font-semibold tracking-wider">
                교사용 게임리터러시 교육 지원 모듈
              </span>
              <h3 className="text-lg font-bold text-white">선생님 메뉴 (Teacher Dashboard)</h3>
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
        <div className="px-5 pt-3 pb-2 border-b border-slate-800 bg-slate-950/40 flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              setActiveTab('projector');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTab === 'projector'
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <Projector className="w-4 h-4" />
            <span>빔 프로젝터용 반 코드 & 전광판</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              setActiveTab('curriculum');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTab === 'curriculum'
                ? 'bg-purple-600 border-purple-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <BookCheck className="w-4 h-4" />
            <span>교과 연계 매핑 가이드</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              setActiveTab('discussion');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTab === 'discussion'
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>수업 사후 토의 질문 (5선)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playExperimentAction();
              setActiveTab('dataEdit');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeTab === 'dataEdit'
                ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>데이터 커스텀 안내</span>
          </button>
        </div>

        {/* Tab 1: Projector View */}
        {activeTab === 'projector' && (
          <div className="p-6 flex flex-col items-center gap-5">
            <div className="text-center">
              <h4 className="text-sm font-semibold text-slate-300 mb-1">
                교실 칠판 / 빔 프로젝터 화면 투출용
              </h4>
              <p className="text-xs text-slate-400">
                학생들이 게임 시작 시 입력할 우리 반 6자리 접속 코드입니다.
              </p>
            </div>

            {/* Giant Projector Card */}
            <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-950 border-2 border-cyan-400 shadow-2xl flex flex-col items-center justify-center text-center">
              <span className="text-xs text-cyan-400 font-mono tracking-widest uppercase mb-2">
                CLASS ROOM ACCESS CODE
              </span>
              <div className="text-5xl md:text-7xl font-mono font-black tracking-widest text-cyan-300 select-all my-3 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                {newCode}
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-600 flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? '복사 완료!' : '코드 복사'}</span>
                </button>
                <button
                  onClick={generateRandomCode}
                  className="px-4 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-xs font-semibold text-white transition"
                >
                  새로운 반 코드 생성
                </button>
              </div>
            </div>

            {/* Class Live Billboard stats */}
            <div className="w-full grid grid-cols-2 gap-3 text-center">
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">우리 반 누적 쓰레기 수거량</span>
                <span className="text-3xl font-bold font-mono text-cyan-400">342 개</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700">
                <span className="text-xs text-slate-400 block mb-1">우리 반 실천 서약 참여자</span>
                <span className="text-3xl font-bold font-mono text-emerald-400">78 명</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Curriculum Mapping */}
        {activeTab === 'curriculum' && (
          <div className="p-6 flex flex-col gap-4 text-xs md:text-sm">
            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30">
              <h5 className="font-bold text-purple-300 text-base mb-2">
                2022 개정 교육과정 연계 교과 및 단원 매핑표
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-cyan-300 block mb-1">🔬 과학 (물리·화학·생명)</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>[초등 5-6학년] 여러 가지 기체, 물체의 무게와 부력, 생물과 환경</li>
                    <li>[중학교 1-3학년] 물질의 특성(밀도), 생물의 다양성, 화학 변화와 기후</li>
                    <li>[고등학교 통합과학] 산과 염기 평형, 생태계 보전과 신재생에너지</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-amber-300 block mb-1">🌍 사회 및 환경</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>[초등·중등 사회] 지속 가능한 환경과 자원, 해양 영토와 어업 자원</li>
                    <li>[고등 환경] 순환 경제와 기후 행동, UN 지속가능발전목표(SDG 14)</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-emerald-300 block mb-1">💖 도덕 및 윤리</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>생명 존중과 동물 복지 (해양 생물 혼획 및 서식지 파괴 반성)</li>
                    <li>지구촌 공동체 윤리와 세대 간 정의 (미래 세대를 위한 환경 서약)</li>
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="font-bold text-rose-300 block mb-1">🎮 실과 및 정보 / 게임 리터러시</span>
                  <ul className="list-disc list-inside text-slate-300 space-y-1">
                    <li>게임 리터러시 (놀이의 규칙과 서사를 통한 선한 영향력 창출)</li>
                    <li>진로 탐색: 게임 기획자, 3D 메타버스 디자이너, 해양 환경 연구원</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Discussion Questions */}
        {activeTab === 'discussion' && (
          <div className="p-6 flex flex-col gap-3">
            <span className="text-xs text-slate-400 mb-1">
              게임 플레이 후 학급 단위 모둠 토의 및 발표를 위한 5대 발문 가이드:
            </span>
            {DISCUSSION_QUESTIONS.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col gap-1.5">
                <span className="font-bold text-white text-sm">{item.q}</span>
                <span className="text-xs text-emerald-400 font-mono bg-emerald-950/60 p-2 rounded-lg border border-emerald-500/30">
                  {item.point}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4: Data Customization */}
        {activeTab === 'dataEdit' && (
          <div className="p-6 flex flex-col gap-4 text-xs md:text-sm">
            <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/30">
              <h5 className="font-bold text-amber-300 text-base mb-2">
                📂 교사용 JSON 데이터 구조 분리 안내
              </h5>
              <p className="text-slate-300 leading-relaxed mb-3">
                선생님께서 학교 수업 목표와 학급 수준에 맞추어 자유롭게 과학 문항 및 그린 넛지 항목을 직접 수정·확장할 수 있도록 데이터 파일이 완전 분리되어 있습니다:
              </p>
              <ul className="list-disc list-inside text-slate-300 space-y-2">
                <li>
                  <strong className="text-white font-mono">src/data/science.json</strong>: 5개 스테이지의 과학 카드(elementary, middle, high 3단계) 및 바다 퀴즈 문항·해설·출처 수록
                </li>
                <li>
                  <strong className="text-white font-mono">src/data/items.json</strong>: 3D 해변과 바다에서 수거하는 오염 물질의 재질, 밀도, 부유 여부 정의
                </li>
                <li>
                  <strong className="text-white font-mono">src/data/nudges.json</strong>: 스테이지 5 그린 게임 디자이너에서 사용하는 6대 그린 넛지 장치 및 3대 미래 진로 상세 데이터
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
