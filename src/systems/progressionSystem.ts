import type { PlayerState, Task, TaskRewards } from '../types/types';
import { GAME_CONFIG, clamp, getIntimacyTier, getLevelFromCharm } from '../config/gameConfig';
import { getCompletionRate, createInitialDailyTasks } from './taskSystem';
import { getTodayString } from './saveSystem';

export function applyTaskRewards(player: PlayerState, rewards: TaskRewards): PlayerState {
  const updatedPlayer = { ...player };
  
  const actualCharmGain = Math.min(
    rewards.charm,
    GAME_CONFIG.MAX_DAILY_CHARM - player.dailyCharmEarned
  );
  
  updatedPlayer.charm = clamp(
    player.charm + actualCharmGain,
    GAME_CONFIG.MIN_CHARM,
    GAME_CONFIG.MAX_CHARM
  );
  
  updatedPlayer.dailyCharmEarned = clamp(
    player.dailyCharmEarned + actualCharmGain,
    0,
    GAME_CONFIG.MAX_DAILY_CHARM
  );
  
  updatedPlayer.obedience = clamp(
    player.obedience + rewards.obedience,
    GAME_CONFIG.MIN_OBEDIENCE,
    GAME_CONFIG.MAX_OBEDIENCE
  );
  
  updatedPlayer.intimacy = clamp(
    player.intimacy + rewards.intimacy,
    GAME_CONFIG.MIN_INTIMACY,
    GAME_CONFIG.MAX_INTIMACY
  );
  
  updatedPlayer.level = getLevelFromCharm(updatedPlayer.charm);
  
  updatedPlayer.totalTasksCompleted = player.totalTasksCompleted + 1;
  
  return updatedPlayer;
}

export function checkDailyReset(player: PlayerState, tasks: Task[]): {
  player: PlayerState;
  tasks: Task[];
  yesterdayTasks: Task[] | null;
} {
  const today = getTodayString();
  
  if (player.lastTaskRefreshDate === today) {
    return { player, tasks, yesterdayTasks: null };
  }
  
  const completionRate = getCompletionRate(tasks);
  
  const updatedPlayer = { ...player };
  updatedPlayer.lastTaskRefreshDate = today;
  updatedPlayer.dailyCharmEarned = 0;
  updatedPlayer.yesterdayCompletionRate = completionRate;
  updatedPlayer.totalDaysPlayed = player.totalDaysPlayed + 1;
  
  if (completionRate < 1) {
    updatedPlayer.canMakeUpYesterday = true;
    updatedPlayer.madeUpYesterday = false;
  } else {
    updatedPlayer.canMakeUpYesterday = false;
    updatedPlayer.madeUpYesterday = false;
  }
  
  const newTasks = createInitialDailyTasks(updatedPlayer);
  
  return {
    player: updatedPlayer,
    tasks: newTasks,
    yesterdayTasks: tasks,
  };
}

export function calculateIntimacyTier(intimacy: number): number {
  return getIntimacyTier(intimacy);
}

export function getUnlockedDialoguePacks(player: PlayerState): string[] {
  const tier = getIntimacyTier(player.intimacy);
  const packs: string[] = [];
  
  if (tier >= 1) packs.push('basic_intro', 'daily_idle', 'angry_reaction', 'training_lines');
  if (tier >= 2) packs.push('familiar_talk');
  if (tier >= 3) packs.push('intimate_whisper');
  if (tier >= 4) packs.push('devoted_love');
  if (tier >= 5) packs.push('eternal_bond');
  
  return packs;
}

export function getUnlockedAccessories(player: PlayerState): string[] {
  const tier = getIntimacyTier(player.intimacy);
  const accessories: string[] = [];
  
  if (tier >= 1) {
    accessories.push('ribbon_red', 'earring_gold', 'necklace_black', 'tail_ribbon', 'necklace_chain');
  }
  if (tier >= 2) {
    accessories.push('ribbon_black', 'earring_silver', 'earring_heart', 'necklace_heart', 'tail_bow');
  }
  if (tier >= 3) {
    accessories.push('flower_rose', 'earring_ruby', 'tail_bell');
  }
  if (tier >= 4) {
    accessories.push('crown_silver', 'necklace_gem', 'tail_star');
  }
  
  return accessories;
}

export function checkLevelUp(oldPlayer: PlayerState, newPlayer: PlayerState): boolean {
  return newPlayer.level > oldPlayer.level;
}

export function checkTierUp(oldPlayer: PlayerState, newPlayer: PlayerState): boolean {
  const oldTier = getIntimacyTier(oldPlayer.intimacy);
  const newTier = getIntimacyTier(newPlayer.intimacy);
  return newTier > oldTier;
}
