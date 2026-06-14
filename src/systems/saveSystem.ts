import type { SaveData, PlayerState, Task } from '../types/types';
import { GAME_CONFIG } from '../config/gameConfig';
import { createInitialDailyTasks } from './taskSystem';

export function createInitialPlayerState(): PlayerState {
  const today = getTodayString();
  return {
    charm: 0,
    obedience: 50,
    intimacy: 0,
    level: 1,
    dailyCharmEarned: 0,
    totalTasksCompleted: 0,
    totalDaysPlayed: 1,
    lastLoginDate: today,
    lastTaskRefreshDate: today,
    yesterdayCompletionRate: 1,
    equippedAccessories: {
      hair: null,
      earring: null,
      necklace: null,
      tail: null,
    },
    unlockedDialoguePacks: ['basic_intro', 'daily_idle', 'angry_reaction', 'training_lines'],
    unlockedAccessories: ['ribbon_red', 'earring_gold', 'necklace_black', 'tail_ribbon', 'necklace_chain'],
    canMakeUpYesterday: false,
    madeUpYesterday: false,
  };
}

export function createInitialSaveData(): SaveData {
  const now = new Date().toISOString();
  const player = createInitialPlayerState();
  return {
    version: GAME_CONFIG.CURRENT_SAVE_VERSION,
    player,
    dailyTasks: createInitialDailyTasks(player),
    yesterdayTasks: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function getTodayString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDaysBetween(date1: string, date2: string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const SAVE_KEY = GAME_CONFIG.STORAGE_KEY;

export function loadSaveData(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    
    const data = JSON.parse(raw) as SaveData;
    return migrateSaveData(data);
  } catch (e) {
    console.error('存档加载失败:', e);
    return null;
  }
}

export function saveSaveData(data: SaveData): void {
  try {
    data.updatedAt = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('存档保存失败:', e);
  }
}

export function migrateSaveData(data: SaveData): SaveData {
  let migrated = { ...data };
  
  if (migrated.version === 1) {
    migrated = migrateV1ToV2(migrated);
  }
  
  return migrated;
}

function migrateV1ToV2(data: SaveData): SaveData {
  const migrated = { ...data, version: 2 };
  
  if (!migrated.player.equippedAccessories) {
    migrated.player.equippedAccessories = {
      hair: null,
      earring: null,
      necklace: null,
      tail: null,
    };
  }
  
  if (!migrated.player.unlockedAccessories) {
    migrated.player.unlockedAccessories = ['ribbon_red', 'earring_gold', 'necklace_black', 'tail_ribbon'];
  }
  
  if (migrated.yesterdayTasks === undefined) {
    migrated.yesterdayTasks = null;
  }
  
  if (migrated.player.canMakeUpYesterday === undefined) {
    migrated.player.canMakeUpYesterday = false;
  }
  
  if (migrated.player.madeUpYesterday === undefined) {
    migrated.player.madeUpYesterday = false;
  }
  
  return migrated;
}

export function resetSaveData(): SaveData {
  const newSave = createInitialSaveData();
  saveSaveData(newSave);
  return newSave;
}
