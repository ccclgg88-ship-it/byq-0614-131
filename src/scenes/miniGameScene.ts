import type { Scene } from './sceneManager';
import type { GameState } from '../systems/gameState';
import { createClickGame, startClickGame, updateClickGame, handleClickGameClick, calculateClickGameRewardMultiplier, type ClickGameState } from '../minigames/clickGame';
import { createQTEGame, startQTEGame, updateQTEGame, handleQTEKeyPress, calculateQTERewardMultiplier, type QTEGameState } from '../minigames/qteGame';
import { createQuizGame, startQuizGame, updateQuizGame, submitAnswer, nextQuestion, calculateQuizRewardMultiplier, type QuizGameState } from '../minigames/quizGame';
import { drawButton, drawText, drawProgressBar, isPointInRect, drawRoundedRect } from '../utils/uiUtils';
import { getTaskTypeName, getMiniGameTypeName, getRarityName, getRarityColor } from '../systems/taskSystem';

type MiniGameState = ClickGameState | QTEGameState | QuizGameState;

export class MiniGameScene implements Scene {
  type = 'miniGame' as const;
  
  private gameState: MiniGameState | null = null;
  private gamePhase: 'intro' | 'playing' | 'result' = 'intro';
  private hoveredStart: boolean = false;
  private hoveredNext: boolean = false;
  private hoveredBack: boolean = false;
  private rewardMultiplier: number = 1;
  
  enter(gameState: GameState): void {
    this.gamePhase = 'intro';
    this.rewardMultiplier = 1;
    
    const task = gameState.selectedTask;
    if (!task) return;
    
    let difficulty: 'easy' | 'normal' | 'hard' = 'normal';
    if (task.rarity === 'common') difficulty = 'easy';
    if (task.rarity === 'epic') difficulty = 'hard';
    
    switch (task.miniGameType) {
      case 'click':
        this.gameState = createClickGame(difficulty);
        break;
      case 'qte':
        this.gameState = createQTEGame(difficulty);
        break;
      case 'quiz':
        this.gameState = createQuizGame(5, 15, task.type);
        break;
    }
  }
  
  exit(): void {
    this.gameState = null;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    gameState.update(deltaTime);
    
    if (this.gamePhase !== 'playing' || !this.gameState) return;
    
    const task = gameState.selectedTask;
    if (!task) return;
    
    switch (task.miniGameType) {
      case 'click':
        this.gameState = updateClickGame(this.gameState as ClickGameState, deltaTime);
        break;
      case 'qte':
        this.gameState = updateQTEGame(this.gameState as QTEGameState, deltaTime);
        break;
      case 'quiz':
        this.gameState = updateQuizGame(this.gameState as QuizGameState, deltaTime);
        break;
    }
    
    if ((this.gameState as any).isFinished && this.gamePhase === 'playing') {
      this.gamePhase = 'result';
      this.calculateRewardMultiplier(task.miniGameType);
    }
  }
  
  private calculateRewardMultiplier(gameType: string): void {
    if (!this.gameState) return;
    
    switch (gameType) {
      case 'click':
        this.rewardMultiplier = calculateClickGameRewardMultiplier(this.gameState as ClickGameState);
        break;
      case 'qte':
        this.rewardMultiplier = calculateQTERewardMultiplier(this.gameState as QTEGameState);
        break;
      case 'quiz':
        this.rewardMultiplier = calculateQuizRewardMultiplier(this.gameState as QuizGameState);
        break;
    }
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    this.drawBackground(ctx);
    this.drawTaskInfo(ctx, gameState);
    
    const task = gameState.selectedTask;
    if (!task) return;
    
    if (this.gamePhase === 'intro') {
      this.drawIntro(ctx, gameState);
    } else if (this.gamePhase === 'playing') {
      switch (task.miniGameType) {
        case 'click':
          this.renderClickGame(ctx, this.gameState as ClickGameState);
          break;
        case 'qte':
          this.renderQTEGame(ctx, this.gameState as QTEGameState);
          break;
        case 'quiz':
          this.renderQuizGame(ctx, this.gameState as QuizGameState);
          break;
      }
    } else if (this.gamePhase === 'result') {
      this.drawResult(ctx, gameState);
    }
    
    this.drawBackButton(ctx);
  }
  
  private drawBackground(ctx: CanvasRenderingContext2D): void {
    const gradient = ctx.createLinearGradient(0, 0, 0, 720);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#2c1e4a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1280, 720);
  }
  
  private drawTaskInfo(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task) return;
    
    drawRoundedRect(ctx, 30, 20, 1220, 70, 15);
    ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
    ctx.fill();
    ctx.strokeStyle = getRarityColor(task.rarity);
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, task.title, 50, 35, {
      fontSize: 22,
      bold: true,
      color: '#ffffff',
    });
    
    drawText(ctx, `${getRarityName(task.rarity)} · ${getTaskTypeName(task.type)} · ${getMiniGameTypeName(task.miniGameType)}`, 50, 60, {
      fontSize: 14,
      color: '#bdc3c7',
    });
    
    if (this.gameState && this.gamePhase === 'playing') {
      const gs = this.gameState as any;
      drawText(ctx, `得分: ${gs.score} / ${gs.targetScore}`, 1000, 40, {
        fontSize: 18,
        color: '#f39c12',
        bold: true,
      });
    }
  }
  
  private drawIntro(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task) return;
    
    const panelX = 340;
    const panelY = 200;
    const panelW = 600;
    const panelH = 350;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 20);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    ctx.fill();
    ctx.strokeStyle = getRarityColor(task.rarity);
    ctx.lineWidth = 3;
    ctx.stroke();
    
    drawText(ctx, getMiniGameTypeName(task.miniGameType), panelX + panelW / 2, panelY + 50, {
      fontSize: 28,
      bold: true,
      align: 'center',
      color: '#9b59b6',
    });
    
    drawText(ctx, task.description, panelX + panelW / 2, panelY + 100, {
      fontSize: 18,
      align: 'center',
      color: '#bdc3c7',
    });
    
    let instruction = '';
    switch (task.miniGameType) {
      case 'click':
        instruction = '在限定时间内，点击屏幕上出现的目标\n点击越多得分越高！';
        break;
      case 'qte':
        instruction = '在按键消失前按下对应的键盘按键\n注意时机，不要错过！';
        break;
      case 'quiz':
        instruction = '回答关于莉莉丝的问题\n看看你有多了解她~';
        break;
    }
    
    const lines = instruction.split('\n');
    let textY = panelY + 160;
    for (const line of lines) {
      drawText(ctx, line, panelX + panelW / 2, textY, {
        fontSize: 16,
        align: 'center',
        color: '#ecf0f1',
      });
      textY += 28;
    }
    
    drawText(ctx, `目标奖励: ✨${task.rewards.charm}  💪${task.rewards.obedience}  💕${task.rewards.intimacy}`, panelX + panelW / 2, panelY + 240, {
      fontSize: 18,
      align: 'center',
      color: '#f39c12',
      bold: true,
    });
    
    drawButton(ctx, panelX + 150, panelY + 280, 300, 50, '开始游戏', {
      bgColor: '#e91e63',
      fontSize: 22,
      hovered: this.hoveredStart,
      radius: 25,
    });
  }
  
  private renderClickGame(ctx: CanvasRenderingContext2D, state: ClickGameState): void {
    drawText(ctx, `剩余时间: ${state.timeRemaining.toFixed(1)}s`, 640, 120, {
      fontSize: 24,
      align: 'center',
      color: state.timeRemaining < 3 ? '#e74c3c' : '#ffffff',
      bold: true,
    });
    
    drawProgressBar(ctx, 440, 150, 400, 15, state.timeRemaining / state.totalTime, {
      fillColor: state.timeRemaining < 3 ? '#e74c3c' : '#9b59b6',
    });
    
    drawText(ctx, `连击: ${state.combo}`, 640, 180, {
      fontSize: 18,
      align: 'center',
      color: state.combo >= 5 ? '#f1c40f' : '#bdc3c7',
      bold: state.combo >= 5,
    });
    
    const pulse = 1 + Math.sin(Date.now() / 200) * 0.05;
    const targetRadius = state.targetRadius * pulse;
    
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius + 10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(233, 30, 99, 0.2)';
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(state.targetX, state.targetY, targetRadius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
      state.targetX - targetRadius * 0.3,
      state.targetY - targetRadius * 0.3,
      0,
      state.targetX,
      state.targetY,
      targetRadius
    );
    gradient.addColorStop(0, '#ff80ab');
    gradient.addColorStop(1, '#e91e63');
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.strokeStyle = '#ffb6c1';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    drawText(ctx, '❤', state.targetX, state.targetY + 5, {
      fontSize: Math.floor(targetRadius * 0.8),
      align: 'center',
      baseline: 'middle',
      color: '#ffffff',
    });
    
    if (state.cooldownMessage) {
      drawRoundedRect(ctx, 440, 350, 400, 60, 15);
      ctx.fillStyle = 'rgba(231, 76, 60, 0.9)';
      ctx.fill();
      drawText(ctx, state.cooldownMessage, 640, 380, {
        fontSize: 20,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
        bold: true,
      });
    }
  }
  
  private renderQTEGame(ctx: CanvasRenderingContext2D, state: QTEGameState): void {
    drawText(ctx, `剩余时间: ${state.timeRemaining.toFixed(1)}s`, 640, 120, {
      fontSize: 24,
      align: 'center',
      color: state.timeRemaining < 3 ? '#e74c3c' : '#ffffff',
      bold: true,
    });
    
    drawProgressBar(ctx, 440, 150, 400, 15, state.timeRemaining / state.totalTime, {
      fillColor: state.timeRemaining < 3 ? '#e74c3c' : '#3498db',
    });
    
    drawText(ctx, `连击: ${state.combo}`, 640, 180, {
      fontSize: 18,
      align: 'center',
      color: state.combo >= 5 ? '#f1c40f' : '#bdc3c7',
      bold: state.combo >= 5,
    });
    
    const currentTime = state.totalTime - state.timeRemaining;
    
    for (const key of state.keys) {
      const age = currentTime - key.spawnTime;
      let alpha = 1;
      
      if (age < 0.2) {
        alpha = age / 0.2;
      } else if (age > key.duration - 0.3) {
        alpha = Math.max(0, (key.duration - age) / 0.3);
      }
      
      ctx.globalAlpha = alpha;
      
      let color = '#9b59b6';
      if (key.hit) color = '#2ecc71';
      if (key.missed) color = '#e74c3c';
      
      drawRoundedRect(ctx, key.x - 30, key.y - 30, 60, 60, 12);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      drawText(ctx, key.key, key.x, key.y, {
        fontSize: 28,
        bold: true,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
      });
      
      if (!key.hit && !key.missed) {
        const progress = Math.min(1, age / key.duration);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(key.x, key.y, 35, -Math.PI / 2, -Math.PI / 2 + progress * Math.PI * 2);
        ctx.stroke();
      }
      
      ctx.globalAlpha = 1;
    }
    
    drawText(ctx, '按下屏幕上显示的按键！', 640, 650, {
      fontSize: 16,
      align: 'center',
      color: '#95a5a6',
    });
  }
  
  private renderQuizGame(ctx: CanvasRenderingContext2D, state: QuizGameState): void {
    const question = state.questions[state.currentQuestionIndex];
    if (!question) return;
    
    drawText(ctx, `第 ${state.currentQuestionIndex + 1} / ${state.totalQuestions} 题`, 640, 120, {
      fontSize: 20,
      align: 'center',
      color: '#bdc3c7',
    });
    
    drawText(ctx, `剩余时间: ${state.timeRemaining.toFixed(1)}s`, 640, 150, {
      fontSize: 24,
      align: 'center',
      color: state.timeRemaining < 5 ? '#e74c3c' : '#ffffff',
      bold: true,
    });
    
    drawProgressBar(ctx, 440, 185, 400, 15, state.timeRemaining / state.questionTimeLimit, {
      fillColor: state.timeRemaining < 5 ? '#e74c3c' : '#f39c12',
    });
    
    const panelY = 230;
    drawRoundedRect(ctx, 200, panelY, 880, 100, 15);
    ctx.fillStyle = 'rgba(155, 89, 182, 0.2)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    drawText(ctx, question.question, 640, panelY + 50, {
      fontSize: 22,
      align: 'center',
      baseline: 'middle',
      color: '#ffffff',
      bold: true,
    });
    
    for (let i = 0; i < question.options.length; i++) {
      const optionX = 300 + (i % 2) * 380;
      const optionY = 360 + Math.floor(i / 2) * 90;
      const optionW = 320;
      const optionH = 70;
      
      let bgColor = 'rgba(155, 89, 182, 0.3)';
      let borderColor = '#9b59b6';
      
      if (state.showResult) {
        if (i === question.correctIndex) {
          bgColor = 'rgba(46, 204, 113, 0.4)';
          borderColor = '#2ecc71';
        } else if (state.selectedAnswer === i) {
          bgColor = 'rgba(231, 76, 60, 0.4)';
          borderColor = '#e74c3c';
        }
      }
      
      drawRoundedRect(ctx, optionX, optionY, optionW, optionH, 12);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const optionLabels = ['A', 'B', 'C', 'D'];
      drawText(ctx, `${optionLabels[i]}. ${question.options[i]}`, optionX + optionW / 2, optionY + optionH / 2, {
        fontSize: 18,
        align: 'center',
        baseline: 'middle',
        color: '#ffffff',
      });
    }
    
    if (state.showResult) {
      const isCorrect = state.selectedAnswer === question.correctIndex;
      drawText(ctx, isCorrect ? '✓ 回答正确！' : '✗ 回答错误', 640, 560, {
        fontSize: 24,
        align: 'center',
        color: isCorrect ? '#2ecc71' : '#e74c3c',
        bold: true,
      });
      
      drawButton(ctx, 490, 600, 300, 50, state.currentQuestionIndex < state.totalQuestions - 1 ? '下一题' : '查看结果', {
        bgColor: '#9b59b6',
        fontSize: 20,
        hovered: this.hoveredNext,
        radius: 25,
      });
    }
  }
  
  private drawResult(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task || !this.gameState) return;
    
    const success = (this.gameState as any).success;
    
    const panelX = 390;
    const panelY = 180;
    const panelW = 500;
    const panelH = 400;
    
    drawRoundedRect(ctx, panelX, panelY, panelW, panelH, 20);
    ctx.fillStyle = 'rgba(26, 26, 46, 0.95)';
    ctx.fill();
    ctx.strokeStyle = success ? '#2ecc71' : '#e74c3c';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    drawText(ctx, success ? '挑战成功！' : '挑战失败...', panelX + panelW / 2, panelY + 50, {
      fontSize: 32,
      bold: true,
      align: 'center',
      color: success ? '#2ecc71' : '#e74c3c',
    });
    
    const gs = this.gameState as any;
    drawText(ctx, `得分: ${gs.score} / ${gs.targetScore}`, panelX + panelW / 2, panelY + 100, {
      fontSize: 20,
      align: 'center',
      color: '#f39c12',
    });
    
    if (gs.maxCombo !== undefined) {
      drawText(ctx, `最高连击: ${gs.maxCombo}`, panelX + panelW / 2, panelY + 130, {
        fontSize: 16,
        align: 'center',
        color: '#bdc3c7',
      });
    }
    
    ctx.strokeStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(panelX + 50, panelY + 170);
    ctx.lineTo(panelX + panelW - 50, panelY + 170);
    ctx.stroke();
    
    drawText(ctx, '获得奖励', panelX + panelW / 2, panelY + 200, {
      fontSize: 18,
      align: 'center',
      color: '#f39c12',
      bold: true,
    });
    
    if (success) {
      const actualCharm = Math.floor(task.rewards.charm * this.rewardMultiplier);
      const actualObedience = Math.floor(task.rewards.obedience * this.rewardMultiplier);
      const actualIntimacy = Math.floor(task.rewards.intimacy * this.rewardMultiplier);
      
      drawText(ctx, `✨ 魅力 +${actualCharm}`, panelX + panelW / 2, panelY + 240, {
        fontSize: 20,
        align: 'center',
        color: '#f1c40f',
      });
      
      drawText(ctx, `💪 服从 +${actualObedience}`, panelX + panelW / 2, panelY + 275, {
        fontSize: 20,
        align: 'center',
        color: '#3498db',
      });
      
      drawText(ctx, `💕 亲密 +${actualIntimacy}`, panelX + panelW / 2, panelY + 310, {
        fontSize: 20,
        align: 'center',
        color: '#e91e63',
      });
      
      if (this.rewardMultiplier > 1) {
        drawText(ctx, `表现加成 x${this.rewardMultiplier.toFixed(1)}`, panelX + panelW / 2, panelY + 345, {
          fontSize: 14,
          align: 'center',
          color: '#2ecc71',
        });
      }
    } else {
      drawText(ctx, '下次继续努力哦~', panelX + panelW / 2, panelY + 270, {
        fontSize: 18,
        align: 'center',
        color: '#bdc3c7',
      });
    }
    
    drawButton(ctx, panelX + 100, panelY + 330, 300, 50, success ? '领取奖励' : '返回列表', {
      bgColor: success ? '#e91e63' : '#7f8c8d',
      fontSize: 20,
      hovered: this.hoveredNext,
      radius: 25,
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
    const task = gameState.selectedTask;
    if (!task) return;
    
    if (isPointInRect(x, y, 30, 640, 120, 50)) {
      gameState.currentScene = 'taskList';
      return;
    }
    
    if (this.gamePhase === 'intro') {
      if (isPointInRect(x, y, 490, 480, 300, 50)) {
        this.startGame(gameState);
      }
    } else if (this.gamePhase === 'playing') {
      if (task.miniGameType === 'click' && this.gameState) {
        const result = handleClickGameClick(
          this.gameState as ClickGameState,
          x,
          y,
          Date.now()
        );
        this.gameState = result.state;
        
        if (result.hit) {
          const gs = this.gameState as ClickGameState;
          this.gameState = {
            ...gs,
            targetX: 150 + Math.random() * 980,
            targetY: 250 + Math.random() * 350,
          } as ClickGameState;
        }
      } else if (task.miniGameType === 'quiz' && this.gameState) {
        const state = this.gameState as QuizGameState;
        if (!state.showResult) {
          for (let i = 0; i < 4; i++) {
            const optionX = 300 + (i % 2) * 380;
            const optionY = 360 + Math.floor(i / 2) * 90;
            if (isPointInRect(x, y, optionX, optionY, 320, 70)) {
              this.gameState = submitAnswer(state, i);
              break;
            }
          }
        }
      }
    } else if (this.gamePhase === 'result') {
      if (isPointInRect(x, y, 490, 510, 300, 50) || isPointInRect(x, y, 490, 430, 300, 50)) {
        this.finishGame(gameState);
      }
    }
    
    if (this.gamePhase === 'playing' && task.miniGameType === 'quiz') {
      const state = this.gameState as QuizGameState;
      if (state.showResult) {
        if (isPointInRect(x, y, 490, 600, 300, 50)) {
          if (state.currentQuestionIndex < state.totalQuestions - 1) {
            this.gameState = nextQuestion(state);
          } else {
            this.gamePhase = 'result';
            this.calculateRewardMultiplier('quiz');
          }
        }
      }
    }
  }
  
  handleKeyPress(key: string, gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task || !this.gameState) return;
    
    if (key === 'Escape') {
      gameState.currentScene = 'taskList';
      return;
    }
    
    if (this.gamePhase !== 'playing') return;
    
    if (task.miniGameType === 'qte') {
      const result = handleQTEKeyPress(this.gameState as QTEGameState, key);
      this.gameState = result.state;
    }
  }
  
  private startGame(gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task || !this.gameState) return;
    
    this.gamePhase = 'playing';
    
    switch (task.miniGameType) {
      case 'click':
        this.gameState = startClickGame(this.gameState as ClickGameState);
        break;
      case 'qte':
        this.gameState = startQTEGame(this.gameState as QTEGameState);
        break;
      case 'quiz':
        this.gameState = startQuizGame(this.gameState as QuizGameState);
        break;
    }
  }
  
  private finishGame(gameState: GameState): void {
    const task = gameState.selectedTask;
    if (!task || !this.gameState) return;
    
    const success = (this.gameState as any).success;
    
    if (success) {
      const rewards = gameState.completeTask(task.id, this.rewardMultiplier);
      if (rewards) {
        gameState.miniGameResult = { success, rewards, task };
      }
    }
    
    gameState.selectedTask = null;
    gameState.currentScene = 'taskList';
  }
  
  setHovered(x: number, y: number): void {
    this.hoveredBack = isPointInRect(x, y, 30, 640, 120, 50);
    
    if (this.gamePhase === 'intro') {
      this.hoveredStart = isPointInRect(x, y, 490, 480, 300, 50);
    } else if (this.gamePhase === 'result') {
      this.hoveredNext = isPointInRect(x, y, 490, 510, 300, 50) || isPointInRect(x, y, 490, 430, 300, 50);
    }
  }
}
