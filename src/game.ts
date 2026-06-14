import { GameState } from './systems/gameState';
import { SceneManager } from './scenes/sceneManager';
import { MainScene } from './scenes/mainScene';
import { TaskListScene } from './scenes/taskListScene';
import { MiniGameScene } from './scenes/miniGameScene';
import { DialogueScene } from './scenes/dialogueScene';
import { WardrobeScene } from './scenes/wardrobeScene';
import { GAME_CONFIG } from './config/gameConfig';

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private gameState: GameState;
  private sceneManager: SceneManager;
  private lastTime: number = 0;
  private animationFrameId: number | null = null;
  private mouseX: number = 0;
  private mouseY: number = 0;
  
  private mainScene: MainScene;
  private taskListScene: TaskListScene;
  private miniGameScene: MiniGameScene;
  private dialogueScene: DialogueScene;
  private wardrobeScene: WardrobeScene;
  
  constructor(canvasId: string) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !(canvas instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }
    
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get 2D rendering context');
    }
    this.ctx = ctx;
    
    this.gameState = new GameState();
    this.sceneManager = new SceneManager();
    
    this.mainScene = new MainScene();
    this.taskListScene = new TaskListScene();
    this.miniGameScene = new MiniGameScene();
    this.dialogueScene = new DialogueScene();
    this.wardrobeScene = new WardrobeScene();
    
    this.sceneManager.registerScene('main', this.mainScene);
    this.sceneManager.registerScene('taskList', this.taskListScene);
    this.sceneManager.registerScene('miniGame', this.miniGameScene);
    this.sceneManager.registerScene('dialogue', this.dialogueScene);
    this.sceneManager.registerScene('wardrobe', this.wardrobeScene);
    
    this.sceneManager.changeScene('main', this.gameState);
    
    this.bindEvents();
  }
  
  private checkSceneChange(): void {
    const currentSceneType = this.sceneManager.getCurrentSceneType();
    if (currentSceneType !== this.gameState.currentScene) {
      this.sceneManager.changeScene(this.gameState.currentScene, this.gameState);
    }
  }
  
  private bindEvents(): void {
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      
      this.sceneManager.handleClick(x, y, this.gameState);
      this.checkSceneChange();
    });
    
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      this.mouseX = (e.clientX - rect.left) * scaleX;
      this.mouseY = (e.clientY - rect.top) * scaleY;
      
      this.updateHoverState();
    });
    
    document.addEventListener('keydown', (e) => {
      this.sceneManager.handleKeyPress(e.key, this.gameState);
      this.checkSceneChange();
    });
    
    window.addEventListener('beforeunload', () => {
      this.gameState.save();
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.gameState.save();
      }
    });
  }
  
  private updateHoverState(): void {
    const x = this.mouseX;
    const y = this.mouseY;
    
    const sceneType = this.sceneManager.getCurrentSceneType();
    
    switch (sceneType) {
      case 'main':
        this.mainScene.setHoveredButton(x, y);
        break;
      case 'taskList':
        this.taskListScene.setHovered(x, y);
        break;
      case 'miniGame':
        this.miniGameScene.setHovered(x, y);
        break;
      case 'dialogue':
        this.dialogueScene.setHovered(x, y);
        break;
      case 'wardrobe':
        this.wardrobeScene.setHovered(x, y);
        break;
    }
  }
  
  start(): void {
    this.lastTime = performance.now();
    this.gameLoop();
  }
  
  private gameLoop = (): void => {
    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };
  
  private update(deltaTime: number): void {
    this.sceneManager.update(deltaTime, this.gameState);
    this.checkSceneChange();
  }
  
  private render(): void {
    this.ctx.clearRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    this.sceneManager.render(this.ctx, this.gameState);
  }
  
  getGameState(): GameState {
    return this.gameState;
  }
  
  destroy(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.gameState.save();
  }
}
