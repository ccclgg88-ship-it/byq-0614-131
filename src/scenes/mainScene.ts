import type { Scene } from './sceneManager';
import type { GameState } from '../systems/gameState';
import { drawCharacter } from '../render/characterRenderer';
import { drawButton, drawText, drawProgressBar, isPointInRect, drawRoundedRect } from '../utils/uiUtils';
import { GAME_CONFIG, getCharmForNextLevel, getIntimacyTier } from '../config/gameConfig';
import { getRarityColor, getRarityName, getTaskTypeName, getMiniGameTypeName } from '../systems/taskSystem';

const INTIMACY_TIER_NAMES = ['', '陌生', '熟悉', '亲密', '挚爱', '永恒'];

export class MainScene implements Scene {
  type = 'main' as const;
  
  private hoveredButton: string | null = null;
  private mouseX = 0;
  private mouseY = 0;
  
  enter(): void {}
  exit(): void {}
  
  update(deltaTime: number, gameState: GameState): void {
    gameState.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.drawBackground(ctx);
    this.drawCharacter(ctx, gameState);
    this.drawStatusPanel(ctx, gameState);
    this.drawTaskPreview(ctx, gameState);
    this.drawMenuButtons(ctx, gameState);
    this.drawDialogueBubble(ctx, gameState);
    this.drawNotification(ctx, gameState);
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, 720);
    gradient.addColorStop(0, '#2c1e4a');
    gradient.addColorStop(0.5, '#3d2963');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);
    
    ctx.fillStyle = 'rgba(155, 89, 182, 0.1)';
    for (let i = 0; i < 20; i++) {
      const x = (i * 73 + 30) % 1280;
      const y = (i * 47 + 50) % 720;
      const size = 2 + (i % 3);
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(640, 650, 300, 40, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  
  private drawCharacter(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const expression = gameState.idleDialogue?.expression as any || 'normal';
    
    drawCharacter(ctx, gameState.player, {
      x: 640,
      y: 400,
      scale: 1.8,
      expression,
      animationTime: gameState.animationTime,
      blinkTimer: gameState.blinkTimer,
    });
  }
  
  private drawStatusPanel(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const panelX = 20;
    const panelY = 20;
    const panelW = 280;
    const panelH = 320;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 15);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, '莉莉丝', panelX + panelW / 2, panelY + 25, {
      fontSize: 24,
      align: 'center',
      bold: true,
      color: '#f39c12',
    });
    
    const tier = getIntimacyTier(gameState.player.intimacy);
    const tierName = INTIMACY_TIER_NAMES[tier];
    drawText(ctx, `亲密度等级: ${tierName}`, panelX + panelW / 2, panelY + 55, {
      fontSize: 16,
      align: 'center',
      color: '#e91e63',
    });
    
    const charmProgress = getCharmForNextLevel(gameState.player.charm);
    drawText(ctx, `魅力 Lv.${gameState.player.level}`, panelX + 20, panelY + 90, {
      fontSize: 16,
      bold: true,
      color: '#ffd700',
    });
    drawProgressBar(ctx, panelX + 20, panelY + 115, panelW - 40, 12, charmProgress.current / charmProgress.required, {
      fillColor: '#f1c40f',
    });
    drawText(ctx, `${charmProgress.current} / ${charmProgress.required}`, panelX + panelW / 2, panelY + 118, {
      fontSize: 11,
      align: 'center',
      color: '#ffffff',
    });
    
    drawText(ctx, `服从度`, panelX + 20, panelY + 145, {
      fontSize: 16,
      bold: true,
      color: '#3498db',
    });
    drawProgressBar(ctx, panelX + 20, panelY + 170, panelW - 40, 12, gameState.player.obedience / 100, {
      fillColor: '#3498db',
    });
    drawText(ctx, `${gameState.player.obedience} / 100`, panelX + panelW / 2, panelY + 173, {
      fontSize: 11,
      align: 'center',
      color: '#ffffff',
    });
    
    drawText(ctx, `亲密度`, panelX + 20, panelY + 200, {
      fontSize: 16,
      bold: true,
      color: '#e91e63',
    });
    drawProgressBar(ctx, panelX + 20, panelY + 225, panelW - 40, 12, gameState.player.intimacy / GAME_CONFIG.MAX_INTIMACY, {
      fillColor: '#e91e63',
    });
    drawText(ctx, `${gameState.player.intimacy} / ${GAME_CONFIG.MAX_INTIMACY}`, panelX + panelW / 2, panelY + 228, {
      fontSize: 11,
      align: 'center',
      color: '#ffffff',
    });
    
    drawText(ctx, `今日魅力: ${gameState.player.dailyCharmEarned}/${GAME_CONFIG.MAX_DAILY_CHARM}`, panelX + 20, panelY + 260, {
      fontSize: 13,
      color: '#95a5a6',
    });
    drawText(ctx, `游戏天数: ${gameState.player.totalDaysPlayed} 天`, panelX + 20, panelY + 285, {
      fontSize: 13,
      color: '#95a5a6',
    });
  }
  
  private drawTaskPreview(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const panelX = 980;
    const panelY = 20;
    const panelW = 280;
    const panelH = 400;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 15);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, '今日任务', panelX + panelW / 2, panelY + 25, {
      fontSize: 20,
      align: 'center',
      bold: true,
      color: '#9b59b6',
    });
    
    const tasks = gameState.tasks;
    const completed = tasks.filter(t => t.completed).length;
    drawText(ctx, `${completed} / ${tasks.length} 已完成`, panelX + panelW / 2, panelY + 55, {
      fontSize: 14,
      align: 'center',
      color: completed === tasks.length ? '#2ecc71' : '#f39c12',
    });
    
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const taskY = panelY + 80 + i * 100;
      const taskH = 85;
      
      drawRoundedRect(ctx, panelX + 15, taskY, panelW - 30, taskH, 10);
      ctx.fillStyle = task.completed ? 'rgba(46, 204, 113, 0.15)' : 'rgba(155, 89, 182, 0.15)';
      ctx.fill();
      ctx.strokeStyle = task.completed ? '#2ecc71' : getRarityColor(task.rarity);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      drawText(ctx, task.title, panelX + 25, taskY + 10, {
        fontSize: 15,
        bold: true,
        color: '#ffffff',
      });
      
      drawText(ctx, getRarityName(task.rarity), panelX + panelW - 25, taskY + 12, {
        fontSize: 12,
        align: 'right',
        color: getRarityColor(task.rarity),
      });
      
      drawText(ctx, `类型: ${getTaskTypeName(task.type)} · ${getMiniGameTypeName(task.miniGameType)}`, panelX + 25, taskY + 32, {
        fontSize: 11,
        color: '#95a5a6',
      });
      
      drawText(ctx, `奖励: ${task.rewards.charm}魅力 ${task.rewards.obedience}服从 ${task.rewards.intimacy}亲密`, panelX + 25, taskY + 50, {
        fontSize: 11,
        color: '#f39c12',
      });
      
      if (task.completed) {
        drawText(ctx, '✓ 已完成', panelX + panelW - 25, taskY + 65, {
          fontSize: 12,
          align: 'right',
          color: '#2ecc71',
          bold: true,
        });
      }
    }
  }
  
  private drawMenuButtons(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const btnY = 620;
    const btnW = 150;
    const btnH = 50;
    
    const buttons = [
      { id: 'tasks', text: '任务列表', x: 250, color: '#9b59b6' },
      { id: 'dialogue', text: '对话试听', x: 430, color: '#e91e63' },
      { id: 'wardrobe', text: '衣橱', x: 610, color: '#f39c12' },
      { id: 'achievement', text: '成就', x: 790, color: '#3498db' },
      { id: 'help', text: '帮助', x: 970, color: '#1abc9c' },
    ];
    
    for (const btn of buttons) {
      drawButton(ctx, btn.x, btnY, btnW, btnH, btn.text, {
        bgColor: btn.color,
        fontSize: 18,
        hovered: this.hoveredButton === btn.id,
      });
    }
    
    const startBtnX = 490;
    const startBtnY = 520;
    const startBtnW = 300;
    const startBtnH = 70;
    
    drawButton(ctx, startBtnX, startBtnY, startBtnW, startBtnH, '开始今天的任务 ♡', {
      bgColor: '#e91e63',
      fontSize: 24,
      hovered: this.hoveredButton === 'start',
      radius: 35,
    });
  }
  
  private drawDialogueBubble(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (!gameState.idleDialogue) return;
    
    const bubbleX = 750;
    const bubbleY = 200;
    const bubbleW = 350;
    const bubbleH = 120;
    
    drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 20);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(bubbleX + 30, bubbleY + bubbleH);
    ctx.lineTo(bubbleX + 10, bubbleY + bubbleH + 20);
    ctx.lineTo(bubbleX + 50, bubbleY + bubbleH);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fill();
    
    ctx.fillStyle = '#2c3e50';
    ctx.font = '18px "Microsoft YaHei", sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    
    const lines = this.wrapText(gameState.idleDialogue.text, bubbleW - 40, 18);
    let textY = bubbleY + 20;
    for (const line of lines) {
      ctx.fillText(line, bubbleX + 20, textY);
      textY += 24;
    }
  }
  
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    for (const char of text) {
      const testLine = currentLine + char;
      const testWidth = testLine.length * (fontSize * 0.6);
      
      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
  
  private drawNotification(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (!gameState.notification) return;
    
    const alpha = Math.min(1, gameState.notification.timer);
    
    const panelW = 400;
    const panelH = 50;
    const panelX = (1280 - panelW) / 2;
    const panelY = 100;
    
    ctx.globalAlpha = alpha;
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 10);
    ctx.fillStyle = '#9b59b6';
    ctx.fill();
    ctx.strokeStyle = '#d4a5ff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, gameState.notification.message, panelX + panelW / 2, panelY + panelH / 2, {
      fontSize: 18,
      align: 'center',
      baseline: 'middle',
      color: '#ffffff',
      bold: true,
    });
    ctx.globalAlpha = 1;
  }
  
  handleClick(x: number, y: number, gameState: GameState): void {
    this.mouseX = x;
    this.mouseY = y;
    
    const btnY = 620;
    const btnW = 150;
    const btnH = 50;
    
    const buttons = [
      { id: 'tasks', x: 250 },
      { id: 'dialogue', x: 430 },
      { id: 'wardrobe', x: 610 },
      { id: 'achievement', x: 790 },
      { id: 'help', x: 970 },
    ];
    
    for (const btn of buttons) {
      if (isPointInRect(x, y, btn.x, btnY, btnW, btnH)) {
        this.onButtonClick(btn.id, gameState);
        return;
      }
    }
    
    const startBtnX = 490;
    const startBtnY = 520;
    const startBtnW = 300;
    const startBtnH = 70;
    
    if (isPointInRect(x, y, startBtnX, startBtnY, startBtnW, startBtnH)) {
      this.onButtonClick('start', gameState);
      return;
    }
  }
  
  handleKeyPress(key: string, gameState: GameState): void {}
  
  private onButtonClick(buttonId: string, gameState: GameState): void {
    switch (buttonId) {
      case 'start':
      case 'tasks':
        gameState.currentScene = 'taskList';
        break;
      case 'dialogue':
        gameState.currentScene = 'dialogue';
        break;
      case 'wardrobe':
        gameState.currentScene = 'wardrobe';
        break;
      case 'achievement':
        gameState.showNotification('成就系统开发中...');
        break;
      case 'help':
        gameState.showNotification('点击任务开始小游戏，完成后获得奖励！');
        break;
    }
  }
  
  setHoveredButton(x: number, y: number): void {
    this.mouseX = x;
    this.mouseY = y;
    
    const btnY = 620;
    const btnW = 150;
    const btnH = 50;
    
    const buttons = [
      { id: 'tasks', x: 250 },
      { id: 'dialogue', x: 430 },
      { id: 'wardrobe', x: 610 },
      { id: 'achievement', x: 790 },
      { id: 'help', x: 970 },
    ];
    
    let hovered: string | null = null;
    
    for (const btn of buttons) {
      if (isPointInRect(x, y, btn.x, btnY, btnW, btnH)) {
        hovered = btn.id;
        break;
      }
    }
    
    if (!hovered) {
      const startBtnX = 490;
      const startBtnY = 520;
      const startBtnW = 300;
      const startBtnH = 70;
      
      if (isPointInRect(x, y, startBtnX, startBtnY, startBtnW, startBtnH)) {
        hovered = 'start';
      }
    }
    
    this.hoveredButton = hovered;
  }
}
