import { useEffect, useMemo, useState } from "react";
import { SEED_VOCABULARY } from "./data/seedVocabulary";
import { CefrLevel, NavTab, PersistedState, QuizResult, VocabCard, VisualTheme } from "./types/vocabulary";
import {
  clearPersistedState,
  getTodayKey,
  loadPersistedState,
  savePersistedState,
} from "./utils/storage";
import { getJson, postJson } from "./utils/api";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { VocabularyCardView } from "./components/VocabularyCardView";
import { MyVocabularyView } from "./components/MyVocabularyView";
import { AddWordView } from "./components/AddWordView";
import { QuizView } from "./components/QuizView";
import { SettingsModal } from "./components/SettingsModal";

export default function App() {
  const [state, setState] = useState<PersistedState>(() => loadPersistedState());
  const [activeTab, setActiveTab] = useState<NavTab>("ana-sehife");
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel | "ALL">("B2");
  const [activeCardId, setActiveCardId] = useState<string>("seed-reluctant");
  const [modalView, setModalView] = useState<"settings" | "summary" | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);
  const [isGeneratingLevel, setIsGeneratingLevel] = useState(false);
  const [levelError, setLevelError] = useState<string | null>(null);
  const [isRegeneratingMnemonic, setIsRegeneratingMnemonic] = useState(false);
  const [globalToast, setGlobalToast] = useState<string | null>(null);

  useEffect(() => {
    savePersistedState(state);
  }, [state]);

  useEffect(() => {
    getJson<{ ok: boolean; geminiConfigured: boolean }>(
      "/api/health",
      "Server vəziyyəti yoxlanıla bilmədi.",
    ).then((result) => {
      if (result.ok && typeof result.data.geminiConfigured === "boolean") {
        setGeminiConfigured(result.data.geminiConfigured);
      }
    });
  }, []);

  const showToast = (msg: string) => {
    setGlobalToast(msg);
    setTimeout(() => {
      setGlobalToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Combine seed, AI-level, and personal words, applying any regenerated mnemonic overrides
  const allWords = useMemo<VocabCard[]>(() => {
    const combined = [...state.personalWords, ...state.aiGeneratedWords, ...SEED_VOCABULARY];
    return combined.map((card) => {
      const override = state.mnemonicOverrides[card.id];
      if (!override) return card;
      return {
        ...card,
        ...override,
      };
    });
  }, [state.personalWords, state.aiGeneratedWords, state.mnemonicOverrides]);

  const learnedIds = useMemo(
    () => new Set(state.learnedRecords.map((r) => r.wordId)),
    [state.learnedRecords],
  );

  const reviewIds = useMemo(() => new Set(state.reviewWordIds), [state.reviewWordIds]);
  const bookmarkedIds = useMemo(() => new Set(state.bookmarkedWordIds), [state.bookmarkedWordIds]);

  const todayKey = getTodayKey();
  const todayLearnedCount = (state.dailyLearnedByDate[todayKey] || []).length;

  const recentlyLearnedWords = useMemo(() => {
    const wordMap = new Map(allWords.map((w) => [w.id, w]));
    return [...state.learnedRecords]
      .sort((a, b) => new Date(b.learnedAt).getTime() - new Date(a.learnedAt).getTime())
      .map((rec) => wordMap.get(rec.wordId))
      .filter((w): w is VocabCard => Boolean(w));
  }, [allWords, state.learnedRecords]);

  const learnedWords = useMemo(
    () => allWords.filter((w) => learnedIds.has(w.id)),
    [allWords, learnedIds],
  );

  const levelCards = useMemo(() => {
    if (selectedLevel === "ALL") return allWords;
    return allWords.filter((w) => w.level === selectedLevel);
  }, [allWords, selectedLevel]);

  const lastQuizResult =
    state.quizResults.length > 0 ? state.quizResults[state.quizResults.length - 1] : null;

  const handleMarkLearned = (card: VocabCard) => {
    setState((prev) => {
      const alreadyLearned = prev.learnedRecords.some((r) => r.wordId === card.id);
      const nextLearnedRecords = alreadyLearned
        ? prev.learnedRecords
        : [...prev.learnedRecords, { wordId: card.id, learnedAt: new Date().toISOString() }];

      const todayList = prev.dailyLearnedByDate[todayKey] || [];
      const nextTodayList = todayList.includes(card.id) ? todayList : [...todayList, card.id];

      return {
        ...prev,
        learnedRecords: nextLearnedRecords,
        reviewWordIds: prev.reviewWordIds.filter((id) => id !== card.id),
        dailyLearnedByDate: {
          ...prev.dailyLearnedByDate,
          [todayKey]: nextTodayList,
        },
      };
    });
    showToast(`"${card.word}" öyrənilmiş sözlər siyahısına əlavə edildi!`);
  };

  const handleMarkReview = (card: VocabCard) => {
    setState((prev) => ({
      ...prev,
      reviewWordIds: prev.reviewWordIds.includes(card.id)
        ? prev.reviewWordIds
        : [...prev.reviewWordIds, card.id],
    }));
    showToast(`"${card.word}" təkrar siyahısına əlavə edildi.`);
  };

  const handleToggleBookmark = (wordId: string) => {
    setState((prev) => {
      const exists = prev.bookmarkedWordIds.includes(wordId);
      return {
        ...prev,
        bookmarkedWordIds: exists
          ? prev.bookmarkedWordIds.filter((id) => id !== wordId)
          : [...prev.bookmarkedWordIds, wordId],
      };
    });
  };

  const handleSavePersonalWord = (card: VocabCard) => {
    setState((prev) => {
      const duplicate = [...prev.personalWords, ...prev.aiGeneratedWords, ...SEED_VOCABULARY].some(
        (w) => w.word.toLowerCase() === card.word.toLowerCase(),
      );
      if (duplicate) return prev;
      return {
        ...prev,
        personalWords: [card, ...prev.personalWords],
      };
    });
  };

  const handleSelectLevelFromDashboard = (level: CefrLevel) => {
    setSelectedLevel(level);
    setLevelError(null);
    const firstInLevel = allWords.find((w) => w.level === level);
    if (firstInLevel) {
      setActiveCardId(firstInLevel.id);
    }
    setActiveTab("soz-karti");
  };

  const handleOpenWordCard = (wordId: string) => {
    const found = allWords.find((w) => w.id === wordId);
    if (found) {
      setSelectedLevel(found.level);
      setActiveCardId(found.id);
    }
    setActiveTab("soz-karti");
  };

  const handleGenerateLevelWords = async (level: CefrLevel) => {
    setIsGeneratingLevel(true);
    setLevelError(null);

    try {
      const excludeWords = allWords.map((w) => w.word);
      const result = await postJson<{ cards?: VocabCard[] }>(
        "/api/vocabulary/generate-level",
        { level, excludeWords, count: 4 },
        "Səviyyə üçün yeni sözlər yaradıla bilmədi.",
      );

      if (!result.ok) {
        setLevelError(result.error);
        return;
      }

      const rawCards = Array.isArray(result.data.cards) ? result.data.cards : [];
      if (rawCards.length === 0) {
        setLevelError("Yeni təkrarolunmaz söz tapılmadı. Yenidən cəhd edin.");
        return;
      }

      const existingLower = new Set(allWords.map((w) => w.word.toLowerCase()));
      const newCards: VocabCard[] = [];

      for (const raw of rawCards) {
        if (typeof raw?.word === "string" && !existingLower.has(raw.word.toLowerCase())) {
          existingLower.add(raw.word.toLowerCase());
          newCards.push({
            id: `ai-${level.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            word: raw.word,
            ipa: raw.ipa,
            partOfSpeech: raw.partOfSpeech,
            level,
            meaningAz: raw.meaningAz,
            explanationAz: raw.explanationAz,
            mnemonicBridgeAz: raw.mnemonicBridgeAz,
            mnemonicHookPhrase: raw.mnemonicHookPhrase,
            mnemonicStoryAz: raw.mnemonicStoryAz,
            visualSceneTitle: raw.visualSceneTitle,
            visualSceneAz: raw.visualSceneAz,
            visualTheme: (raw.visualTheme || "book") as VisualTheme,
            retentionScore: raw.retentionScore || 94,
            examples: raw.examples || [],
            collocations: raw.collocations || [],
            source: "ai-level",
            createdAt: new Date().toISOString(),
          });
        }
      }

      if (newCards.length > 0) {
        setState((prev) => ({
          ...prev,
          aiGeneratedWords: [...newCards, ...prev.aiGeneratedWords],
        }));
        setSelectedLevel(level);
        setActiveCardId(newCards[0].id);
        showToast(`${level} səviyyəsi üçün ${newCards.length} yeni AI sözü əlavə edildi!`);
      }
    } finally {
      setIsGeneratingLevel(false);
    }
  };

  const handleRegenerateMnemonic = async (card: VocabCard) => {
    setIsRegeneratingMnemonic(true);
    setLevelError(null);

    try {
      const result = await postJson<{
        mnemonic: {
          mnemonicBridgeAz: string;
          mnemonicHookPhrase: string;
          mnemonicStoryAz: string;
          visualSceneTitle: string;
          visualSceneAz: string;
        };
      }>(
        "/api/vocabulary/regenerate-mnemonic",
        {
          word: card.word,
          meaningAz: card.meaningAz,
          level: card.level,
          previousBridge: card.mnemonicBridgeAz,
        },
        "Yeni assosiasiya yaradıla bilmədi.",
      );

      if (!result.ok) {
        setLevelError(result.error);
        return;
      }

      const m = result.data.mnemonic;
      setState((prev) => ({
        ...prev,
        mnemonicOverrides: {
          ...prev.mnemonicOverrides,
          [card.id]: {
            mnemonicBridgeAz: m.mnemonicBridgeAz,
            mnemonicHookPhrase: m.mnemonicHookPhrase,
            mnemonicStoryAz: m.mnemonicStoryAz,
            visualSceneTitle: m.visualSceneTitle,
            visualSceneAz: m.visualSceneAz,
          },
        },
      }));
      showToast(`"${card.word}" üçün yeni mnemonik assosiasiya yaradıldı!`);
    } finally {
      setIsRegeneratingMnemonic(false);
    }
  };

  const handleSaveQuizResult = (result: QuizResult) => {
    setState((prev) => ({
      ...prev,
      quizResults: [...prev.quizResults, result],
    }));
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setLevelError(null);
        }}
        todayLearnedCount={todayLearnedCount}
        dailyTarget={state.dailyTarget}
        onOpenSettings={() => setModalView("settings")}
        onOpenSummary={() => setModalView("summary")}
      />

      <main className="w-full pt-20 flex-1">
        <div className="max-w-7xl mx-auto px-margin-md py-margin-md">
          {activeTab === "ana-sehife" && (
            <DashboardView
              allWords={allWords}
              learnedIds={learnedIds}
              reviewIds={reviewIds}
              recentlyLearnedWords={recentlyLearnedWords}
              todayLearnedCount={todayLearnedCount}
              dailyTarget={state.dailyTarget}
              lastQuizResult={lastQuizResult}
              onNavigate={setActiveTab}
              onSelectLevel={handleSelectLevelFromDashboard}
              onOpenWordCard={handleOpenWordCard}
              onOpenTargetModal={() => setModalView("settings")}
            />
          )}

          {activeTab === "lugətim" && (
            <MyVocabularyView
              allWords={allWords}
              learnedIds={learnedIds}
              reviewIds={reviewIds}
              bookmarkedIds={bookmarkedIds}
              todayLearnedCount={todayLearnedCount}
              dailyTarget={state.dailyTarget}
              onMarkLearned={handleMarkLearned}
              onMarkReview={handleMarkReview}
              onToggleBookmark={handleToggleBookmark}
              onOpenFullCard={handleOpenWordCard}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "soz-karti" && (
            <VocabularyCardView
              selectedLevel={selectedLevel}
              onSelectLevel={(lvl) => {
                setSelectedLevel(lvl);
                setLevelError(null);
                const first = lvl === "ALL" ? allWords[0] : allWords.find((w) => w.level === lvl);
                if (first) setActiveCardId(first.id);
              }}
              cards={levelCards}
              activeCardId={activeCardId}
              onSelectCard={setActiveCardId}
              learnedIds={learnedIds}
              reviewIds={reviewIds}
              bookmarkedIds={bookmarkedIds}
              onMarkLearned={handleMarkLearned}
              onMarkReview={handleMarkReview}
              onToggleBookmark={handleToggleBookmark}
              onBackToVocabulary={() => setActiveTab("lugətim")}
              onGenerateLevelWords={handleGenerateLevelWords}
              isGeneratingLevel={isGeneratingLevel}
              levelError={levelError}
              onRegenerateMnemonic={handleRegenerateMnemonic}
              isRegeneratingMnemonic={isRegeneratingMnemonic}
            />
          )}

          {activeTab === "yeni-soz" && (
            <AddWordView
              existingWords={allWords}
              learnedIds={learnedIds}
              geminiConfigured={geminiConfigured}
              onSavePersonalWord={handleSavePersonalWord}
              onMarkLearned={handleMarkLearned}
              onOpenExistingCard={handleOpenWordCard}
            />
          )}

          {activeTab === "test" && (
            <QuizView
              learnedWords={learnedWords}
              allWords={allWords}
              lastQuizResult={lastQuizResult}
              onSaveQuizResult={handleSaveQuizResult}
              onNavigate={setActiveTab}
            />
          )}
        </div>
      </main>

      {/* Global Toast */}
      {globalToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-surface-container-high text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 flex items-center gap-3">
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <span className="text-body-sm font-medium">{globalToast}</span>
        </div>
      )}

      <SettingsModal
        isOpen={modalView !== null}
        initialView={modalView === "summary" ? "summary" : "settings"}
        dailyTarget={state.dailyTarget}
        todayLearnedCount={todayLearnedCount}
        totalLearnedCount={learnedIds.size}
        personalWordsCount={state.personalWords.length}
        reviewCount={reviewIds.size}
        lastQuizPercentage={lastQuizResult ? lastQuizResult.percentage : null}
        geminiConfigured={geminiConfigured}
        onClose={() => setModalView(null)}
        onSaveDailyTarget={(target) => {
          setState((prev) => ({ ...prev, dailyTarget: target }));
          showToast(`Gündəlik hədəf ${target} söz olaraq yeniləndi.`);
        }}
        onResetAllProgress={() => {
          const fresh = clearPersistedState();
          setState(fresh);
          showToast("Bütün öyrənmə məlumatları sıfırlandı.");
        }}
      />

      <footer className="w-full bg-surface-container-lowest py-space-xl mt-space-2xl">
        <div className="max-w-7xl mx-auto px-margin-md flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant">
          <div className="flex items-center gap-space-sm">
            <span className="text-headline-sm text-on-surface font-bold">Güolingo</span>
            <span className="text-body-sm text-on-surface-variant">
              — Süni intellekt dəstəkli mnemonik lüğət platforması
            </span>
          </div>
          <div className="text-body-sm">© 2025 Güolingo. Bütün hüquqlar qorunur.</div>
        </div>
      </footer>
    </div>
  );
}
