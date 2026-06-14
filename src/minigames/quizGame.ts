import type { QuizQuestion } from '../types/types';
import { getRandomQuizQuestions } from '../data/quizQuestions';

export interface QuizGameState {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  score: number;
  timeRemaining: number;
  questionTimeLimit: number;
  isPlaying: boolean;
  isFinished: boolean;
  success: boolean;
  selectedAnswer: number | null;
  showResult: boolean;
  correctAnswers: number;
  totalQuestions: number;
}

export function createQuizGame(
  questionCount: number = 5,
  questionTime: number = 15,
  type?: 'greeting' | 'feeding' | 'training'
): QuizGameState {
  const questions = getRandomQuizQuestions(questionCount, type);
  
  return {
    questions,
    currentQuestionIndex: 0,
    score: 0,
    timeRemaining: questionTime,
    questionTimeLimit: questionTime,
    isPlaying: false,
    isFinished: false,
    success: false,
    selectedAnswer: null,
    showResult: false,
    correctAnswers: 0,
    totalQuestions: questions.length,
  };
}

export function startQuizGame(state: QuizGameState): QuizGameState {
  return {
    ...state,
    isPlaying: true,
    score: 0,
    currentQuestionIndex: 0,
    timeRemaining: state.questionTimeLimit,
    selectedAnswer: null,
    showResult: false,
    correctAnswers: 0,
  };
}

export function updateQuizGame(state: QuizGameState, deltaTime: number): QuizGameState {
  if (!state.isPlaying || state.isFinished || state.showResult) return state;
  
  const newTime = state.timeRemaining - deltaTime;
  
  if (newTime <= 0) {
    return submitAnswer(state, -1);
  }
  
  return {
    ...state,
    timeRemaining: newTime,
  };
}

export function submitAnswer(state: QuizGameState, answerIndex: number): QuizGameState {
  if (!state.isPlaying || state.isFinished || state.showResult) return state;
  
  const currentQuestion = state.questions[state.currentQuestionIndex];
  const isCorrect = answerIndex === currentQuestion.correctIndex;
  
  const newCorrectAnswers = state.correctAnswers + (isCorrect ? 1 : 0);
  const newScore = state.score + (isCorrect ? 100 : 0);
  
  return {
    ...state,
    selectedAnswer: answerIndex,
    showResult: true,
    score: newScore,
    correctAnswers: newCorrectAnswers,
  };
}

export function nextQuestion(state: QuizGameState): QuizGameState {
  if (!state.isPlaying || state.isFinished) return state;
  
  const nextIndex = state.currentQuestionIndex + 1;
  
  if (nextIndex >= state.questions.length) {
    const correctRatio = state.correctAnswers / state.totalQuestions;
    const success = correctRatio >= 0.6;
    
    return {
      ...state,
      isPlaying: false,
      isFinished: true,
      success,
      showResult: false,
    };
  }
  
  return {
    ...state,
    currentQuestionIndex: nextIndex,
    timeRemaining: state.questionTimeLimit,
    selectedAnswer: null,
    showResult: false,
  };
}

export function getQuizGameResult(state: QuizGameState): {
  success: boolean;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
} {
  return {
    success: state.success,
    score: state.score,
    correctAnswers: state.correctAnswers,
    totalQuestions: state.totalQuestions,
  };
}

export function calculateQuizRewardMultiplier(state: QuizGameState): number {
  if (!state.success) return 0;
  
  const ratio = state.correctAnswers / state.totalQuestions;
  return Math.min(0.5 + ratio, 1.5);
}
