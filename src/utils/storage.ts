import { PersistedState } from "../types/vocabulary";

const STORAGE_KEY = "guolingo_user_state_v1";

export function getTodayKey(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDefaultState(): PersistedState {
  return {
    dailyTarget: 10,
    dailyLearnedByDate: {},
    learnedRecords: [],
    reviewWordIds: [],
    bookmarkedWordIds: [],
    personalWords: [],
    aiGeneratedWords: [],
    mnemonicOverrides: {},
    quizResults: [],
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof window === "undefined") {
    return getDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw) as Partial<PersistedState>;

    const dailyTarget =
      typeof parsed.dailyTarget === "number" && parsed.dailyTarget >= 1 && parsed.dailyTarget <= 100
        ? Math.round(parsed.dailyTarget)
        : 10;

    return {
      dailyTarget,
      dailyLearnedByDate:
        parsed.dailyLearnedByDate && typeof parsed.dailyLearnedByDate === "object"
          ? parsed.dailyLearnedByDate
          : {},
      learnedRecords: Array.isArray(parsed.learnedRecords) ? parsed.learnedRecords : [],
      reviewWordIds: Array.isArray(parsed.reviewWordIds) ? parsed.reviewWordIds : [],
      bookmarkedWordIds: Array.isArray(parsed.bookmarkedWordIds) ? parsed.bookmarkedWordIds : [],
      personalWords: Array.isArray(parsed.personalWords) ? parsed.personalWords : [],
      aiGeneratedWords: Array.isArray(parsed.aiGeneratedWords) ? parsed.aiGeneratedWords : [],
      mnemonicOverrides:
        parsed.mnemonicOverrides && typeof parsed.mnemonicOverrides === "object"
          ? parsed.mnemonicOverrides
          : {},
      quizResults: Array.isArray(parsed.quizResults) ? parsed.quizResults : [],
    };
  } catch {
    return getDefaultState();
  }
}

export function savePersistedState(state: PersistedState): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export function clearPersistedState(): PersistedState {
  const fresh = getDefaultState();
  savePersistedState(fresh);
  return fresh;
}
