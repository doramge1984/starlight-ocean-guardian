# 🌊 별빛 바다 지킴이: 과학으로 되살리는 바다 (Starlight Ocean Guardian)

> **게임문화재단 교사 게임리터러시 공모전 출품작**  
> *"게임은 세상을 바꾸는 힘이 있다. 과학으로 바다의 문제를 이해하고, 바다를 되살리고, 직접 친환경 게임 장치를 설계한다."*

[![Deploy to GitHub Pages](https://github.com/doramge1984/starlight-ocean-guardian/actions/workflows/deploy.yml/badge.svg)](https://github.com/doramge1984/starlight-ocean-guardian/actions/workflows/deploy.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r182-black.svg)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)

---

## 📖 작품 개요 및 기획 의도

본 작품은 초·중·고 학생을 위한 **환경 과학 × 게임 리터러시 융합 3D 메타버스 학습 게임**입니다.  
환경 문제를 공포나 무기력으로 전달하는 방식에서 벗어나, **과학적 사실에 기반한 이해와 바다 회복의 성취감, 그리고 게임 속 선한 영향력(그린 넛지)을 직접 설계해보는 진로 연계 경험**을 제공합니다.

- **대상**: 초등학교 고학년, 중학생, 고등학생 (모든 설명 및 퀴즈가 3단계 난이도로 맞춤 제공)
- **장르**: 3D 메타버스 탐험 & 인터랙티브 과학 시뮬레이션
- **플랫폼**: 웹 브라우저 (PC 및 모바일/태블릿 반응형, 학교 크롬북 최적화 저사양 모드 지원)
- **배포 방식**: GitHub Pages 무설치 정적 웹 배포

---

## 🌟 핵심 특징

### 1. 100% 절차적 3D 메타버스 (외부 모델·사운드 파일 의존성 제로)
- Three.js 기반으로 모든 섬, 바다, 산호, 동물 아바타(토끼, 여우, 곰, 펭귄, 수달), 쓰레기 오브젝트를 순수 코드로 생성
- 다층 노이즈 GLSL 셰이더로 구현된 실시간 **오로라 보레알리스(Aurora Borealis)** 및 별똥별
- 달빛 반사와 발자국에 반응하는 푸른 **야광 플랑크톤(Bioluminescent Plankton)** 물 셰이더
- 크롬북 및 저사양 환경을 위한 **그래픽 품질 선택 (낮음/보통/높음)**

### 2. 초·중·고 3단계 수준별 과학 설명 체계
- **[🌱 초등]**: 쉬운 비유와 스토리텔링 (화학식 배제)
- **[🌿 중등]**: 개념 용어 및 원리 (밀도, 고분자 사슬, 먹이사슬, 산성화)
- **[🌳 고등]**: 정량적 수치, 평형 반응식($CO_2 + H_2O \rightleftharpoons H_2CO_3 \rightleftharpoons H^+ + HCO_3^-$), 포화도 그래프

### 3. 스테이지별 5대 교육 흐름 (탐사 → 과학 카드 → 가상 실험 → 퀴즈 → 회복)
1. **스테이지 1 (밀물 해변 - 물리: 밀도와 부력)**: 바닷물(약 1.03g/cm³)과 민물(1.00g/cm³) 수조 실험, 생물 부착(Biofouling)에 의한 수직 침강
2. **스테이지 2 (햇빛 바위 - 화학: 고분자와 미세플라스틱)**: 자외선·파도 풍화와 5mm 이하 미세화, 탄소 사슬(C-C) 보존, "500년 소멸" 오해 바로잡기
3. **스테이지 3 (얕은 바닷속 - 생명과학: 생태계와 그물)**: 바다거북/물고기의 눈으로 본 비닐 vs 해파리 시각 비교, 폐그물(Ghost net) 바다거북 구조
4. **스테이지 4 (산호 정원 - 화학: 해양 산성화)**: 대기 $CO_2$ 슬라이더와 해수 pH 저하, 탄산칼슘($CaCO_3$) 껍데기 용해 관찰, 에너지 절약과의 연계
5. **스테이지 5 (등대 - 게임 리터러시 & 진로)**: 장르 선택, 배운 과학 적용, 그린 넛지 2종 선택을 통한 **나의 그린 게임 기획 카드** 제작 및 이미지 저장

### 4. 100% Web Audio API 절차적 오디오
- 외부 MP3 파일 없이 오실레이터와 노이즈 필터로 파도 소리, 바람, 오르골 멜로디, 발소리, 팡파르, 돌고래 소리 실시간 합성
- 수업 환경을 위한 **교실용 조용 모드** 지원

### 5. 교사용 수업 지원 도구
- 빔 프로젝터용 대형 **학급 코드 생성기** 및 실시간 전광판
- **2022 개정 교육과정 교과 매핑표** (과학, 사회, 도덕, 실과/정보)
- 학급 모둠 토의를 위한 **사후 토의 질문 5선**
- 교사가 직접 과학 문항과 넛지를 수정할 수 있는 독립 JSON 데이터 파일 (`src/data/`)

---

## 🛠️ 기술 스택 (Tech Stack)

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React
- **3D Graphics**: Three.js (r182), Custom GLSL Shaders (Aurora, Gerstner Water, Bioluminescence)
- **Audio Engine**: Web Audio API (100% Procedural Synthesis)
- **Database / Ranking**: Firebase Firestore (로컬 오프라인 캐시 및 Mock 폴백 완비)
- **Build & CI/CD**: Vite 8, GitHub Actions, GitHub Pages

---

## 🚀 로컬 실행 방법 (Local Development)

```bash
# 1. 저장소 복제
git clone https://github.com/doramge1984/starlight-ocean-guardian.git
cd starlight-ocean-guardian

# 2. 의존성 설치
npm install

# 3. 로컬 개발 서버 실행 (포트 3000)
npm run dev

# 4. 프로덕션 빌드 테스트
npm run build
```

---

## 📦 GitHub Pages 배포 설정 안내

본 프로젝트는 `.github/workflows/deploy.yml` 파일이 포함되어 있어, GitHub 저장소의 `main` 브랜치에 푸시하면 자동으로 GitHub Actions가 빌드하여 GitHub Pages로 배포됩니다.

1. GitHub 저장소의 **Settings** > **Pages** 이동
2. **Build and deployment** > **Source** 항목을 **GitHub Actions**로 선택
3. 코드가 푸시되면 자동으로 `https://<사용자이름>.github.io/<저장소이름>/` 주소로 배포됩니다.

---

## 📄 라이선스 (License)

Apache License 2.0. 자유롭게 교육적 목적으로 수정 및 활용하실 수 있습니다.
