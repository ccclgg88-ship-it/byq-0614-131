import type { SaveData, PlayerState, Task, SceneType, TaskRewards } from '../types/types';
import {
  loadSaveData,
  saveSaveData,
  createInitialSaveData,
  getTodayString,
} from '../systems/saveSystem';
import { checkDailyReset, applyTaskRewards, getUnlockedDialoguePacks, getUnlockedAccessories, checkTierUp } from '../systems/progressionSystem';
import { DIALOGUE_PACKS, ACCESSORIES } from '../data';

export class GameState {
  saveData: SaveData;
  currentScene: SceneType = 'main';
  selectedTask: Task | null = null;
  miniGameResult: { success: boolean; rewards: TaskRewards; task: Task } | null = null;
  showLevelUp: boolean = false;
  showTierUp: boolean = false;
  animationTime: number = 0;
  blinkTimer: number = 0;
  idleDialogue: { text: string; expression: string } | null = null;
  idleDialogueTimer: number = 0;
  notification: { message: string; timer: number } | null = null;
  
  constructor() {
    const saved = loadSaveData();
    if (saved) {
      this.saveData = saved;
      this.checkOfflineProgress();
    } else {
      this.saveData = createInitialSaveData();
      this.save();
    }
    this.updateUnlocks();
  }
  
  get player(): PlayerState {
    return this.saveData.player;
  }
  
  get tasks(): Task[] {
    return this.saveData.dailyTasks;
  }
  
  private checkOfflineProgress(): void {
    const today = getTodayString();
    const lastRefresh = this.saveData.player.lastTaskRefreshDate;
    
    if (lastRefresh !== today) {
      const result = checkDailyReset(this.saveData.player, this.saveData.dailyTasks);
      this.saveData.player = result.player;
      this.saveData.dailyTasks = result.tasks;
      if (result.yesterdayTasks) {
        this.saveData.yesterdayTasks = result.yesterdayTasks;
      }
      
      const daysMissed = this.getDaysSinceLastLogin();
      if (daysMissed > 0) {
        this.showNotification(`欢迎回来！你离开了 ${daysMissed} 天~`);
      }
      
      this.save();
    }
  }
  
  private getDaysSinceLastLogin(): number {
    const lastLogin = new Date(this.saveData.player.lastLoginDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - lastLogin.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }
  
  private updateUnlocks(): void {
    const dialoguePacks = getUnlockedDialoguePacks(this.saveData.player);
    const accessories = getUnlockedAccessories(this.saveData.player);
    
    const newDialogueUnlocks = dialoguePacks.filter(
      p => !this.saveData.player.unlockedDialoguePacks.includes(p)
    );
    const newAccessoryUnlocks = accessories.filter(
      a => !this.saveData.player.unlockedAccessories.includes(a)
    );
    
    this.saveData.player.unlockedDialoguePacks = dialoguePacks;
    this.saveData.player.unlockedAccessories = accessories;
    
    if (newDialogueUnlocks.length > 0 || newAccessoryUnlocks.length > 0) {
      let message = '解锁新内容！';
      if (newDialogueUnlocks.length > 0) {
        const packNames = newDialogueUnlocks.map(id => {
          const pack = DIALOGUE_PACKS.find(p => p.id === id);
          return pack ? pack.name : id;
        });
        message = `解锁新台词: ${packNames.join(', ')}`;
      }
      if (newAccessoryUnlocks.length > 0) {
        const accNames = newAccessoryUnlocks.map(id => {
          const acc = ACCESSORIES.find(a => a.id === id);
          return acc ? acc.name : id;
        });
        message = `解锁新配饰: ${accNames.join(', ')}`;
      }
      this.showNotification(message);
    }
  }
  
  completeTask(taskId: string, rewardMultiplier: number = 1): TaskRewards | null {
    const taskIndex = this.saveData.dailyTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    const task = this.saveData.dailyTasks[taskIndex];
    if (task.completed) return null;
    
    const actualRewards: TaskRewards = {
      charm: Math.floor(task.rewards.charm * rewardMultiplier),
      obedience: Math.floor(task.rewards.obedience * rewardMultiplier),
      intimacy: Math.floor(task.rewards.intimacy * rewardMultiplier),
    };
    
    const oldPlayer = { ...this.saveData.player };
    
    this.saveData.dailyTasks[taskIndex] = {
      ...task,
      completed: true,
      claimed: false,
    };
    
    this.saveData.player = applyTaskRewards(this.saveData.player, actualRewards);
    
    const tieredUp = checkTierUp(oldPlayer, this.saveData.player);
    if (tieredUp) {
      this.showTierUp = true;
    }
    
    this.updateUnlocks();
    this.save();
    
    return actualRewards;
  }
  
  claimTask(taskId: string): TaskRewards | null {
    const taskIndex = this.saveData.dailyTasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return null;
    
    const task = this.saveData.dailyTasks[taskIndex];
    if (!task.completed || task.claimed) return null;
    
    this.saveData.dailyTasks[taskIndex] = {
      ...task,
      claimed: true,
    };
    
    this.save();
    return task.rewards;
  }
  
  equipAccessory(accessoryId: string): void {
    const accessory = ACCESSORIES.find(a => a.id === accessoryId);
    if (!accessory) return;
    
    if (!this.saveData.player.unlockedAccessories.includes(accessoryId)) return;
    
    this.saveData.player.equippedAccessories[accessory.slot] = accessoryId;
    this.save();
  }
  
  unequipAccessory(slot: string): void {
    (this.saveData.player.equippedAccessories as Record<string, string | null>)[slot] = null;
    this.save();
  }
  
  showNotification(message: string): void {
    this.notification = { message, timer: 3 };
  }
  
  update(deltaTime: number): void {
    this.animationTime += deltaTime;
    
    this.blinkTimer += deltaTime;
    if (this.blinkTimer > 4) {
      this.blinkTimer = 0;
    }
    
    if (this.notification) {
      this.notification.timer -= deltaTime;
      if (this.notification.timer <= 0) {
        this.notification = null;
      }
    }
    
    if (this.currentScene === 'main') {
      this.idleDialogueTimer += deltaTime;
      if (this.idleDialogueTimer > 8 && !this.idleDialogue) {
        this.playRandomIdleLine();
        this.idleDialogueTimer = 0;
      }
      if (this.idleDialogue) {
        this.idleDialogueTimer += deltaTime * 0.5;
        if (this.idleDialogueTimer > 5) {
          this.idleDialogue = null;
          this.idleDialogueTimer = 0;
        }
      }
    }
  }
  
  playRandomIdleLine(): void {
    const tier = this.getIntimacyTier();
    const availablePacks = DIALOGUE_PACKS.filter(p => p.intimacyRequired <= tier && p.lines.length > 0);
    if (availablePacks.length === 0) return;
    
    const randomPack = availablePacks[Math.floor(Math.random() * availablePacks.length)];
    const randomLine = randomPack.lines[Math.floor(Math.random() * randomPack.lines.length)];
    
    this.idleDialogue = {
      text: randomLine.text,
      expression: randomLine.expression,
    };
  }
  
  getIntimacyTier(): number {
    const intimacy = this.saveData.player.intimacy;
    if (intimacy >= 9000) return 5;
    if (intimacy >= 6000) return 4;
    if (intimacy >= 3000) return 3;
    if (intimacy >= 1000) return 2;
    return 1;
  }
  
  save(): void {
    saveSaveData(this.saveData);
  }
  
  resetGame(): void {
    this.saveData = createInitialSaveData();
    this.save();
  }
  
  closeLevelUp(): void {
    this.showLevelUp = false;
  }
  
  closeTierUp(): void {
    this.showTierUp = false;
  }
}
