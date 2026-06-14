import type { AntiCheatState } from '../types/types';
import { createInitialAntiCheatState, registerClick } from '../systems/antiCheat';

export interface ClickGameState {
  score: number;
  targetScore: number;
  timeRemaining: number;
  totalTime: number;
  isPlaying: boolean;
  isFinished: boolean;
  success: boolean;
  targetX: number;
  targetY: number;
  targetRadius: number;
  combo: number;
  maxCombo: number;
  antiCheat: AntiCheatState;
  cooldownMessage: string;
}

export function createClickGame(difficulty: 'easy' | 'normal' | 'hard' = 'normal'): ClickGameState {
  const configs = {
    easy: { targetScore: 15, totalTime: 10, targetRadius: 50 },
    normal: { targetScore: 25, totalTime: 10, targetRadius: 40 },
    hard: { targetScore: 40, totalTime: 10, targetRadius: 30 },
  };
  const config = configs[difficulty];
  
  return {
    score: 0,
    targetScore: config.targetScore,
    timeRemaining: config.totalTime,
    totalTime: config.totalTime,
    isPlaying: false,
    isFinished: false,
    success: false,
    targetX: 640,
    targetY: 360,
    targetRadius: config.targetRadius,
    combo: 0,
    maxCombo: 0,
    antiCheat: createInitialAntiCheatState(),
    cooldownMessage: '',
  };
}

export function startClickGame(state: ClickGameState): ClickGameState {
  return {
    ...state,
    isPlaying: true,
    score: 0,
    timeRemaining: state.totalTime,
    combo: 0,
    maxCombo: 0,
  };
}

export function moveTarget(state: ClickGameState, canvasWidth: number, canvasHeight: number): ClickGameState {
  const padding = state.targetRadius + 50;
  const newX = padding + Math.random() * (canvasWidth - padding * 2);
  const newY = padding + 100 + Math.random() * (canvasHeight - padding * 2 - 150);
  
  return {
    ...state,
    targetX: newX,
    targetY: newY,
  };
}

export function handleClickGameClick(
  state: ClickGameState,
  x: number,
  y: number,
  timestamp: number
): { state: ClickGameState; hit: boolean } {
  if (!state.isPlaying || state.isFinished) {
    return { state, hit: false };
  }
  
  const acResult = registerClick(state.antiCheat, timestamp);
  
  if (!acResult.allowed) {
    const cooldownSec = Math.ceil(acResult.cooldownRemaining / 1000);
    return {
      state: {
        ...state,
        antiCheat: acResult.state,
        cooldownMessage: `操作过于频繁！冷却 ${cooldownSec} 秒`,
        combo: 0,
      },
      hit: false,
    };
  }
  
  const dx = x - state.targetX;
  const dy = y - state.targetY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance <= state.targetRadius) {
    const newScore = state.score + 1;
    const newCombo = state.combo + 1;
    const newMaxCombo = Math.max(state.maxCombo, newCombo);
    
    const success = newScore >= state.targetScore;
    
    return {
      state: {
        ...state,
        score: newScore,
        combo: newCombo,
        maxCombo: newMaxCombo,
        antiCheat: acResult.state,
        cooldownMessage: '',
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
      antiCheat: acResult.state,
      cooldownMessage: '',
    },
    hit: false,
  };
}

export function updateClickGame(state: ClickGameState, deltaTime: number): ClickGameState {
  if (!state.isPlaying || state.isFinished) return state;
  
  const newTime = state.timeRemaining - deltaTime;
  
  if (newTime <= 0) {
    return {
      ...state,
      timeRemaining: 0,
      isPlaying: false,
      isFinished: true,
      success: state.score >= state.targetScore,
    };
  }
  
  return {
    ...state,
    timeRemaining: newTime,
  };
}

export function getClickGameResult(state: ClickGameState): { success: boolean; score: number; maxCombo: number } {
  return {
    success: state.success,
    score: state.score,
    maxCombo: state.maxCombo,
  };
}

export function calculateClickGameRewardMultiplier(state: ClickGameState): number {
  if (!state.success) return 0;
  
  const ratio = state.score / state.targetScore;
  const comboBonus = Math.min(state.maxCombo / state.targetScore, 0.5);
  
  return Math.min(1 + comboBonus, 1.5);
}
