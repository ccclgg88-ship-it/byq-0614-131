import type { SceneType } from '../types/types';
import type { GameState } from '../systems/gameState';

export interface Scene {
  type: SceneType;
  enter(gameState: GameState): void;
  exit(): void;
  update(deltaTime: number, gameState: GameState): void;
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void;
  handleClick(x: number, y: number, gameState: GameState): void;
  handleKeyPress(key: string, gameState: GameState): void;
}

export class SceneManager {
  private scenes: Map<SceneType, Scene> = new Map();
  private currentScene: Scene | null = null;
  private currentSceneType: SceneType | null = null;
  
  registerScene(type: SceneType, scene: Scene): void {
    this.scenes.set(type, scene);
  }
  
  changeScene(type: SceneType, gameState: GameState): void {
    if (this.currentScene) {
      this.currentScene.exit();
    }
    
    const scene = this.scenes.get(type);
    if (!scene) {
      console.error(`场景 ${type} 未注册`);
      return;
    }
    
    this.currentScene = scene;
    this.currentSceneType = type;
    scene.enter(gameState);
  }
  
  getCurrentScene(): Scene | null {
    return this.currentScene;
  }
  
  getCurrentSceneType(): SceneType | null {
    return this.currentSceneType;
  }
  
  update(deltaTime: number, gameState: GameState): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime, gameState);
    }
  }
  
  render(ctx: CanvasRenderingContext2D, gameState: GameState): void {
    if (this.currentScene) {
      this.currentScene.render(ctx, gameState);
    }
  }
  
  handleClick(x: number, y: number, gameState: GameState): void {
    if (this.currentScene) {
      this.currentScene.handleClick(x, y, gameState);
    }
  }
  
  handleKeyPress(key: string, gameState: GameState): void {
    if (this.currentScene) {
      this.currentScene.handleKeyPress(key, gameState);
    }
  }
}
