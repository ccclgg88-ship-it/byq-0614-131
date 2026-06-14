import type { AntiCheatState } from '../types/types';
import { GAME_CONFIG } from '../config/gameConfig';

const { CLICK_THRESHOLD, CLICK_WINDOW_MS, COOLDOWN_MS } = GAME_CONFIG.ANTI_CHEAT;

export function createInitialAntiCheatState(): AntiCheatState {
  return {
    lastClickTime: 0,
    clickCount: 0,
    cooldownUntil: 0,
    violationCount: 0,
  };
}

export function registerClick(state: AntiCheatState, timestamp: number): {
  state: AntiCheatState;
  allowed: boolean;
  cooldownRemaining: number;
} {
  const now = timestamp;
  
  if (now < state.cooldownUntil) {
    return {
      state,
      allowed: false,
      cooldownRemaining: state.cooldownUntil - now,
    };
  }
  
  let clickCount = state.clickCount;
  if (now - state.lastClickTime > CLICK_WINDOW_MS) {
    clickCount = 0;
  }
  clickCount++;
  
  if (clickCount > CLICK_THRESHOLD) {
    const newViolationCount = state.violationCount + 1;
    const cooldownMultiplier = Math.min(newViolationCount, 3);
    const cooldownUntil = now + COOLDOWN_MS * cooldownMultiplier;
    
    return {
      state: {
        ...state,
        clickCount: 0,
        cooldownUntil,
        violationCount: newViolationCount,
      },
      allowed: false,
      cooldownRemaining: cooldownUntil - now,
    };
  }
  
  return {
    state: {
      ...state,
      lastClickTime: now,
      clickCount,
    },
    allowed: true,
    cooldownRemaining: 0,
  };
}

export function isOnCooldown(state: AntiCheatState, timestamp: number): boolean {
  return timestamp < state.cooldownUntil;
}

export function getCooldownRemaining(state: AntiCheatState, timestamp: number): number {
  if (timestamp >= state.cooldownUntil) return 0;
  return state.cooldownUntil - timestamp;
}

export function resetViolations(state: AntiCheatState): AntiCheatState {
  return {
    ...state,
    violationCount: 0,
  };
}
