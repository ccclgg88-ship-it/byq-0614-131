import type { DialoguePack, ExpressionType, IntimacyTier } from '../types/types';

const createDialoguePack = (
  id: string,
  name: string,
  description: string,
  intimacyRequired: IntimacyTier,
  lines: { text: string; expression: ExpressionType }[]
): DialoguePack => ({
  id,
  name,
  description,
  intimacyRequired,
  unlocked: intimacyRequired === 1,
  lines: lines.map((l, i) => ({
    id: `${id}_line_${i}`,
    text: l.text,
    expression: l.expression,
    intimacyRequired,
  })),
});

export const DIALOGUE_PACKS: DialoguePack[] = [
  createDialoguePack('basic_intro', '基础问候', '初次见面的问候台词', 1, [
    { text: '你、你好主人...我是魅魔莉莉丝...', expression: 'shy' },
    { text: '主人今天也来陪我了吗？好开心~', expression: 'happy' },
    { text: '主人有什么吩咐吗？', expression: 'normal' },
    { text: '唔...主人一直看着我，有点害羞...', expression: 'shy' },
  ]),
  
  createDialoguePack('daily_idle', '日常待机', '主界面待机台词', 1, [
    { text: '今天的主人也很帅气呢~', expression: 'happy' },
    { text: '主人要记得做任务哦~', expression: 'normal' },
    { text: '好无聊...主人陪人家玩嘛~', expression: 'sad' },
    { text: '嗯~主人身上的味道好好闻...', expression: 'shy' },
  ]),
  
  createDialoguePack('familiar_talk', '熟悉对话', '熟悉后的日常对话', 2, [
    { text: '主人~人家好想你呀~', expression: 'happy' },
    { text: '今天也要好好完成任务哦，人家期待着呢~', expression: 'normal' },
    { text: '嘿嘿，主人的手好温暖...', expression: 'shy' },
    { text: '主人今天想吃什么？人家做给你吃~', expression: 'happy' },
  ]),
  
  createDialoguePack('intimate_whisper', '亲密呢喃', '亲密关系后的甜言蜜语', 3, [
    { text: '最喜欢主人了~永远在一起好不好？', expression: 'happy' },
    { text: '唔...主人靠近一点嘛...', expression: 'shy' },
    { text: '人家的一切都是主人的...', expression: 'shy' },
    { text: '主人就是人家的全部哦~', expression: 'happy' },
  ]),
  
  createDialoguePack('devoted_love', '挚爱告白', '挚爱情话', 4, [
    { text: '能遇到主人，是人家这辈子最幸福的事~', expression: 'happy' },
    { text: '主人...可以永远不要离开人家吗...', expression: 'sad' },
    { text: '不管发生什么，人家都会陪在主人身边的~', expression: 'normal' },
    { text: '主人...人家爱你...', expression: 'shy' },
  ]),
  
  createDialoguePack('eternal_bond', '永恒羁绊', '最高等级的羁绊', 5, [
    { text: '主人...我们的羁绊，是永恒的哦~', expression: 'happy' },
    { text: '人家会永远永远爱着主人的~', expression: 'happy' },
    { text: '不管轮回多少次，人家都会找到主人的...', expression: 'normal' },
    { text: '主人...永远在一起吧...', expression: 'shy' },
  ]),
  
  createDialoguePack('angry_reaction', '生气反应', '惹她生气时的台词', 1, [
    { text: '哼！不理主人了！', expression: 'angry' },
    { text: '主人大笨蛋！', expression: 'angry' },
    { text: '...人家才没有生气呢！', expression: 'angry' },
  ]),
  
  createDialoguePack('training_lines', '训练台词', '服从训练相关台词', 1, [
    { text: '呼...训练好累啊...但是为了主人，人家会努力的~', expression: 'happy' },
    { text: '人家做得好吗？主人...', expression: 'shy' },
    { text: '服从主人...是人家的天职呢~', expression: 'normal' },
  ]),
];

export function getAllDialogueLines(): { text: string; expression: ExpressionType; intimacyRequired: IntimacyTier }[] {
  return DIALOGUE_PACKS.flatMap(pack => 
    pack.lines.map(line => ({
      text: line.text,
      expression: line.expression,
      intimacyRequired: pack.intimacyRequired,
    }))
  );
}

export function getRandomIdleLine(intimacyTier: IntimacyTier): { text: string; expression: ExpressionType } {
  const availableLines = getAllDialogueLines().filter(l => l.intimacyRequired <= intimacyTier);
  const randomLine = availableLines[Math.floor(Math.random() * availableLines.length)];
  return { text: randomLine.text, expression: randomLine.expression };
}
