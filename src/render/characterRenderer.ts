import type { ExpressionType, AccessorySlot, PlayerState } from '../types/types';
import { getAccessoryById } from '../data/accessories';

interface CharacterRenderOptions {
  x: number;
  y: number;
  scale?: number;
  expression?: ExpressionType;
  animationTime?: number;
  blinkTimer?: number;
}

export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  options: CharacterRenderOptions
): void {
  const {
    x,
    y,
    scale = 1,
    expression = 'normal',
    animationTime = 0,
    blinkTimer = 0,
  } = options;
  
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  
  const breatheOffset = Math.sin(animationTime * 2) * 3;
  const swayOffset = Math.sin(animationTime * 1.5) * 5;
  
  drawTail(ctx, swayOffset, player);
  drawBody(ctx, breatheOffset);
  drawHorns(ctx, breatheOffset);
  drawHair(ctx, breatheOffset, swayOffset);
  drawFace(ctx, breatheOffset, expression, blinkTimer);
  drawAccessories(ctx, player, breatheOffset);
  
  ctx.restore();
}

function drawTail(
  ctx: CanvasRenderingContext2D,
  swayOffset: number,
  player: PlayerState
): void {
  ctx.save();
  
  const tailColor = '#8e44ad';
  const tailTipColor = '#9b59b6';
  
  ctx.beginPath();
  ctx.moveTo(0, 120);
  
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = swayOffset * t * 2 + Math.sin(t * Math.PI * 2) * 15;
    const y = 120 + t * 180;
    const width = 20 * (1 - t * 0.7);
    
    if (i === 0) {
      ctx.moveTo(x - width, y);
    } else {
      ctx.lineTo(x - width, y);
    }
  }
  
  for (let i = 20; i >= 0; i--) {
    const t = i / 20;
    const x = swayOffset * t * 2 + Math.sin(t * Math.PI * 2) * 15;
    const y = 120 + t * 180;
    const width = 20 * (1 - t * 0.7);
    ctx.lineTo(x + width, y);
  }
  
  ctx.closePath();
  
  const gradient = ctx.createLinearGradient(-30, 120, 30, 300);
  gradient.addColorStop(0, tailColor);
  gradient.addColorStop(1, tailTipColor);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  ctx.beginPath();
  const tipX = swayOffset * 2;
  const tipY = 300;
  
  ctx.moveTo(tipX, tipY + 25);
  ctx.quadraticCurveTo(tipX - 20, tipY + 10, tipX - 15, tipY - 5);
  ctx.quadraticCurveTo(tipX - 25, tipY - 15, tipX, tipY - 30);
  ctx.quadraticCurveTo(tipX + 25, tipY - 15, tipX + 15, tipY - 5);
  ctx.quadraticCurveTo(tipX + 20, tipY + 10, tipX, tipY + 25);
  ctx.fillStyle = tailTipColor;
  ctx.fill();
  
  const tailAcc = player.equippedAccessories.tail;
  if (tailAcc) {
    const acc = getAccessoryById(tailAcc);
    if (acc) {
      const accX = swayOffset * 0.6;
      const accY = 200;
      
      ctx.fillStyle = acc.color;
      ctx.beginPath();
      if (acc.id === 'tail_bow') {
        ctx.ellipse(accX - 12, accY, 12, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(accX + 12, accY, 12, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = darkenColor(acc.color, 20);
        ctx.beginPath();
        ctx.arc(accX, accY, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (acc.id === 'tail_bell') {
        ctx.beginPath();
        ctx.arc(accX, accY, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(accX - 3, accY - 3, 3, 0, Math.PI * 2);
        ctx.fill();
      } else if (acc.id === 'tail_ribbon') {
        ctx.fillRect(accX - 5, accY - 30, 10, 60);
      } else if (acc.id === 'tail_star') {
        drawStar(ctx, accX, accY, 5, 12, 6, acc.color);
      }
    }
  }
  
  ctx.restore();
}

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
): void {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;
  
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;
    
    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawBody(ctx: CanvasRenderingContext2D, breatheOffset: number): void {
  ctx.save();
  
  ctx.fillStyle = '#fdcbff';
  ctx.beginPath();
  ctx.ellipse(0, 50 + breatheOffset, 45, 65, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.moveTo(-40, 80 + breatheOffset);
  ctx.quadraticCurveTo(0, 110 + breatheOffset, 40, 80 + breatheOffset);
  ctx.lineTo(35, 140 + breatheOffset);
  ctx.quadraticCurveTo(0, 130 + breatheOffset, -35, 140 + breatheOffset);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#8e44ad';
  ctx.beginPath();
  ctx.moveTo(-35, 140 + breatheOffset);
  ctx.lineTo(-45, 200 + breatheOffset);
  ctx.quadraticCurveTo(0, 220 + breatheOffset, 45, 200 + breatheOffset);
  ctx.lineTo(35, 140 + breatheOffset);
  ctx.quadraticCurveTo(0, 150 + breatheOffset, -35, 140 + breatheOffset);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}

function drawHorns(ctx: CanvasRenderingContext2D, breatheOffset: number): void {
  ctx.save();
  
  ctx.fillStyle = '#4a235a';
  
  ctx.beginPath();
  ctx.moveTo(-35, -130 + breatheOffset);
  ctx.quadraticCurveTo(-50, -180 + breatheOffset, -40, -200 + breatheOffset);
  ctx.quadraticCurveTo(-30, -190 + breatheOffset, -25, -150 + breatheOffset);
  ctx.quadraticCurveTo(-20, -140 + breatheOffset, -35, -130 + breatheOffset);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(35, -130 + breatheOffset);
  ctx.quadraticCurveTo(50, -180 + breatheOffset, 40, -200 + breatheOffset);
  ctx.quadraticCurveTo(30, -190 + breatheOffset, 25, -150 + breatheOffset);
  ctx.quadraticCurveTo(20, -140 + breatheOffset, 35, -130 + breatheOffset);
  ctx.fill();
  
  ctx.fillStyle = '#6c3483';
  ctx.beginPath();
  ctx.ellipse(-37, -195 + breatheOffset, 6, 4, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(37, -195 + breatheOffset, 6, 4, -0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawHair(
  ctx: CanvasRenderingContext2D,
  breatheOffset: number,
  swayOffset: number
): void {
  ctx.save();
  
  const gradient = ctx.createLinearGradient(-60, -150, 60, 150);
  gradient.addColorStop(0, '#2c1e4a');
  gradient.addColorStop(0.5, '#6c3483');
  gradient.addColorStop(1, '#9b59b6');
  
  ctx.fillStyle = gradient;
  
  ctx.beginPath();
  ctx.ellipse(0, -100 + breatheOffset, 55, 70, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(-50, -80 + breatheOffset);
  ctx.quadraticCurveTo(-70 + swayOffset * 0.5, 0 + breatheOffset, -55 + swayOffset * 0.3, 100 + breatheOffset);
  ctx.quadraticCurveTo(-45 + swayOffset * 0.2, 130 + breatheOffset, -30, 120 + breatheOffset);
  ctx.quadraticCurveTo(-40 + swayOffset * 0.3, 50 + breatheOffset, -45, -60 + breatheOffset);
  ctx.closePath();
  ctx.fill();
  
  ctx.beginPath();
  ctx.moveTo(50, -80 + breatheOffset);
  ctx.quadraticCurveTo(70 - swayOffset * 0.5, 0 + breatheOffset, 55 - swayOffset * 0.3, 100 + breatheOffset);
  ctx.quadraticCurveTo(45 - swayOffset * 0.2, 130 + breatheOffset, 30, 120 + breatheOffset);
  ctx.quadraticCurveTo(40 - swayOffset * 0.3, 50 + breatheOffset, 45, -60 + breatheOffset);
  ctx.closePath();
  ctx.fill();
  
  ctx.fillStyle = '#2c1e4a';
  ctx.beginPath();
  ctx.moveTo(0, -165 + breatheOffset);
  ctx.quadraticCurveTo(20, -170 + breatheOffset, 35, -155 + breatheOffset);
  ctx.quadraticCurveTo(25, -160 + breatheOffset, 15, -158 + breatheOffset);
  ctx.quadraticCurveTo(5, -162 + breatheOffset, 0, -165 + breatheOffset);
  ctx.fill();
  
  ctx.restore();
}

function drawFace(
  ctx: CanvasRenderingContext2D,
  breatheOffset: number,
  expression: ExpressionType,
  blinkTimer: number
): void {
  ctx.save();
  ctx.translate(0, -90 + breatheOffset);
  
  ctx.fillStyle = '#ffe4f0';
  ctx.beginPath();
  ctx.ellipse(0, 0, 40, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  
  const isBlinking = blinkTimer < 0.15;
  
  if (isBlinking) {
    ctx.strokeStyle = '#2c1e4a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-20, -5);
    ctx.lineTo(-8, -5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -5);
    ctx.lineTo(20, -5);
    ctx.stroke();
  } else {
    drawEye(ctx, -14, -5, expression);
    drawEye(ctx, 14, -5, expression);
  }
  
  ctx.fillStyle = '#ffb6c1';
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(-25, 10, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(25, 10, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  
  drawMouth(ctx, expression);
  
  ctx.restore();
}

function drawEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  expression: ExpressionType
): void {
  ctx.save();
  ctx.translate(x, y);
  
  const eyeHeight = expression === 'happy' ? 8 : expression === 'angry' ? 10 : 12;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 0, 9, eyeHeight, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#9b59b6';
  ctx.beginPath();
  ctx.arc(0, 2, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#2c1e4a';
  ctx.beginPath();
  ctx.arc(0, 2, 4, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(-2, 0, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.strokeStyle = '#2c1e4a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  if (expression === 'angry') {
    ctx.moveTo(-10, -12);
    ctx.lineTo(-2, -9);
  } else if (expression === 'sad') {
    ctx.moveTo(-10, -8);
    ctx.lineTo(-2, -11);
  } else {
    ctx.moveTo(-10, -10);
    ctx.lineTo(-2, -12);
  }
  ctx.stroke();
  
  ctx.restore();
}

function drawMouth(ctx: CanvasRenderingContext2D, expression: ExpressionType): void {
  ctx.strokeStyle = '#e91e63';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  
  switch (expression) {
    case 'happy':
      ctx.arc(0, 15, 8, 0, Math.PI);
      break;
    case 'shy':
      ctx.arc(0, 18, 5, 0.2, Math.PI - 0.2);
      break;
    case 'angry':
      ctx.arc(0, 22, 6, Math.PI, 0);
      break;
    case 'sad':
      ctx.arc(0, 20, 6, Math.PI + 0.3, -0.3);
      break;
    case 'normal':
    default:
      ctx.arc(0, 16, 5, 0.1, Math.PI - 0.1);
      break;
  }
  
  ctx.stroke();
}

function drawAccessories(
  ctx: CanvasRenderingContext2D,
  player: PlayerState,
  breatheOffset: number
): void {
  const hairAcc = player.equippedAccessories.hair;
  if (hairAcc) {
    const acc = getAccessoryById(hairAcc);
    if (acc) {
      ctx.save();
      ctx.translate(0, -155 + breatheOffset);
      ctx.fillStyle = acc.color;
      
      if (acc.id === 'ribbon_red' || acc.id === 'ribbon_black') {
        ctx.beginPath();
        ctx.ellipse(-15, 0, 15, 10, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(15, 0, 15, 10, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = darkenColor(acc.color, 15);
        ctx.beginPath();
        ctx.arc(0, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (acc.id === 'crown_silver') {
        ctx.beginPath();
        ctx.moveTo(-25, 5);
        ctx.lineTo(-20, -15);
        ctx.lineTo(-12, 0);
        ctx.lineTo(0, -20);
        ctx.lineTo(12, 0);
        ctx.lineTo(20, -15);
        ctx.lineTo(25, 5);
        ctx.closePath();
        ctx.fill();
      } else if (acc.id === 'flower_rose') {
        for (let i = 0; i < 5; i++) {
          ctx.beginPath();
          const angle = (i / 5) * Math.PI * 2;
          ctx.ellipse(
            Math.cos(angle) * 8,
            Math.sin(angle) * 8 - 5,
            10,
            6,
            angle,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(0, -5, 5, 0, Math.PI * 2);
        ctx.fill();
      }
      
      ctx.restore();
    }
  }
  
  const earringAcc = player.equippedAccessories.earring;
  if (earringAcc) {
    const acc = getAccessoryById(earringAcc);
    if (acc) {
      ctx.save();
      ctx.fillStyle = acc.color;
      
      ctx.beginPath();
      ctx.arc(-38, -85 + breatheOffset, 4, 0, Math.PI * 2);
      ctx.fill();
      
      if (acc.id === 'earring_heart') {
        ctx.beginPath();
        ctx.moveTo(-38, -78 + breatheOffset);
        ctx.bezierCurveTo(
          -43, -75 + breatheOffset,
          -43, -68 + breatheOffset,
          -38, -72 + breatheOffset
        );
        ctx.bezierCurveTo(
          -33, -68 + breatheOffset,
          -33, -75 + breatheOffset,
          -38, -78 + breatheOffset
        );
        ctx.fill();
      } else if (acc.id === 'earring_ruby') {
        ctx.beginPath();
        ctx.moveTo(-38, -77 + breatheOffset);
        ctx.lineTo(-42, -72 + breatheOffset);
        ctx.lineTo(-38, -68 + breatheOffset);
        ctx.lineTo(-34, -72 + breatheOffset);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(-39, -80 + breatheOffset, 2, 10);
      }
      
      ctx.beginPath();
      ctx.arc(38, -85 + breatheOffset, 4, 0, Math.PI * 2);
      ctx.fill();
      
      if (acc.id === 'earring_heart') {
        ctx.beginPath();
        ctx.moveTo(38, -78 + breatheOffset);
        ctx.bezierCurveTo(
          33, -75 + breatheOffset,
          33, -68 + breatheOffset,
          38, -72 + breatheOffset
        );
        ctx.bezierCurveTo(
          43, -68 + breatheOffset,
          43, -75 + breatheOffset,
          38, -78 + breatheOffset
        );
        ctx.fill();
      } else if (acc.id === 'earring_ruby') {
        ctx.beginPath();
        ctx.moveTo(38, -77 + breatheOffset);
        ctx.lineTo(34, -72 + breatheOffset);
        ctx.lineTo(38, -68 + breatheOffset);
        ctx.lineTo(42, -72 + breatheOffset);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillRect(37, -80 + breatheOffset, 2, 10);
      }
      
      ctx.restore();
    }
  }
  
  const necklaceAcc = player.equippedAccessories.necklace;
  if (necklaceAcc) {
    const acc = getAccessoryById(necklaceAcc);
    if (acc) {
      ctx.save();
      ctx.translate(0, 65 + breatheOffset);
      ctx.strokeStyle = acc.color;
      ctx.lineWidth = 3;
      ctx.fillStyle = acc.color;
      
      if (acc.id === 'necklace_black' || acc.id === 'necklace_chain') {
        ctx.beginPath();
        ctx.arc(0, -5, 25, 0.2, Math.PI - 0.2);
        ctx.stroke();
      } else if (acc.id === 'necklace_heart') {
        ctx.beginPath();
        ctx.arc(0, -5, 25, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, 25);
        ctx.bezierCurveTo(-10, 20, -12, 10, 0, 15);
        ctx.bezierCurveTo(12, 10, 10, 20, 0, 25);
        ctx.fill();
      } else if (acc.id === 'necklace_gem') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, -5, 25, 0.2, Math.PI - 0.2);
        ctx.stroke();
        
        ctx.fillStyle = acc.color;
        ctx.beginPath();
        ctx.moveTo(0, 20);
        ctx.lineTo(-8, 28);
        ctx.lineTo(0, 40);
        ctx.lineTo(8, 28);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.moveTo(-2, 24);
        ctx.lineTo(-5, 28);
        ctx.lineTo(-2, 32);
        ctx.closePath();
        ctx.fill();
        ctx.globalAlpha = 1;
      }
      
      ctx.restore();
    }
  }
}

function darkenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00ff) - amt);
  const B = Math.max(0, (num & 0x0000ff) - amt);
  return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
}
