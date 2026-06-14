export interface QTEKey {
  x: number;
  y: number;
  key: string;
  hit: boolean;
  missed: boolean;
  spawnTime: number;
  duration: number;
}

export interface QTEGameState {
  keys: QTEKey[];
  score: number;
  targetScore: number;
  timeRemaining: number;
  totalTime: number;
  isPlaying: boolean;
  isFinished: boolean;
  success: boolean;
  spawnTimer: number;
  spawnInterval: number;
  combo: number;
  maxCombo: number;
}

const QTE_KEYS = ['Q', 'W', 'E', 'R', 'A', 'S', 'D', 'F'];

export function createQTEGame(difficulty: 'easy' | 'normal' | 'hard' = 'normal'): QTEGameState {
  const configs = {
    easy: { targetScore: 8, totalTime: 12, spawnInterval: 1.5, keyDuration: 2.5 },
    normal: { targetScore: 15, totalTime: 12, spawnInterval: 1, keyDuration: 2 },
    hard: { targetScore: 25, totalTime: 12, spawnInterval: 0.7, keyDuration: 1.5 },
  };
  const config = configs[difficulty];
  
  return {
    keys: [],
    score: 0,
    targetScore: config.targetScore,
    timeRemaining: config.totalTime,
    totalTime: config.totalTime,
    isPlaying: false,
    isFinished: false,
    success: false,
    spawnTimer: 0,
    spawnInterval: config.spawnInterval,
    combo: 0,
    maxCombo: 0,
  };
}

export function startQTEGame(state: QTEGameState): QTEGameState {
  return {
    ...state,
    isPlaying: true,
    score: 0,
    timeRemaining: state.totalTime,
    keys: [],
    combo: 0,
    maxCombo: 0,
    spawnTimer: 0,
  };
}

function spawnKey(state: QTEGameState): QTEKey {
  const keyChar = QTE_KEYS[Math.floor(Math.random() * QTE_KEYS.length)];
  const x = 150 + Math.random() * 980;
  const y = 200 + Math.random() * 350;
  
  return {
    x,
    y,
    key: keyChar,
    hit: false,
    missed: false,
    spawnTime: state.totalTime - state.timeRemaining,
    duration: state.spawnInterval * 2,
  };
}

export function updateQTEGame(state: QTEGameState, deltaTime: number): QTEGameState {
  if (!state.isPlaying || state.isFinished) return state;
  
  let newTime = state.timeRemaining - deltaTime;
  let newKeys = [...state.keys];
  let newSpawnTimer = state.spawnTimer + deltaTime;
  let newCombo = state.combo;
  
  if (newSpawnTimer >= state.spawnInterval) {
    newSpawnTimer = 0;
    newKeys.push(spawnKey(state));
  }
  
  const currentTime = state.totalTime - newTime;
  newKeys = newKeys.map(k => {
    if (!k.hit && !k.missed && currentTime - k.spawnTime > k.duration) {
      newCombo = 0;
      return { ...k, missed: true };
    }
    return k;
  });
  
  newKeys = newKeys.filter(k => {
    const age = currentTime - k.spawnTime;
    return age < k.duration + 0.5;
  });
  
  if (newTime <= 0) {
    newTime = 0;
    return {
      ...state,
      timeRemaining: 0,
      keys: newKeys,
      isPlaying: false,
      isFinished: true,
      success: state.score >= state.targetScore,
    };
  }
  
  return {
    ...state,
    timeRemaining: newTime,
    keys: newKeys,
    spawnTimer: newSpawnTimer,
    combo: newCombo,
  };
}

export function handleQTEKeyPress(state: QTEGameState, key: string): { state: QTEGameState; hit: boolean } {
  if (!state.isPlaying || state.isFinished) {
    return { state, hit: false };
  }
  
  const upperKey = key.toUpperCase();
  
  const targetKeyIndex = state.keys.findIndex(
    k => k.key === upperKey && !k.hit && !k.missed
  );
  
  if (targetKeyIndex >= 0) {
    const newKeys = [...state.keys];
    newKeys[targetKeyIndex] = { ...newKeys[targetKeyIndex], hit: true };
    
    const newScore = state.score + 1;
    const newCombo = state.combo + 1;
    const newMaxCombo = Math.max(state.maxCombo, newCombo);
    const success = newScore >= state.targetScore;
    
    return {
      state: {
        ...state,
        keys: newKeys,
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        isFinished: success,
        success,
      },
      hit: true,
    };
  }
  
  return {
    state: {
      ...state,
      combo: 0,
    },
    hit: false,
  };
}

export function getQTEGameResult(state: QTEGameState): { success: boolean; score: number; maxCombo: number } {
  return {
    success: state.success,
    score: state.score,
    maxCombo: state.maxCombo,
  };
}

export function calculateQTERewardMultiplier(state: QTEGameState): number {
  if (!state.success) return 0;
  
  const ratio = state.score / state.targetScore;
  const comboBonus = Math.min(state.maxCombo / state.targetScore, 0.5);
  
  return Math.min(1 + comboBonus, 1.5);
}
