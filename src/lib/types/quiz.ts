export enum QuestionType {
    SINGLE_ANSWER = 'single_answer',
    MULTIPLE_ANSWERS = 'multiple_answers',
    TRUE_FALSE = 'true_false'
}

export interface GeneratedQuizQuestion {
    type: QuestionType;
    question: string;
    options: string[];
    correctAnswers: number[];
    explanation: string;
}

export interface Quiz {
    id: number;
    title: string;
    documentId: number;
    documentName: string;
    createdAt: Date;
}

export interface Question {
    id: number;
    quizId: number;
    question: string;
    type: QuestionType;
    explanation: string;
    options: Option[];
}

export interface Option {
    id: number;
    text: string;
    isCorrect: boolean;
}

export interface BaseQuestion {
    type: QuestionType;
    question: string;
    options: string[];
    correctAnswers: number[];
    explanation: string;
}

export interface SingleAnswerQuestion extends BaseQuestion {
    type: QuestionType.SINGLE_ANSWER;
    correctAnswers: [number]; // Exactly one answer
}

export interface MultipleAnswersQuestion extends BaseQuestion {
    type: QuestionType.MULTIPLE_ANSWERS;
    correctAnswers: number[]; // Multiple answers
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: QuestionType.TRUE_FALSE;
    options: ["True", "False"];
    correctAnswers: [number]; // 0 for True, 1 for False
}

export type QuizQuestion = SingleAnswerQuestion | MultipleAnswersQuestion | TrueFalseQuestion; 