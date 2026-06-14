import type { Scene } from './sceneManager';
import type { GameState } from '../systems/gameState';
import { DIALOGUE_PACKS } from '../data/dialogues';
import { drawCharacter } from '../render/characterRenderer';
import { drawButton, drawText, isPointInRect, drawRoundedRect } from '../utils/uiUtils';
import { getIntimacyTier } from '../config/gameConfig';

export class DialogueScene implements Scene {
  type = 'dialogue' as const;
  
  private selectedPackIndex: number = 0;
  private selectedLineIndex: number = 0;
  private hoveredBack: boolean = false;
  private hoveredPrevPack: boolean = false;
  private hoveredNextPack: boolean = false;
  private hoveredPrevLine: boolean = false;
  private hoveredNextLine: boolean = false;
  private hoveredPlay: boolean = false;
  private isPlaying: boolean = false;
  private playTimer: number = 0;
  
  enter(gameState: GameState): void {
    const unlockedIndex = DIALOGUE_PACKS.findIndex(
      p => gameState.player.unlockedDialoguePacks.includes(p.id)
    );
    if (unlockedIndex >= 0) {
      this.selectedPackIndex = unlockedIndex;
      this.selectedLineIndex = 0;
    }
  }
  
  exit(): void {
    this.isPlaying = false;
    this.playTimer = 0;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    gameState.update(deltaTime);
    
    if (this.isPlaying) {
      this.playTimer += deltaTime;
      if (this.playTimer > 4) {
        this.isPlaying = false;
        this.playTimer = 0;
      }
    }
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.drawBackground(ctx);
    this.drawCharacterDisplay(ctx, gameState);
    this.drawPackList(ctx, gameState);
    this.drawLineDisplay(ctx, gameState);
    this.drawControls(ctx);
    this.drawBackButton(ctx);
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, 720);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2c1e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);
  }
  
  private drawCharacterDisplay(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    const line = pack?.lines[this.selectedLineIndex];
    
    const expression = this.isPlaying && line ? line.expression : 'normal';
    
    drawCharacter(ctx, gameState.player, {
      x: 350,
      y: 420,
      scale: 1.5,
      expression,
      animationTime: gameState.animationTime,
      blinkTimer: gameState.blinkTimer,
    });
    
    if (this.isPlaying && line) {
      const bubbleX = 500;
      const bubbleY = 200;
      const bubbleW = 400;
      const bubbleH = 150;
      
      drawRoundedRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 20);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      ctx.strokeStyle = '#e91e63';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(bubbleX + 40, bubbleY + bubbleH);
      ctx.lineTo(bubbleX + 20, bubbleY + bubbleH + 25);
      ctx.lineTo(bubbleX + 60, bubbleY + bubbleH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.fill();
      
      const lines = this.wrapText(line.text, bubbleW - 40, 20);
      let textY = bubbleY + 25;
      ctx.fillStyle = '#2c3e50';
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (const l of lines) {
        ctx.fillText(l, bubbleX + 20, textY);
        textY += 28;
      }
    }
  }
  
  private wrapText(text: string, maxWidth: number, fontSize: number): string[] {
    const lines: string[] = [];
    let currentLine = '';
    
    for (const char of text) {
      const testLine = currentLine + char;
      const testWidth = testLine.length * (fontSize * 0.55);
      
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
  
  private drawPackList(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const listX = 850;
    const listY = 80;
    const listW = 380;
    const listH = 560;
    
    drawRoundedRect(ctx, listX, listY, listW, listH, 15);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, '台词包', listX + listW / 2, listY + 25, {
      fontSize: 22,
      bold: true,
      align: 'center',
      color: '#9b59b6',
    });
    
    const itemH = 70;
    const startY = listY + 60;
    
    for (let i = 0; i < DIALOGUE_PACKS.length; i++) {
      const pack = DIALOGUE_PACKS[i];
      const y = startY + i * (itemH + 10);
      const isSelected = i === this.selectedPackIndex;
      const isUnlocked = gameState.player.unlockedDialoguePacks.includes(pack.id);
      
      drawRoundedRect(ctx, listX + 15, y, listW - 30, itemH, 10);
      if (isSelected) {
        ctx.fillStyle = 'rgba(155, 89, 182, 0.4)';
      } else if (isUnlocked) {
        ctx.fillStyle = 'rgba(155, 89, 182, 0.15)';
      } else {
        ctx.fillStyle = 'rgba(127, 140, 141, 0.2)';
      }
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#9b59b6';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      drawText(ctx, pack.name, listX + 30, y + 12, {
        fontSize: 16,
        bold: true,
        color: isUnlocked ? '#ffffff' : '#7f8c8d',
      });
      
      drawText(ctx, pack.description, listX + 30, y + 35, {
        fontSize: 12,
        color: isUnlocked ? '#bdc3c7' : '#7f8c8d',
      });
      
      if (!isUnlocked) {
        const tier = getIntimacyTier(pack.intimacyRequired * 1000 - 1) + 1;
        drawText(ctx, `🔒 亲密度 ${tier} 级解锁`, listX + listW - 30, y + 38, {
          fontSize: 11,
          align: 'right',
          color: '#e74c3c',
        });
      } else {
        drawText(ctx, `${pack.lines.length} 条台词`, listX + listW - 30, y + 38, {
          fontSize: 11,
          align: 'right',
          color: '#2ecc71',
        });
      }
    }
  }
  
  private drawLineDisplay(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    if (!pack) return;
    
    const line = pack.lines[this.selectedLineIndex];
    const isUnlocked = gameState.player.unlockedDialoguePacks.includes(pack.id);
    
    const panelX = 500;
    const panelY = 450;
    const panelW = 320;
    const panelH = 120;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 12);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, `台词 ${this.selectedLineIndex + 1} / ${pack.lines.length}`, panelX + panelW / 2, panelY + 15, {
      fontSize: 14,
      align: 'center',
      color: '#9b59b6',
    });
    
    if (isUnlocked && line) {
      const lines = this.wrapText(line.text, panelW - 30, 14);
      let textY = panelY + 40;
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      for (const l of lines) {
        ctx.fillText(l, panelX + panelW / 2, textY);
        textY += 20;
      }
      
      drawText(ctx, `表情: ${this.getExpressionName(line.expression)}`, panelX + panelW / 2, panelY + 95, {
        fontSize: 12,
        align: 'center',
        color: '#bdc3c7',
      });
    } else {
      drawText(ctx, '未解锁', panelX + panelW / 2, panelY + 50, {
        fontSize: 18,
        align: 'center',
        color: '#7f8c8d',
      });
    }
  }
  
  private getExpressionName(expr: string): string {
    const names: Record<string, string> = {
      happy: '开心',
      normal: '普通',
      shy: '害羞',
      angry: '生气',
      sad: '难过',
    };
    return names[expr] || expr;
  }
  
  private drawControls(ctx: CanvasRenderingContext2D): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    const isUnlocked = pack && this.isPackUnlocked(pack.id);
    
    drawButton(ctx, 520, 590, 60, 40, '◀', {
      bgColor: '#7f8c8d',
      fontSize: 18,
      hovered: this.hoveredPrevLine,
    });
    
    drawButton(ctx, 740, 590, 60, 40, '▶', {
      bgColor: '#7f8c8d',
      fontSize: 18,
      hovered: this.hoveredNextLine,
    });
    
    drawButton(ctx, 600, 590, 120, 40, isUnlocked ? '▶ 播放' : '🔒 未解锁', {
      bgColor: isUnlocked ? '#e91e63' : '#7f8c8d',
      fontSize: 16,
      hovered: this.hoveredPlay && isUnlocked,
    });
  }
  
  private drawBackButton(ctx: CanvasRenderingContext2D): void {
    drawButton(ctx, 30, 640, 120, 50, '← 返回', {
      bgColor: '#7f8c8d',
      fontSize: 18,
      hovered: this.hoveredBack,
    });
  }
  
  private isPackUnlocked(packId: string): boolean {
    const pack = DIALOGUE_PACKS.find(p => p.id === packId);
    if (!pack) return false;
    return true;
  }
  
  handleClick(x: number, y: number, gameState: GameState): void {
    if (isPointInRect(x, y, 30, 640, 120, 50)) {
      gameState.currentScene = 'main';
      return;
    }
    
    const listX = 850;
    const listY = 80;
    const listW = 380;
    const itemH = 70;
    const startY = listY + 60;
    
    for (let i = 0; i < DIALOGUE_PACKS.length; i++) {
      const y = startY + i * (itemH + 10);
      if (isPointInRect(x, y, listX + 15, y, listW - 30, itemH)) {
        if (gameState.player.unlockedDialoguePacks.includes(DIALOGUE_PACKS[i].id)) {
          this.selectedPackIndex = i;
          this.selectedLineIndex = 0;
          this.isPlaying = false;
        } else {
          gameState.showNotification('该台词包尚未解锁~');
        }
        return;
      }
    }
    
    if (isPointInRect(x, y, 520, 590, 60, 40)) {
      this.prevLine();
    } else if (isPointInRect(x, y, 740, 590, 60, 40)) {
      this.nextLine(gameState);
    } else if (isPointInRect(x, y, 600, 590, 120, 40)) {
      this.playLine(gameState);
    }
  }
  
  handleKeyPress(key: string, gameState: GameState): void {
    if (key === 'Escape') {
      gameState.currentScene = 'main';
    } else if (key === 'ArrowLeft') {
      this.prevLine();
    } else if (key === 'ArrowRight') {
      this.nextLine(gameState);
    } else if (key === ' ' || key === 'Enter') {
      this.playLine(gameState);
    }
  }
  
  private prevLine(): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    if (!pack) return;
    
    this.selectedLineIndex = Math.max(0, this.selectedLineIndex - 1);
    this.isPlaying = false;
  }
  
  private nextLine(gameState: GameState): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    if (!pack) return;
    
    if (!gameState.player.unlockedDialoguePacks.includes(pack.id)) return;
    
    this.selectedLineIndex = Math.min(pack.lines.length - 1, this.selectedLineIndex + 1);
    this.isPlaying = false;
  }
  
  private playLine(gameState: GameState): void {
    const pack = DIALOGUE_PACKS[this.selectedPackIndex];
    if (!pack || !gameState.player.unlockedDialoguePacks.includes(pack.id)) return;
    
    this.isPlaying = true;
    this.playTimer = 0;
  }
  
  setHovered(x: number, y: number): void {
    this.hoveredBack = isPointInRect(x, y, 30, 640, 120, 50);
    this.hoveredPrevLine = isPointInRect(x, y, 520, 590, 60, 40);
    this.hoveredNextLine = isPointInRect(x, y, 740, 590, 60, 40);
    this.hoveredPlay = isPointInRect(x, y, 600, 590, 120, 40);
  }
}
