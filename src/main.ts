import { Game } from './game';

window.addEventListener('DOMContentLoaded', () => {
  try {
    const game = new Game('game-canvas');
    game.start();
    console.log('魅魔养成游戏启动成功！');
  } catch (error) {
    console.error('游戏启动失败:', error);
  }
});
