import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateTaskRewards,
  calculateRareTaskProbability,
  rollTaskRarity,
  getCompletionRate,
  getCompletedTaskCount,
} from '../src/systems/taskSystem';
import type { Task, TaskType, TaskRarity } from '../src/types/types';
import {
  applyTaskRewards,
  checkDailyReset,
  getUnlockedDialoguePacks,
  getUnlockedAccessories,
  checkLevelUp,
  checkTierUp,
} from '../src/systems/progressionSystem';
import {
  createInitialPlayerState,
  createInitialSaveData,
  getTodayString,
  migrateSaveData,
} from '../src/systems/saveSystem';
import { GAME_CONFIG, getIntimacyTier, getLevelFromCharm, clamp, getCharmForNextLevel } from '../src/config/gameConfig';
import {
  createInitialAntiCheatState,
  registerClick,
  isOnCooldown,
  getCooldownRemaining,
} from '../src/systems/antiCheat';

describe('gameConfig - 核心数值工具', () => {
  describe('clamp', () => {
    it('应该将值钳制在范围内', () => {
      expect(clamp(50, 0, 100)).toBe(50);
      expect(clamp(-10, 0, 100)).toBe(0);
      expect(clamp(150, 0, 100)).toBe(100);
    });
  });

  describe('getIntimacyTier', () => {
    it('应该正确计算亲密度档位', () => {
      expect(getIntimacyTier(0)).toBe(1);
      expect(getIntimacyTier(999)).toBe(1);
      expect(getIntimacyTier(1000)).toBe(2);
      expect(getIntimacyTier(2999)).toBe(2);
      expect(getIntimacyTier(3000)).toBe(3);
      expect(getIntimacyTier(5999)).toBe(3);
      expect(getIntimacyTier(6000)).toBe(4);
      expect(getIntimacyTier(8999)).toBe(4);
      expect(getIntimacyTier(9000)).toBe(5);
      expect(getIntimacyTier(10000)).toBe(5);
    });
  });

  describe('getLevelFromCharm', () => {
    it('应该正确计算魅力等级', () => {
      expect(getLevelFromCharm(0)).toBe(1);
      expect(getLevelFromCharm(499)).toBe(1);
      expect(getLevelFromCharm(500)).toBe(2);
    });
  });

  describe('getCharmForNextLevel', () => {
    it('应该返回当前进度和升级所需', () => {
      const result = getCharmForNextLevel(0);
      expect(result.current).toBe(0);
      expect(result.required).toBe(GAME_CONFIG.LEVEL_UP_CHARM_BASE);
    });
  });
});

describe('taskSystem - 任务系统', () => {
  describe('calculateTaskRewards', () => {
    it('应该根据任务类型和稀有度计算奖励', () => {
      const commonGreeting = calculateTaskRewards('greeting', 'common');
      expect(commonGreeting.charm).toBe(30);
      expect(commonGreeting.obedience).toBe(5);
      expect(commonGreeting.intimacy).toBe(20);

      const rareFeeding = calculateTaskRewards('feeding', 'rare');
      expect(rareFeeding.charm).toBe(60);
      expect(rareFeeding.obedience).toBe(4);
      expect(rareFeeding.intimacy).toBe(37);

      const epicTraining = calculateTaskRewards('training', 'epic');
      expect(epicTraining.charm).toBe(50);
      expect(epicTraining.obedience).toBe(37);
      expect(epicTraining.intimacy).toBe(37);
    });
  });

  describe('calculateRareTaskProbability', () => {
    it('应该根据完成率计算稀有任务概率', () => {
      const lowProb = calculateRareTaskProbability(0);
      const highProb = calculateRareTaskProbability(1);

      expect(highProb.rare).toBeGreaterThan(lowProb.rare);
      expect(highProb.epic).toBeGreaterThan(lowProb.epic);
    });

    it('完成率 0 时应该是基础概率', () => {
      const probs = calculateRareTaskProbability(0);
      expect(probs.rare).toBe(GAME_CONFIG.RARE_TASK_BASE_PROBABILITY);
      expect(probs.epic).toBe(GAME_CONFIG.EPIC_TASK_BASE_PROBABILITY);
    });

    it('概率不应该超过上限', () => {
      const probs = calculateRareTaskProbability(2);
      expect(probs.rare).toBeLessThanOrEqual(0.5);
      expect(probs.epic).toBeLessThanOrEqual(0.15);
    });
  });

  describe('rollTaskRarity', () => {
    it('应该根据概率返回稀有度', () => {
      const rarity = rollTaskRarity(1);
      expect(['common', 'rare', 'epic']).toContain(rarity);
    });
  });

  describe('getCompletionRate', () => {
    it('应该正确计算完成率', () => {
      const tasks = [
        { completed: true },
        { completed: true },
        { completed: false },
      ] as Task[];
      expect(getCompletionRate(tasks)).toBeCloseTo(0.666, 2);
    });

    it('空任务列表应该返回 0', () => {
      expect(getCompletionRate([])).toBe(0);
    });
  });

  describe('getCompletedTaskCount', () => {
    it('应该正确统计已完成任务数', () => {
      const tasks = [
        { completed: true },
        { completed: true },
        { completed: false },
      ] as Task[];
      expect(getCompletedTaskCount(tasks)).toBe(2);
    });
  });
});

describe('progressionSystem - 成长系统', () => {
  let player: ReturnType<typeof createInitialPlayerState>;

  beforeEach(() => {
    player = createInitialPlayerState();
  });

  describe('applyTaskRewards', () => {
    it('应该正确应用奖励', () => {
      const rewards = { charm: 100, obedience: 10, intimacy: 50 };
      const result = applyTaskRewards(player, rewards);

      expect(result.charm).toBe(100);
      expect(result.obedience).toBe(60);
      expect(result.intimacy).toBe(50);
      expect(result.dailyCharmEarned).toBe(100);
      expect(result.totalTasksCompleted).toBe(1);
    });

    it('服从度不应该超过上限', () => {
      player.obedience = 95;
      const rewards = { charm: 10, obedience: 10, intimacy: 10 };
      const result = applyTaskRewards(player, rewards);
      expect(result.obedience).toBe(100);
    });

    it('服从度不应该低于下限', () => {
      player.obedience = 5;
      const rewards = { charm: 10, obedience: -10, intimacy: 10 };
      const result = applyTaskRewards(player, rewards);
      expect(result.obedience).toBe(0);
    });

    it('每日魅力获取不应该超过上限', () => {
      player.dailyCharmEarned = 480;
      const rewards = { charm: 50, obedience: 5, intimacy: 20 };
      const result = applyTaskRewards(player, rewards);
      expect(result.dailyCharmEarned).toBe(500);
      expect(result.charm).toBe(20);
    });

    it('亲密度不应该超过上限', () => {
      player.intimacy = GAME_CONFIG.MAX_INTIMACY - 10;
      const rewards = { charm: 10, obedience: 5, intimacy: 50 };
      const result = applyTaskRewards(player, rewards);
      expect(result.intimacy).toBe(GAME_CONFIG.MAX_INTIMACY);
    });
  });

  describe('checkDailyReset', () => {
    it('同一天不应该重置', () => {
      const tasks: Task[] = [];
      const result = checkDailyReset(player, tasks);
      expect(result.player.lastTaskRefreshDate).toBe(player.lastTaskRefreshDate);
      expect(result.yesterdayTasks).toBeNull();
    });
  });

  describe('getUnlockedDialoguePacks', () => {
    it('1级亲密度应该解锁基础台词包', () => {
      player.intimacy = 0;
      const packs = getUnlockedDialoguePacks(player);
      expect(packs.length).toBe(4);
      expect(packs).toContain('basic_intro');
      expect(packs).toContain('daily_idle');
    });

    it('3级亲密度应该解锁更多台词包', () => {
      player.intimacy = 4000;
      const packs = getUnlockedDialoguePacks(player);
      expect(packs.length).toBeGreaterThan(4);
      expect(packs).toContain('familiar_talk');
      expect(packs).toContain('intimate_whisper');
    });

    it('5级亲密度应该解锁全部台词包', () => {
      player.intimacy = 9500;
      const packs = getUnlockedDialoguePacks(player);
      expect(packs).toContain('eternal_bond');
    });
  });

  describe('getUnlockedAccessories', () => {
    it('应该根据亲密度等级解锁配饰', () => {
      player.intimacy = 0;
      const accs1 = getUnlockedAccessories(player);
      expect(accs1.length).toBeGreaterThan(0);

      player.intimacy = 4000;
      const accs3 = getUnlockedAccessories(player);
      expect(accs3.length).toBeGreaterThan(accs1.length);
    });
  });

  describe('checkLevelUp', () => {
    it('应该检测升级', () => {
      const oldPlayer = { ...player, level: 1 };
      const newPlayer = { ...player, level: 2 };
      expect(checkLevelUp(oldPlayer, newPlayer)).toBe(true);
    });

    it('等级相同不应该算升级', () => {
      const oldPlayer = { ...player, level: 1 };
      const newPlayer = { ...player, level: 1 };
      expect(checkLevelUp(oldPlayer, newPlayer)).toBe(false);
    });
  });

  describe('checkTierUp', () => {
    it('应该检测亲密度档位提升', () => {
      const oldPlayer = { ...player, intimacy: 500 };
      const newPlayer = { ...player, intimacy: 1500 };
      expect(checkTierUp(oldPlayer, newPlayer)).toBe(true);
    });
  });
});

describe('antiCheat - 反作弊系统', () => {
  let state: ReturnType<typeof createInitialAntiCheatState>;
  const baseTime = 1000000;

  beforeEach(() => {
    state = createInitialAntiCheatState();
  });

  describe('初始状态', () => {
    it('应该有正确的初始值', () => {
      expect(state.clickCount).toBe(0);
      expect(state.violationCount).toBe(0);
      expect(state.cooldownUntil).toBe(0);
    });
  });

  describe('registerClick', () => {
    it('正常点击应该被允许', () => {
      const result = registerClick(state, baseTime);
      expect(result.allowed).toBe(true);
      expect(result.state.clickCount).toBe(1);
    });

    it('短时间内过多点击应该触发冷却', () => {
      let result;
      for (let i = 0; i < 10; i++) {
        result = registerClick(state, baseTime + i * 50);
        state = result.state;
      }
      expect(result!.allowed).toBe(false);
      expect(result!.state.violationCount).toBeGreaterThan(0);
    });

    it('冷却期间点击应该被拒绝', () => {
      state = {
        ...state,
        cooldownUntil: baseTime + 5000,
      };
      const result = registerClick(state, baseTime);
      expect(result.allowed).toBe(false);
    });

    it('冷却结束后应该恢复正常', () => {
      state = {
        ...state,
        cooldownUntil: baseTime + 1000,
        violationCount: 1,
      };
      const result = registerClick(state, baseTime + 2000);
      expect(result.allowed).toBe(true);
    });
  });

  describe('isOnCooldown', () => {
    it('应该正确判断是否在冷却中', () => {
      state = { ...state, cooldownUntil: baseTime + 1000 };
      expect(isOnCooldown(state, baseTime)).toBe(true);
      expect(isOnCooldown(state, baseTime + 2000)).toBe(false);
    });
  });

  describe('getCooldownRemaining', () => {
    it('应该返回正确的剩余冷却时间', () => {
      state = { ...state, cooldownUntil: baseTime + 3000 };
      expect(getCooldownRemaining(state, baseTime)).toBe(3000);
      expect(getCooldownRemaining(state, baseTime + 4000)).toBe(0);
    });
  });
});

describe('saveSystem - 存档系统', () => {
  describe('createInitialPlayerState', () => {
    it('应该创建正确的初始状态', () => {
      const state = createInitialPlayerState();
      expect(state.charm).toBe(0);
      expect(state.obedience).toBe(50);
      expect(state.intimacy).toBe(0);
      expect(state.level).toBe(1);
      expect(state.dailyCharmEarned).toBe(0);
      expect(state.totalTasksCompleted).toBe(0);
      expect(state.totalDaysPlayed).toBe(1);
    });
  });

  describe('createInitialSaveData', () => {
    it('应该创建正确的初始存档', () => {
      const save = createInitialSaveData();
      expect(save.version).toBe(GAME_CONFIG.CURRENT_SAVE_VERSION);
      expect(save.dailyTasks.length).toBe(GAME_CONFIG.DAILY_TASK_COUNT);
      expect(save.yesterdayTasks).toBeNull();
    });
  });

  describe('getTodayString', () => {
    it('应该返回正确格式的日期字符串', () => {
      const today = getTodayString();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('migrateSaveData', () => {
    it('v1 存档应该能迁移到 v2', () => {
      const v1Save = {
        version: 1,
        player: {
          charm: 0,
          obedience: 50,
          intimacy: 0,
          level: 1,
          dailyCharmEarned: 0,
          totalTasksCompleted: 0,
          totalDaysPlayed: 1,
          lastLoginDate: '2024-01-01',
          lastTaskRefreshDate: '2024-01-01',
          yesterdayCompletionRate: 1,
          unlockedDialoguePacks: ['basic_intro'],
        },
        dailyTasks: [],
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      } as any;

      const migrated = migrateSaveData(v1Save);
      expect(migrated.version).toBe(2);
      expect(migrated.player.equippedAccessories).toBeDefined();
      expect(migrated.player.unlockedAccessories).toBeDefined();
      expect(migrated.yesterdayTasks).toBeNull();
    });

    it('当前版本存档应该不变化', () => {
      const save = createInitialSaveData();
      const migrated = migrateSaveData(save);
      expect(migrated.version).toBe(GAME_CONFIG.CURRENT_SAVE_VERSION);
    });
  });
});
