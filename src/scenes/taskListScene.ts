import type { Scene } from './sceneManager';
import type { GameState } from '../systems/gameState';
import type { Task } from '../types/types';
import { drawButton, drawText, drawProgressBar, isPointInRect, drawRoundedRect } from '../utils/uiUtils';
import { getRarityColor, getRarityName, getTaskTypeName, getMiniGameTypeName } from '../systems/taskSystem';
import { GAME_CONFIG } from '../config/gameConfig';

export class TaskListScene implements Scene {
  type = 'taskList' as const;
  
  private hoveredTask: number | null = null;
  private hoveredBack: boolean = false;
  
  enter(): void {}
  exit(): void {}
  
  update(deltaTime: number, gameState: GameState): void {
    gameState.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.drawBackground(ctx);
    this.drawHeader(ctx, gameState);
    this.drawTaskList(ctx, gameState);
    this.drawBackButton(ctx);
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, 720);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2c1e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);
    
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 40);
      ctx.lineTo(1280, i * 40 + 100);
      ctx.stroke();
    }
  }
  
  private drawHeader(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    drawRoundedRect(ctx, 30, 20, 1220, 80, 15);
    ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, '今日任务', 80, 45, {
      fontSize: 28,
      bold: true,
      color: '#ffffff',
    });
    
    const completed = gameState.tasks.filter(t => t.completed).length;
    const total = gameState.tasks.length;
    
    drawText(ctx, `进度: ${completed} / ${total}`, 800, 50, {
      fontSize: 20,
      color: completed === total ? '#2ecc71' : '#f39c12',
    });
    
    drawProgressBar(ctx, 950, 55, 250, 15, completed / total, {
      fillColor: completed === total ? '#2ecc71' : '#f39c12',
    });
    
    drawText(ctx, `今日魅力上限: ${gameState.player.dailyCharmEarned}/${GAME_CONFIG.MAX_DAILY_CHARM}`, 80, 70, {
      fontSize: 14,
      color: '#95a5a6',
    });
  }
  
  private drawTaskList(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const tasks = gameState.tasks;
    const cardW = 380;
    const cardH = 300;
    const startX = 80;
    const startY = 140;
    const gap = 40;
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const x = startX + i * (cardW + gap);
      const y = startY;
      const isHovered = this.hoveredTask === i;
      
      this.drawTaskCard(ctx, task, x, y, cardW, cardH, isHovered);
    }
  }
  
  private drawTaskCard(
    ctx: CanvasRenderingContext2D,
    task: Task,
    x: number,
    y: number,
    w: number,
    h: number,
    hovered: boolean
  ): void {
    const scale = hovered ? 1.03 : 1;
    const offsetX = (w * scale - w) / 2;
    const offsetY = (h * scale - h) / 2;
    
    ctx.save();
    ctx.translate(x - offsetX, y - offsetY);
    ctx.scale(scale, scale);
    
    drawRoundedRect(ctx, 0, 0, w, h, 20);
    
    if (task.completed) {
      ctx.fillStyle = 'rgba(46, 204, 113, 0.15)';
    } else {
      ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    }
    ctx.fill();
    
    ctx.strokeStyle = task.completed ? '#2ecc71' : getRarityColor(task.rarity);
    ctx.lineWidth = hovered ? 4 : 2;
    ctx.stroke();
    
    const rarityColor = getRarityColor(task.rarity);
    ctx.fillStyle = rarityColor;
    drawRoundedRect(ctx, 20, 20, 80, 30, 15);
    ctx.fill();
    drawText(ctx, getRarityName(task.rarity), 60, 27, {
      fontSize: 14,
      align: 'center',
      color: '#ffffff',
      bold: true,
    });
    
    drawText(ctx, task.title, 20, 70, {
      fontSize: 22,
      bold: true,
      color: '#ffffff',
    });
    
    drawText(ctx, `类型: ${getTaskTypeName(task.type)}`, 20, 105, {
      fontSize: 14,
      color: '#95a5a6',
    });
    
    drawText(ctx, `玩法: ${getMiniGameTypeName(task.miniGameType)}`, 20, 128, {
      fontSize: 14,
      color: '#95a5a6',
    });
    
    drawText(ctx, task.description, 20, 170, {
      fontSize: 15,
      color: '#bdc3c7',
    });
    
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 210);
    ctx.lineTo(w - 20, 210);
    ctx.stroke();
    
    drawText(ctx, '奖励', 20, 225, {
      fontSize: 14,
      color: '#f39c12',
      bold: true,
    });
    
    drawText(ctx, `✨ 魅力 +${task.rewards.charm}`, 20, 250, {
      fontSize: 13,
      color: '#f1c40f',
    });
    
    drawText(ctx, `💪 服从 +${task.rewards.obedience}`, 140, 250, {
      fontSize: 13,
      color: '#3498db',
    });
    
    drawText(ctx, `💕 亲密 +${task.rewards.intimacy}`, 260, 250, {
      fontSize: 13,
      color: '#e91e63',
    });
    
    const btnW = w - 40;
    const btnH = 45;
    const btnX = 20;
    const btnY = h - 60;
    
    if (task.completed) {
      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 10);
      ctx.fillStyle = '#2ecc71';
      ctx.fill();
      drawText(ctx, '✓ 已完成', btnX + btnW / 2, btnY + btnH / 2, {
        fontSize: 18,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
        bold: true,
      });
    } else {
      drawRoundedRect(ctx, btnX, btnY, btnW, btnH, 10);
      ctx.fillStyle = '#9b59b6';
      ctx.fill();
      drawText(ctx, '开始挑战', btnX + btnW / 2, btnY + btnH / 2, {
        fontSize: 18,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
        bold: true,
      });
    }
    
    ctx.restore();
  }
  
  private drawBackButton(ctx: CanvasRenderingContext2D): void {
    drawButton(ctx, 30, 640, 120, 50, '← 返回', {
      bgColor: '#7f8c8d',
      fontSize: 18,
      hovered: this.hoveredBack,
    });
  }
  
  handleClick(x: number, y: number, gameState: GameState): void {
    if (isPointInRect(x, y, 30, 640, 120, 50)) {
      gameState.currentScene = 'main';
      return;
    }
    
    const tasks = gameState.tasks;
    const cardW = 380;
    const cardH = 300;
    const startX = 80;
    const startY = 140;
    const gap = 40;
    
    for (let i = 0; i < tasks.length; i++) {
      const taskX = startX + i * (cardW + gap);
      if (isPointInRect(x, y, taskX, startY, cardW, cardH)) {
        if (!tasks[i].completed) {
          gameState.selectedTask = tasks[i];
          gameState.currentScene = 'miniGame';
        }
        return;
      }
    }
  }
  
  handleKeyPress(key: string, gameState: GameState): void {
    if (key === 'Escape') {
      gameState.currentScene = 'main';
    }
  }
  
  setHovered(x: number, y: number): void {
    this.hoveredBack = isPointInRect(x, y, 30, 640, 120, 50);
    
    const tasks = 3;
    const cardW = 380;
    const cardH = 300;
    const startX = 80;
    const startY = 140;
    const gap = 40;
    
    let hovered: number | null = null;
    for (let i = 0; i < tasks; i++) {
      const taskX = startX + i * (cardW + gap);
      if (isPointInRect(x, y, taskX, startY, cardW, cardH)) {
        hovered = i;
        break;
      }
    }
    this.hoveredTask = hovered;
  }
}
