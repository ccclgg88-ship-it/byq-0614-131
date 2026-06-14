import type { IntimacyTier, TaskRewards } from '../types/types';

export const GAME_CONFIG = {
  CANVAS_WIDTH: 1280,
  CANVAS_HEIGHT: 720,
  
  MAX_DAILY_CHARM: 500,
  MIN_OBEDIENCE: 0,
  MAX_OBEDIENCE: 100,
  MIN_CHARM: 0,
  MAX_CHARM: 99999,
  MIN_INTIMACY: 0,
  MAX_INTIMACY: 10000,
  
  DAILY_TASK_COUNT: 3,
  YESTERDAY_MAKEUP_LIMIT: 1,
  
  ANTI_CHEAT: {
    CLICK_THRESHOLD: 8,
    CLICK_WINDOW_MS: 1000,
    COOLDOWN_MS: 3000,
    MAX_VIOLATIONS: 5,
  },
  
  INTIMACY_TIERS: {
    1: { min: 0, max: 999, name: '陌生' },
    2: { min: 1000, max: 2999, name: '熟悉' },
    3: { min: 3000, max: 5999, name: '亲密' },
    4: { min: 6000, max: 8999, name: '挚爱' },
    5: { min: 9000, max: 10000, name: '永恒' },
  } as Record<IntimacyTier, { min: number; max: number; name: string }>,
  
  RARITY_MULTIPLIERS: {
    common: 1,
    rare: 1.5,
    epic: 2.5,
  },
  
  BASE_REWARDS: {
    greeting: { charm: 30, obedience: 5, intimacy: 20 },
    feeding: { charm: 40, obedience: 3, intimacy: 25 },
    training: { charm: 20, obedience: 15, intimacy: 15 },
  } as Record<string, TaskRewards>,
  
  RARE_TASK_BASE_PROBABILITY: 0.1,
  EPIC_TASK_BASE_PROBABILITY: 0.02,
  COMPLETION_RATE_BONUS_MULTIPLIER: 0.5,
  
  STORAGE_KEY: 'succubus_raising_save',
  CURRENT_SAVE_VERSION: 2,
  
  LEVEL_UP_CHARM_BASE: 500,
  LEVEL_UP_CHARM_MULTIPLIER: 1.2,
};

export function getIntimacyTier(intimacy: number): IntimacyTier {
  if (intimacy >= 9000) return 5;
  if (intimacy >= 6000) return 4;
  if (intimacy >= 3000) return 3;
  if (intimacy >= 1000) return 2;
  return 1;
}

export function getLevelFromCharm(charm: number): number {
  let level = 1;
  let required = GAME_CONFIG.LEVEL_UP_CHARM_BASE;
  while (charm >= required) {
    charm -= required;
    level++;
    required = Math.floor(required * GAME_CONFIG.LEVEL_UP_CHARM_MULTIPLIER);
  }
  return level;
}

export function getCharmForNextLevel(currentCharm: number): { current: number; required: number } {
  let level = 1;
  let required = GAME_CONFIG.LEVEL_UP_CHARM_BASE;
  let cumulative = 0;
  
  while (currentCharm >= cumulative + required) {
    cumulative += required;
    level++;
    required = Math.floor(required * GAME_CONFIG.LEVEL_UP_CHARM_MULTIPLIER);
  }
  
  return {
    current: currentCharm - cumulative,
    required: required,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
