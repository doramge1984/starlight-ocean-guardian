/**
 * Firebase Firestore Configuration & Data Service
 * Designed for static deployment (GitHub Pages) with local fallback.
 */
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  increment,
  type Firestore,
} from 'firebase/firestore';

// Replace with your real Firebase Project credentials if desired
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForStaticPreviewEvaluation123456",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "starlight-ocean-guardian.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "starlight-ocean-guardian",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "starlight-ocean-guardian.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "108340891226",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:108340891226:web:starlight001ocean",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

try {
  if (firebaseConfig.apiKey && firebaseConfig.projectId && !firebaseConfig.apiKey.includes('Dummy')) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    db = getFirestore(app);
  }
} catch (e) {
  console.info('Firebase using offline mock storage for static client mode:', e);
}

export interface ScoreRecord {
  id?: string;
  nickname: string;
  animal: string;
  score: number;
  quizAccuracy: number;
  stagesCleared: number;
  mode: 'full' | 'quick';
  schoolLevel: 'elementary' | 'middle' | 'high';
  classCode: string;
  createdAt?: any;
}

export interface ClassStats {
  classCode: string;
  totalCollected: number;
  pledgeCount: number;
}

// Local mock storage keys
const LOCAL_SCORES_KEY = 'starlight_ocean_scores_v1';
const LOCAL_CLASSES_KEY = 'starlight_ocean_classes_v1';

// Seed initial inspiring educational scores if empty
function getLocalScores(): ScoreRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_SCORES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error(e);
  }
  const defaultSeeds: ScoreRecord[] = [
    { nickname: '푸른바다수달', animal: 'otter', score: 3840, quizAccuracy: 100, stagesCleared: 5, mode: 'full', schoolLevel: 'elementary', classCode: 'STAR01', createdAt: Date.now() - 3600000 * 5 },
    { nickname: '별빛돌고래', animal: 'fox', score: 3720, quizAccuracy: 95, stagesCleared: 5, mode: 'full', schoolLevel: 'middle', classCode: 'STAR01', createdAt: Date.now() - 3600000 * 12 },
    { nickname: '산호박사곰', animal: 'bear', score: 3650, quizAccuracy: 92, stagesCleared: 5, mode: 'full', schoolLevel: 'high', classCode: 'OCEAN7', createdAt: Date.now() - 3600000 * 24 },
    { nickname: '바다거북친구', animal: 'turtle', score: 3510, quizAccuracy: 90, stagesCleared: 5, mode: 'full', schoolLevel: 'elementary', classCode: 'OCEAN7', createdAt: Date.now() - 3600000 * 30 },
    { nickname: '오로라펭귄', animal: 'penguin', score: 3480, quizAccuracy: 88, stagesCleared: 5, mode: 'full', schoolLevel: 'middle', classCode: 'KIDS24', createdAt: Date.now() - 3600000 * 48 },
    { nickname: '맑은파도토끼', animal: 'rabbit', score: 3350, quizAccuracy: 85, stagesCleared: 5, mode: 'full', schoolLevel: 'elementary', classCode: 'KIDS24', createdAt: Date.now() - 3600000 * 55 },
  ];
  try {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(defaultSeeds));
  } catch (e) {}
  return defaultSeeds;
}

function getLocalClasses(): Record<string, ClassStats> {
  try {
    const raw = localStorage.getItem(LOCAL_CLASSES_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  const defaults: Record<string, ClassStats> = {
    'STAR01': { classCode: 'STAR01', totalCollected: 142, pledgeCount: 28 },
    'OCEAN7': { classCode: 'OCEAN7', totalCollected: 98, pledgeCount: 21 },
    'KIDS24': { classCode: 'KIDS24', totalCollected: 64, pledgeCount: 16 },
  };
  try {
    localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(defaults));
  } catch (e) {}
  return defaults;
}

/**
 * Save game ending score record
 */
export async function saveGameRecord(record: Omit<ScoreRecord, 'id' | 'createdAt'>): Promise<void> {
  // Validate constraints
  const validatedRecord: ScoreRecord = {
    ...record,
    nickname: record.nickname.slice(0, 8),
    score: Math.min(8000, Math.max(0, Math.round(record.score))),
    quizAccuracy: Math.min(100, Math.max(0, Math.round(record.quizAccuracy))),
    stagesCleared: Math.min(5, Math.max(0, record.stagesCleared)),
    classCode: (record.classCode || '').trim().toUpperCase().slice(0, 6),
    createdAt: Date.now(),
  };

  // Always update local cache
  const localList = getLocalScores();
  localList.unshift(validatedRecord);
  try {
    localStorage.setItem(LOCAL_SCORES_KEY, JSON.stringify(localList.slice(0, 100)));
  } catch (e) {}

  // Update class aggregate if classCode provided
  if (validatedRecord.classCode && validatedRecord.classCode.length === 6) {
    const classes = getLocalClasses();
    const current = classes[validatedRecord.classCode] || { classCode: validatedRecord.classCode, totalCollected: 0, pledgeCount: 0 };
    current.totalCollected += 10;
    current.pledgeCount += 1;
    classes[validatedRecord.classCode] = current;
    try {
      localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(classes));
    } catch (e) {}
  }

  // Attempt remote Firestore if configured
  if (db) {
    try {
      await addDoc(collection(db, 'scores'), {
        ...validatedRecord,
        createdAt: serverTimestamp(),
      });
      if (validatedRecord.classCode && validatedRecord.classCode.length === 6) {
        const classRef = doc(db, 'classes', validatedRecord.classCode);
        await setDoc(classRef, {
          classCode: validatedRecord.classCode,
          totalCollected: increment(10),
          pledgeCount: increment(1),
        }, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore sync failed, local data used:', err);
    }
  }
}

/**
 * Fetch Top 20 players (optionally filtered by schoolLevel or time period)
 */
export async function fetchTopScores(schoolLevel?: 'elementary' | 'middle' | 'high', period: 'all' | 'week' = 'all'): Promise<ScoreRecord[]> {
  if (db) {
    try {
      let q = query(collection(db, 'scores'), orderBy('score', 'desc'), limit(20));
      if (schoolLevel) {
        q = query(collection(db, 'scores'), where('schoolLevel', '==', schoolLevel), orderBy('score', 'desc'), limit(20));
      }
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ScoreRecord) }));
      }
    } catch (e) {
      console.warn('Firestore fetch failed, falling back to local storage:', e);
    }
  }

  // Local fallback filter & sort
  let list = getLocalScores();
  if (schoolLevel) {
    list = list.filter(item => item.schoolLevel === schoolLevel);
  }
  if (period === 'week') {
    const oneWeekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    list = list.filter(item => (item.createdAt || Date.now()) >= oneWeekAgo);
  }
  return list.sort((a, b) => b.score - a.score).slice(0, 20);
}

/**
 * Fetch '과학 박사' Top 10 sorted by Quiz Accuracy
 */
export async function fetchTopQuizMasters(): Promise<ScoreRecord[]> {
  if (db) {
    try {
      const q = query(collection(db, 'scores'), orderBy('quizAccuracy', 'desc'), orderBy('score', 'desc'), limit(10));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as ScoreRecord) }));
      }
    } catch (e) {
      console.warn('Firestore fetch failed, falling back to local storage:', e);
    }
  }
  const list = getLocalScores();
  return list.sort((a, b) => (b.quizAccuracy - a.quizAccuracy) || (b.score - a.score)).slice(0, 10);
}

/**
 * Fetch Class Rankings (sorted by totalCollected)
 */
export async function fetchClassRankings(): Promise<ClassStats[]> {
  if (db) {
    try {
      const q = query(collection(db, 'classes'), orderBy('totalCollected', 'desc'), limit(20));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => doc.data() as ClassStats);
      }
    } catch (e) {
      console.warn('Firestore fetch classes failed, falling back:', e);
    }
  }
  const classes = getLocalClasses();
  return Object.values(classes).sort((a, b) => b.totalCollected - a.totalCollected);
}

/**
 * Get single class stats for 3D billboard and Teacher view
 */
export async function fetchClassStats(classCode: string): Promise<ClassStats> {
  const code = (classCode || '').trim().toUpperCase();
  const classes = getLocalClasses();
  if (classes[code]) return classes[code];
  return { classCode: code, totalCollected: 0, pledgeCount: 0 };
}
