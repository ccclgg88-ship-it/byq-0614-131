import type { QuizQuestion, TaskType } from '../types/types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: '魅魔莉莉丝最爱的食物是什么？',
    options: ['草莓蛋糕', '巧克力', '苹果', '牛排'],
    correctIndex: 1,
    type: 'feeding',
  },
  {
    question: '莉莉丝是什么种族的魔物娘？',
    options: ['猫娘', '狐娘', '魅魔', '龙娘'],
    correctIndex: 2,
    type: 'greeting',
  },
  {
    question: '主人最喜欢莉莉丝的哪个部位？',
    options: ['尾巴', '角', '翅膀', '眼睛'],
    correctIndex: 0,
    type: 'greeting',
  },
  {
    question: '服从训练的目的是什么？',
    options: ['惩罚莉莉丝', '提升默契与信任', '让莉莉丝变弱', '浪费时间'],
    correctIndex: 1,
    type: 'training',
  },
  {
    question: '投喂莉莉丝时应该说什么？',
    options: ['快吃！', '啊~张嘴', '不好吃别吃了', '自己动手'],
    correctIndex: 1,
    type: 'feeding',
  },
  {
    question: '莉莉丝的眼睛是什么颜色的？',
    options: ['蓝色', '绿色', '红色', '紫色'],
    correctIndex: 3,
    type: 'greeting',
  },
  {
    question: '训练时莉莉丝做错了应该怎么办？',
    options: ['严厉惩罚', '耐心指导', '放弃训练', '嘲笑她'],
    correctIndex: 1,
    type: 'training',
  },
  {
    question: '莉莉丝的头发是什么颜色的？',
    options: ['金色', '黑色', '紫色渐变', '粉色'],
    correctIndex: 2,
    type: 'greeting',
  },
  {
    question: '以下哪种食物不适合喂给魅魔？',
    options: ['甜点', '水果', '大蒜', '肉类'],
    correctIndex: 2,
    type: 'feeding',
  },
  {
    question: '训练完成后应该给莉莉丝什么奖励？',
    options: ['什么都不给', '温柔的摸摸头', '更多训练', '批评指正'],
    correctIndex: 1,
    type: 'training',
  },
  {
    question: '莉莉丝最想和主人一起做什么？',
    options: ['看电影', '逛街', '永远在一起', '旅行'],
    correctIndex: 2,
    type: 'greeting',
  },
  {
    question: '以下哪个不是魅魔的特征？',
    options: ['尾巴', '翅膀', '角', '猫耳'],
    correctIndex: 3,
    type: 'greeting',
  },
];

export function getQuizQuestionsByType(type: TaskType): QuizQuestion[] {
  return QUIZ_QUESTIONS.filter(q => q.type === type);
}

export function getRandomQuizQuestion(type?: TaskType): QuizQuestion {
  const pool = type ? getQuizQuestionsByType(type) : QUIZ_QUESTIONS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomQuizQuestions(count: number, type?: TaskType): QuizQuestion[] {
  const pool = type ? getQuizQuestionsByType(type) : QUIZ_QUESTIONS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
