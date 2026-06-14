import type { Task, TaskType, TaskRarity, MiniGameType, PlayerState, TaskRewards } from '../types/types';
import { GAME_CONFIG, clamp } from '../config/gameConfig';
import { getTodayString } from './saveSystem';

const TASK_TITLES: Record<TaskType, string[]> = {
  greeting: [
    '早安问候',
    '温柔呼唤',
    '甜蜜早安',
    '深情问候',
  ],
  feeding: [
    '美味早餐',
    '下午茶时间',
    '亲手喂食',
    '特制点心',
  ],
  training: [
    '服从训练',
    '礼仪练习',
    '技能训练',
    '意志考验',
  ],
};

const TASK_DESCRIPTIONS: Record<TaskType, Record<TaskRarity, string>> = {
  greeting: {
    common: '向莉莉丝送上今日的问候',
    rare: '用特别的方式向莉莉丝问候',
    epic: '以最深情的方式唤醒莉莉丝',
  },
  feeding: {
    common: '给莉莉丝准备一份小食',
    rare: '为莉莉丝准备特别的美食',
    epic: '亲手制作最美味的料理',
  },
  training: {
    common: '进行基础的服从训练',
    rare: '挑战进阶训练项目',
    epic: '完成传说级的训练考验',
  },
};

const MINI_GAME_BY_TYPE: Record<TaskType, MiniGameType[]> = {
  greeting: ['click', 'quiz'],
  feeding: ['click', 'qte'],
  training: ['qte', 'quiz'],
};

export function calculateTaskRewards(type: TaskType, rarity: TaskRarity): TaskRewards {
  const base = GAME_CONFIG.BASE_REWARDS[type];
  const multiplier = GAME_CONFIG.RARITY_MULTIPLIERS[rarity];
  
  return {
    charm: Math.floor(base.charm * multiplier),
    obedience: Math.floor(base.obedience * multiplier),
    intimacy: Math.floor(base.intimacy * multiplier),
  };
}

export function calculateRareTaskProbability(completionRate: number): { rare: number; epic: number } {
  const rate = clamp(completionRate, 0, 1);
  const bonusMultiplier = GAME_CONFIG.COMPLETION_RATE_BONUS_MULTIPLIER;
  
  const rareProb = GAME_CONFIG.RARE_TASK_BASE_PROBABILITY * (1 + rate * bonusMultiplier);
  const epicProb = GAME_CONFIG.EPIC_TASK_BASE_PROBABILITY * (1 + rate * bonusMultiplier);
  
  return {
    rare: clamp(rareProb, 0, 0.5),
    epic: clamp(epicProb, 0, 0.15),
  };
}

export function rollTaskRarity(completionRate: number): TaskRarity {
  const probs = calculateRareTaskProbability(completionRate);
  const roll = Math.random();
  
  if (roll < probs.epic) return 'epic';
  if (roll < probs.epic + probs.rare) return 'rare';
  return 'common';
}

export function createInitialDailyTasks(player: PlayerState): Task[] {
  const tasks: Task[] = [];
  const types: TaskType[] = ['greeting', 'feeding', 'training'];
  
  for (let i = 0; i < GAME_CONFIG.DAILY_TASK_COUNT; i++) {
    const type = types[i % types.length];
    const rarity = rollTaskRarity(player.yesterdayCompletionRate);
    const titles = TASK_TITLES[type];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const description = TASK_DESCRIPTIONS[type][rarity];
    const miniGameOptions = MINI_GAME_BY_TYPE[type];
    const miniGameType = miniGameOptions[Math.floor(Math.random() * miniGameOptions.length)];
    const rewards = calculateTaskRewards(type, rarity);
    
    tasks.push({
      id: `task_${getTodayString()}_${i}_${Date.now()}`,
      type,
      rarity,
      title,
      description,
      miniGameType,
      rewards,
      completed: false,
      claimed: false,
    });
  }
  
  return tasks;
}

export function getCompletedTaskCount(tasks: Task[]): number {
  return tasks.filter(t => t.completed).length;
}

export function getCompletionRate(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return getCompletedTaskCount(tasks) / tasks.length;
}

export function canClaimTask(task: Task): boolean {
  return task.completed && !task.claimed;
}

export function getRarityColor(rarity: TaskRarity): string {
  switch (rarity) {
    case 'common': return '#95a5a6';
    case 'rare': return '#3498db';
    case 'epic': return '#9b59b6';
  }
}

export function getRarityName(rarity: TaskRarity): string {
  switch (rarity) {
    case 'common': return '普通';
    case 'rare': return '稀有';
    case 'epic': return '史诗';
  }
}

export function getTaskTypeName(type: TaskType): string {
  switch (type) {
    case 'greeting': return '问候';
    case 'feeding': return '投喂';
    case 'training': return '训练';
  }
}

export function getMiniGameTypeName(type: MiniGameType): string {
  switch (type) {
    case 'click': return '点击挑战';
    case 'qte': return 'QTE 反应';
    case 'quiz': return '知识问答';
  }
}
