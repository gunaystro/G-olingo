export type CefrLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

export type NavTab = "ana-sehife" | "lugətim" | "soz-karti" | "yeni-soz" | "test";

export interface ExampleSentence {
  en: string;
  az: string;
}

export interface Collocation {
  phrase: string;
  az: string;
}

export type VisualTheme =
  | "notebook"
  | "steering"
  | "bird"
  | "statue"
  | "candle"
  | "spring"
  | "book"
  | "compass"
  | "key"
  | "clock"
  | "bridge"
  | "lightning";

export interface VocabCard {
  id: string;
  word: string;
  ipa: string;
  partOfSpeech: string;
  level: CefrLevel;
  meaningAz: string;
  explanationAz: string;
  mnemonicBridgeAz: string;
  mnemonicHookPhrase: string;
  mnemonicStoryAz: string;
  visualSceneTitle: string;
  visualSceneAz: string;
  visualTheme: VisualTheme;
  retentionScore: number;
  examples: ExampleSentence[];
  collocations: Collocation[];
  source: "catalog" | "ai-level" | "personal";
  createdAt: string;
}

export interface LearnedRecord {
  wordId: string;
  learnedAt: string;
}

export type QuizType = "en-to-az" | "az-to-en";

export interface QuizQuestion {
  id: string;
  wordCard: VocabCard;
  type: QuizType;
  promptText: string;
  options: string[];
  correctAnswer: string;
}

export interface QuizMistake {
  question: QuizQuestion;
  selectedAnswer: string;
}

export interface QuizResult {
  id: string;
  completedAt: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  percentage: number;
  quizMode: QuizType | "mixed";
}

export interface PersistedState {
  dailyTarget: number;
  dailyLearnedByDate: Record<string, string[]>;
  learnedRecords: LearnedRecord[];
  reviewWordIds: string[];
  bookmarkedWordIds: string[];
  personalWords: VocabCard[];
  aiGeneratedWords: VocabCard[];
  mnemonicOverrides: Record<
    string,
    {
      mnemonicBridgeAz: string;
      mnemonicHookPhrase: string;
      mnemonicStoryAz: string;
      visualSceneTitle: string;
      visualSceneAz: string;
    }
  >;
  quizResults: QuizResult[];
}
