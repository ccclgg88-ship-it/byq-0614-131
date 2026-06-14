export function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function drawButton(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  text: string,
  options?: {
    bgColor?: string;
    textColor?: string;
    fontSize?: number;
    radius?: number;
    hovered?: boolean;
  }
): void {
  const {
    bgColor = '#9b59b6',
    textColor = '#ffffff',
    fontSize = 20,
    radius = 10,
    hovered = false,
  } = options || {};
  
  ctx.save();
  
  drawRoundedRect(ctx, x, y, width, height, radius);
  
  if (hovered) {
    ctx.fillStyle = lightenColor(bgColor, 20);
  } else {
    ctx.fillStyle = bgColor;
  }
  ctx.fill();
  
  ctx.fillStyle = textColor;
  ctx.font = `bold ${fontSize}px "Microsoft YaHei", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + width / 2, y + height / 2);
  
  ctx.restore();
}

export function drawText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options?: {
    color?: string;
    fontSize?: number;
    align?: CanvasTextAlign;
    baseline?: CanvasTextBaseline;
    bold?: boolean;
  }
): void {
  const {
    color = '#ffffff',
    fontSize = 16,
    align = 'left',
    baseline = 'top',
    bold = false,
  } = options || {};
  
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `${bold ? 'bold ' : ''}${fontSize}px "Microsoft YaHei", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, x, y);
  ctx.restore();
}

export function drawProgressBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  progress: number,
  options?: {
    bgColor?: string;
    fillColor?: string;
    radius?: number;
  }
): void {
  const {
    bgColor = 'rgba(255, 255, 255, 0.2)',
    fillColor = '#9b59b6',
    radius = 5,
  } = options || {};
  
  const clampedProgress = Math.max(0, Math.min(1, progress));
  
  drawRoundedRect(ctx, x, y, width, height, radius);
  ctx.fillStyle = bgColor;
  ctx.fill();
  
  if (clampedProgress > 0) {
    const fillWidth = width * clampedProgress;
    drawRoundedRect(ctx, x, y, fillWidth, height, radius);
    ctx.fillStyle = fillColor;
    ctx.fill();
  }
}

export function isPointInRect(
  x: number,
  y: number,
  rectX: number,
  rectY: number,
  rectWidth: number,
  rectHeight: number
): boolean {
  return x >= rectX && x <= rectX + rectWidth && y >= rectY && y <= rectY + rectHeight;
}

export function lightenColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export function darkenColor(color: string, percent: number): string {
  return lightenColor(color, -percent);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeOutQuad(t: number): number {
  return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}
