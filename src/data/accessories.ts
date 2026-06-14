import type { Accessory, AccessorySlot, IntimacyTier } from '../types/types';

const createAccessory = (
  id: string,
  name: string,
  description: string,
  slot: AccessorySlot,
  intimacyRequired: IntimacyTier,
  color: string
): Accessory => ({
  id,
  name,
  description,
  slot,
  intimacyRequired,
  color,
  unlocked: intimacyRequired === 1,
});

export const ACCESSORIES: Accessory[] = [
  createAccessory('ribbon_red', '红色丝带', '可爱的红色丝带发饰', 'hair', 1, '#e74c3c'),
  createAccessory('ribbon_black', '黑色丝带', '神秘的黑色丝带', 'hair', 2, '#2c3e50'),
  createAccessory('crown_silver', '银色小皇冠', '精致的银色小皇冠', 'hair', 4, '#bdc3c7'),
  createAccessory('flower_rose', '玫瑰花饰', '娇艳的玫瑰花', 'hair', 3, '#c0392b'),
  
  createAccessory('earring_gold', '金色耳环', '简约的金色耳环', 'earring', 1, '#f1c40f'),
  createAccessory('earring_silver', '银色耳环', '闪亮的银色耳环', 'earring', 2, '#ecf0f1'),
  createAccessory('earring_ruby', '红宝石耳环', '镶嵌红宝石的耳环', 'earring', 3, '#e74c3c'),
  createAccessory('earring_heart', '爱心耳环', '可爱的爱心造型耳环', 'earring', 2, '#e91e63'),
  
  createAccessory('necklace_black', '黑色项圈', '神秘的黑色项圈', 'necklace', 1, '#34495e'),
  createAccessory('necklace_heart', '爱心项链', '充满爱意的爱心项链', 'necklace', 2, '#e91e63'),
  createAccessory('necklace_gem', '宝石项链', '镶嵌宝石的华丽项链', 'necklace', 4, '#9b59b6'),
  createAccessory('necklace_chain', '银链项链', '简约的银色链条', 'necklace', 1, '#bdc3c7'),
  
  createAccessory('tail_bow', '尾巴蝴蝶结', '系在尾巴上的蝴蝶结', 'tail', 2, '#e74c3c'),
  createAccessory('tail_bell', '尾巴铃铛', '会发出清脆响声的铃铛', 'tail', 3, '#f1c40f'),
  createAccessory('tail_ribbon', '尾巴丝带', '丝滑的紫色丝带', 'tail', 1, '#9b59b6'),
  createAccessory('tail_star', '星星装饰', '闪亮的星星装饰', 'tail', 4, '#ffd700'),
];

export function getAccessoriesBySlot(slot: AccessorySlot): Accessory[] {
  return ACCESSORIES.filter(a => a.slot === slot);
}

export function getAccessoryById(id: string): Accessory | undefined {
  return ACCESSORIES.find(a => a.id === id);
}
