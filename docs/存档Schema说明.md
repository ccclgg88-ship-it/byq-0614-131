# 魅魔养成游戏 - 存档 Schema 说明

## 存档版本

当前版本：**2**

存档使用 `localStorage` 存储，键名为 `succubus_raising_save`。

## 数据结构

```typescript
interface SaveData {
  version: number;           // 存档版本号，用于迁移
  player: PlayerState;       // 玩家状态
  dailyTasks: Task[];        // 今日任务
  yesterdayTasks: Task[] | null;  // 昨日任务（用于补领）
  createdAt: string;         // 创建时间（ISO 格式）
  updatedAt: string;         // 更新时间（ISO 格式）
}
```

## PlayerState 结构

```typescript
interface PlayerState {
  charm: number;                     // 魅力值
  obedience: number;                 // 服从度 (0-100)
  intimacy: number;                  // 亲密度 (0-10000)
  level: number;                     // 等级
  dailyCharmEarned: number;          // 今日已获魅力值
  totalTasksCompleted: number;       // 累计完成任务数
  totalDaysPlayed: number;           // 累计游戏天数
  lastLoginDate: string;             // 上次登录日期
  lastTaskRefreshDate: string;       // 上次任务刷新日期
  yesterdayCompletionRate: number;   // 昨日完成率 (0-1)
  
  equippedAccessories: {             // 已装备的配饰
    hair: string | null;
    earring: string | null;
    necklace: string | null;
    tail: string | null;
  };
  
  unlockedDialoguePacks: string[];   // 已解锁台词包ID列表
  unlockedAccessories: string[];     // 已解锁配饰ID列表
  
  canMakeUpYesterday: boolean;       // 是否可以补领昨日任务
  madeUpYesterday: boolean;          // 是否已补领昨日任务
}
```

## Task 结构

```typescript
interface Task {
  id: string;               // 任务唯一ID
  type: 'greeting' | 'feeding' | 'training';  // 任务类型
  rarity: 'common' | 'rare' | 'epic';         // 稀有度
  title: string;            // 标题
  description: string;      // 描述
  miniGameType: 'click' | 'qte' | 'quiz';     // 小游戏类型
  rewards: TaskRewards;     // 奖励
  completed: boolean;       // 是否已完成
  claimed: boolean;         // 是否已领取奖励
}

interface TaskRewards {
  charm: number;            // 魅力奖励
  obedience: number;        // 服从度奖励
  intimacy: number;         // 亲密度奖励
}
```

## 版本迁移

### V1 → V2 迁移

V2 版本新增以下字段：
- `player.equippedAccessories` - 配饰装备槽位
- `player.unlockedAccessories` - 已解锁配饰列表
- `yesterdayTasks` - 昨日任务数据
- `player.canMakeUpYesterday` - 是否可补领
- `player.madeUpYesterday` - 是否已补领

迁移函数：`migrateSaveData(data: SaveData): SaveData`

迁移策略：
- 缺失字段自动填充默认值
- 保持原有数据不变
- 向前兼容旧版本存档

## 台词包 Schema (与 Prompt 共用子集)

台词包遵循与 Prompt 人设 JSON 兼容的 schema 子集：

```typescript
interface DialoguePack {
  id: string;               // 唯一标识
  name: string;             // 名称
  description: string;      // 描述
  intimacyRequired: number; // 所需亲密度等级 (1-5)
  unlocked: boolean;        // 是否已解锁
  lines: DialogueLine[];    // 台词列表
}

interface DialogueLine {
  id: string;               // 台词ID
  text: string;             // 台词内容
  expression: ExpressionType;  // 对应表情
  intimacyRequired: number; // 所需亲密度等级
}

type ExpressionType = 'happy' | 'normal' | 'shy' | 'angry' | 'sad';
```

## 存档操作

### 加载存档
```typescript
function loadSaveData(): SaveData | null
```

### 保存存档
```typescript
function saveSaveData(data: SaveData): void
```

### 重置存档
```typescript
function resetSaveData(): SaveData
```

### 迁移存档
```typescript
function migrateSaveData(data: SaveData): SaveData
```

## 自动保存时机

1. 每次完成任务后
2. 每次装备/卸下配饰后
3. 页面关闭/隐藏时
4. 切换场景时

## 数据范围约束

| 字段 | 最小值 | 最大值 | 说明 |
|------|--------|--------|------|
| charm | 0 | 99999 | 魅力值 |
| obedience | 0 | 100 | 服从度 |
| intimacy | 0 | 10000 | 亲密度 |
| dailyCharmEarned | 0 | 500 | 每日魅力上限 |
| level | 1 | - | 无上限 |
