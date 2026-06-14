import type { Scene } from './sceneManager';
import type { GameState } from '../systems/gameState';
import type { AccessorySlot } from '../types/types';
import { ACCESSORIES } from '../data/accessories';
import { drawCharacter } from '../render/characterRenderer';
import { drawButton, drawText, isPointInRect, drawRoundedRect } from '../utils/uiUtils';

const SLOT_NAMES: Record<AccessorySlot, string> = {
  hair: '发饰',
  earring: '耳环',
  necklace: '项链',
  tail: '尾巴',
};

export class WardrobeScene implements Scene {
  type = 'wardrobe' as const;
  
  private selectedSlot: AccessorySlot = 'hair';
  private selectedAccessoryIndex: number = 0;
  private hoveredBack: boolean = false;
  private hoveredEquip: boolean = false;
  private hoveredUnequip: boolean = false;
  
  enter(): void {}
  exit(): void {}
  
  update(deltaTime: number, gameState: GameState): void {
    gameState.update(deltaTime);
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.drawBackground(ctx);
    this.drawCharacterDisplay(ctx, gameState);
    this.drawSlotTabs(ctx, gameState);
    this.drawAccessoryList(ctx, gameState);
    this.drawAccessoryDetail(ctx, gameState);
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
    drawCharacter(ctx, gameState.player, {
      x: 320,
      y: 420,
      scale: 1.6,
      expression: 'happy',
      animationTime: gameState.animationTime,
      blinkTimer: gameState.blinkTimer,
    });
    
    drawRoundedRect(ctx, 180, 60, 280, 50, 15);
    ctx.fillStyle = 'rgba(233, 30, 99, 0.3)';
    ctx.fill();
    ctx.strokeStyle = '#e91e63';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, '💕 衣橱', 320, 85, {
      fontSize: 24,
      bold: true,
      align: 'center',
      color: '#ffffff',
    });
  }
  
  private drawSlotTabs(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const slots: AccessorySlot[] = ['hair', 'earring', 'necklace', 'tail'];
    const tabW = 100;
    const tabH = 45;
    const startX = 520;
    const startY = 80;
    const gap = 10;
    
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      const x = startX + i * (tabW + gap);
      const isSelected = slot === this.selectedSlot;
      
      drawRoundedRect(ctx, x, startY, tabW, tabH, 10);
      ctx.fillStyle = isSelected ? '#e91e63' : 'rgba(155, 89, 182, 0.3)';
      ctx.fill();
      
      if (isSelected) {
        ctx.strokeStyle = '#ffb6c1';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      drawText(ctx, SLOT_NAMES[slot], x + tabW / 2, startY + tabH / 2, {
        fontSize: 16,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
        bold: isSelected,
      });
    }
  }
  
  private drawAccessoryList(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const listX = 520;
    const listY = 150;
    const listW = 300;
    const listH = 480;
    
    drawRoundedRect(ctx, listX, listY, listW, listH, 15);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const slotAccessories = ACCESSORIES.filter(a => a.slot === this.selectedSlot);
    
    const itemH = 65;
    const startY = listY + 20;
    
    for (let i = 0; i < slotAccessories.length; i++) {
      const acc = slotAccessories[i];
      const y = startY + i * (itemH + 8);
      const isSelected = i === this.selectedAccessoryIndex;
      const isUnlocked = gameState.player.unlockedAccessories.includes(acc.id);
      const isEquipped = gameState.player.equippedAccessories[this.selectedSlot] === acc.id;
      
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
      
      ctx.fillStyle = acc.color;
      ctx.beginPath();
      ctx.arc(listX + 45, y + itemH / 2, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isUnlocked ? '#ffffff' : '#7f8c8d';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      drawText(ctx, acc.name, listX + 75, y + 12, {
        fontSize: 15,
        bold: true,
        color: isUnlocked ? '#ffffff' : '#7f8c8d',
      });
      
      drawText(ctx, acc.description, listX + 75, y + 34, {
        fontSize: 11,
        color: isUnlocked ? '#bdc3c7' : '#7f8c8d',
      });
      
      if (isEquipped) {
        drawText(ctx, '✓ 已装备', listX + listW - 25, y + itemH / 2, {
          fontSize: 12,
          align: 'right',
          baseline: 'middle',
          color: '#2ecc71',
          bold: true,
        });
      } else if (!isUnlocked) {
        drawText(ctx, '🔒', listX + listW - 25, y + itemH / 2, {
          fontSize: 16,
          align: 'right',
          baseline: 'middle',
        });
      }
    }
  }
  
  private drawAccessoryDetail(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const slotAccessories = ACCESSORIES.filter(a => a.slot === this.selectedSlot);
    const acc = slotAccessories[this.selectedAccessoryIndex];
    if (!acc) return;
    
    const panelX = 850;
    const panelY = 150;
    const panelW = 380;
    const panelH = 480;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 15);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = acc.color;
    ctx.beginPath();
    ctx.arc(panelX + panelW / 2, panelY + 80, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    const isUnlocked = gameState.player.unlockedAccessories.includes(acc.id);
    
    drawText(ctx, acc.name, panelX + panelW / 2, panelY + 150, {
      fontSize: 24,
      bold: true,
      align: 'center',
      color: isUnlocked ? '#ffffff' : '#7f8c8d',
    });
    
    drawText(ctx, `部位: ${SLOT_NAMES[acc.slot]}`, panelX + panelW / 2, panelY + 190, {
      fontSize: 14,
      align: 'center',
      color: '#bdc3c7',
    });
    
    drawText(ctx, acc.description, panelX + panelW / 2, panelY + 230, {
      fontSize: 14,
      align: 'center',
      color: '#95a5a6',
    });
    
    if (!isUnlocked) {
      drawText(ctx, '🔒 未解锁', panelX + panelW / 2, panelY + 280, {
        fontSize: 20,
        align: 'center',
        color: '#e74c3c',
        bold: true,
      });
      
      drawText(ctx, `提升亲密度到 ${acc.intimacyRequired} 级解锁`, panelX + panelW / 2, panelY + 315, {
        fontSize: 13,
        align: 'center',
        color: '#95a5a6',
      });
    } else {
      const isEquipped = gameState.player.equippedAccessories[this.selectedSlot] === acc.id;
      
      if (isEquipped) {
        drawButton(ctx, panelX + 40, panelY + 350, panelW - 80, 50, '卸下', {
          bgColor: '#e67e22',
          fontSize: 18,
          hovered: this.hoveredUnequip,
          radius: 25,
        });
      } else {
        drawButton(ctx, panelX + 40, panelY + 350, panelW - 80, 50, '装备', {
          bgColor: '#2ecc71',
          fontSize: 18,
          hovered: this.hoveredEquip,
          radius: 25,
        });
      }
    }
    
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 30, panelY + 420);
    ctx.lineTo(panelX + panelW - 30, panelY + 420);
    ctx.stroke();
    
    const totalCount = ACCESSORIES.filter(a => a.slot === this.selectedSlot).length;
    const unlockedCount = ACCESSORIES.filter(
      a => a.slot === this.selectedSlot && gameState.player.unlockedAccessories.includes(a.id)
    ).length;
    
    drawText(ctx, `收集进度: ${unlockedCount} / ${totalCount}`, panelX + panelW / 2, panelY + 445, {
      fontSize: 14,
      align: 'center',
      color: unlockedCount === totalCount ? '#2ecc71' : '#f39c12',
    });
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
    
    const slots: AccessorySlot[] = ['hair', 'earring', 'necklace', 'tail'];
    const tabW = 100;
    const tabH = 45;
    const startX = 520;
    const startY = 80;
    const gap = 10;
    
    for (let i = 0; i < slots.length; i++) {
      const slotX = startX + i * (tabW + gap);
      if (isPointInRect(x, y, slotX, startY, tabW, tabH)) {
        this.selectedSlot = slots[i];
        this.selectedAccessoryIndex = 0;
        return;
      }
    }
    
    const listX = 520;
    const listY = 150;
    const listW = 300;
    const slotAccessories = ACCESSORIES.filter(a => a.slot === this.selectedSlot);
    const itemH = 65;
    const listStartY = listY + 20;
    
    for (let i = 0; i < slotAccessories.length; i++) {
      const itemY = listStartY + i * (itemH + 8);
      if (isPointInRect(x, y, listX + 15, itemY, listW - 30, itemH)) {
        this.selectedAccessoryIndex = i;
        return;
      }
    }
    
    const panelX = 850;
    const panelY = 150;
    const panelW = 380;
    
    const acc = slotAccessories[this.selectedAccessoryIndex];
    if (acc && gameState.player.unlockedAccessories.includes(acc.id)) {
      const isEquipped = gameState.player.equippedAccessories[this.selectedSlot] === acc.id;
      
      if (isPointInRect(x, y, panelX + 40, panelY + 350, panelW - 80, 50)) {
        if (isEquipped) {
          gameState.unequipAccessory(this.selectedSlot);
          gameState.showNotification('已卸下配饰');
        } else {
          gameState.equipAccessory(acc.id);
          gameState.showNotification(`已装备: ${acc.name}`);
        }
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
    
    const panelX = 850;
    const panelY = 150;
    const panelW = 380;
    
    const slotAccessories = ACCESSORIES.filter(a => a.slot === this.selectedSlot);
    const acc = slotAccessories[this.selectedAccessoryIndex];
    
    if (acc) {
      this.hoveredEquip = isPointInRect(x, y, panelX + 40, panelY + 350, panelW - 80, 50);
      this.hoveredUnequip = this.hoveredEquip;
    } else {
      this.hoveredEquip = false;
      this.hoveredUnequip = false;
    }
  }
}
