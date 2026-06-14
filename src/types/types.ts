export type TaskType = 'greeting' | 'feeding' | 'training';
export type TaskRarity = 'common' | 'rare' | 'epic';
export type MiniGameType = 'click' | 'qte' | 'quiz';
export type ExpressionType = 'happy' | 'normal' | 'shy' | 'angry' | 'sad';
export type IntimacyTier = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  type: TaskType;
  rarity: TaskRarity;
  title: string;
  description: string;
  miniGameType: MiniGameType;
  rewards: TaskRewards;
  completed: boolean;
  claimed: boolean;
}

export interface TaskRewards {
  charm: number;
  obedience: number;
  intimacy: number;
}

export interface DialogueLine {
  id: string;
  text: string;
  expression: ExpressionType;
  intimacyRequired: IntimacyTier;
}

export interface DialoguePack {
  id: string;
  name: string;
  description: string;
  intimacyRequired: IntimacyTier;
  lines: DialogueLine[];
  unlocked: boolean;
}

export interface Accessory {
  id: string;
  name: string;
  description: string;
  slot: AccessorySlot;
  intimacyRequired: IntimacyTier;
  color: string;
  unlocked: boolean;
}

export type AccessorySlot = 'hair' | 'earring' | 'necklace' | 'tail';

export interface PlayerState {
  charm: number;
  obedience: number;
  intimacy: number;
  level: number;
  dailyCharmEarned: number;
  totalTasksCompleted: number;
  totalDaysPlayed: number;
  lastLoginDate: string;
  lastTaskRefreshDate: string;
  yesterdayCompletionRate: number;
  equippedAccessories: Record<AccessorySlot, string | null>;
  unlockedDialoguePacks: string[];
  unlockedAccessories: string[];
  canMakeUpYesterday: boolean;
  madeUpYesterday: boolean;
}

export interface SaveData {
  version: number;
  player: PlayerState;
  dailyTasks: Task[];
  yesterdayTasks: Task[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  type: TaskType;
}

export interface AntiCheatState {
  lastClickTime: number;
  clickCount: number;
  cooldownUntil: number;
  violationCount: number;
}

export type SceneType = 'main' | 'taskList' | 'miniGame' | 'result' | 'dialogue' | 'wardrobe';

export interface GameEvent {
  type: string;
  data?: unknown;
}
