import React, { useMemo, useState } from "react";
import { NavTab, QuizMistake, QuizQuestion, QuizResult, QuizType, VocabCard } from "../types/vocabulary";
import { speakEnglish } from "../utils/speech";

interface QuizViewProps {
  learnedWords: VocabCard[];
  allWords: VocabCard[];
  lastQuizResult: QuizResult | null;
  onSaveQuizResult: (result: QuizResult) => void;
  onNavigate: (tab: NavTab) => void;
}

type QuizModeOption = QuizType | "mixed";

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildQuestions(
  learnedWords: VocabCard[],
  allWords: VocabCard[],
  mode: QuizModeOption,
): QuizQuestion[] {
  if (learnedWords.length < 4) return [];

  const pool = shuffleArray(learnedWords).slice(0, Math.min(10, learnedWords.length));
  const distractorPool = allWords.length >= 4 ? allWords : learnedWords;

  return pool.map((target, idx) => {
    const type: QuizType =
      mode === "mixed" ? (idx % 2 === 0 ? "en-to-az" : "az-to-en") : mode;

    const correctAnswer = type === "en-to-az" ? target.meaningAz : target.word;
    const promptText = type === "en-to-az" ? target.word : target.meaningAz;

    const candidates = shuffleArray(
      distractorPool.filter((w) => {
        if (w.id === target.id) return false;
        const val = type === "en-to-az" ? w.meaningAz : w.word;
        return val.trim().toLowerCase() !== correctAnswer.trim().toLowerCase();
      }),
    );

    const uniqueOptions: string[] = [correctAnswer];
    const seenLower = new Set([correctAnswer.trim().toLowerCase()]);

    for (const c of candidates) {
      if (uniqueOptions.length >= 4) break;
      const val = type === "en-to-az" ? c.meaningAz : c.word;
      const key = val.trim().toLowerCase();
      if (!seenLower.has(key)) {
        seenLower.add(key);
        uniqueOptions.push(val);
      }
    }

    return {
      id: `q-${target.id}-${idx}`,
      wordCard: target,
      type,
      promptText,
      options: shuffleArray(uniqueOptions),
      correctAnswer,
    };
  });
}

const OPTION_LETTERS = ["A", "B", "C", "D"];

export const QuizView: React.FC<QuizViewProps> = ({
  learnedWords,
  allWords,
  lastQuizResult,
  onSaveQuizResult,
  onNavigate,
}) => {
  const [quizMode, setQuizMode] = useState<QuizModeOption>("mixed");
  const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
    buildQuestions(learnedWords, allWords, "mixed"),
  );
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakes, setMistakes] = useState<QuizMistake[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showMnemonicHint, setShowMnemonicHint] = useState(false);

  const startNewQuiz = (nextMode: QuizModeOption = quizMode) => {
    const built = buildQuestions(learnedWords, allWords, nextMode);
    setQuizMode(nextMode);
    setQuestions(built);
    setCurrentIdx(0);
    setSelectedOption(null);
    setCorrectCount(0);
    setMistakes([]);
    setIsCompleted(false);
    setShowMnemonicHint(false);
  };

  // Sync if user just learned enough words
  const effectiveQuestions = useMemo(() => {
    if (questions.length > 0 || learnedWords.length < 4) return questions;
    return buildQuestions(learnedWords, allWords, quizMode);
  }, [questions, learnedWords, allWords, quizMode]);

  if (learnedWords.length < 4) {
    return (
      <div className="max-w-3xl mx-auto rounded-2xl bg-surface-container-low p-space-2xl text-center shadow-xl space-y-space-lg">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-[34px]">quiz</span>
        </div>
        <h1 className="text-headline-lg text-on-surface font-bold">
          Testə başlamaq üçün ən azı 4 öyrənilmiş söz lazımdır
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-xl mx-auto">
          Test sualları yalnız sizin “Öyrəndim” olaraq işarələdiyiniz sözlərdən tərtib olunur. Hazırda{" "}
          <span className="text-secondary font-bold">{learnedWords.length}</span> öyrənilmiş sözünüz var.
        </p>
        <div className="flex items-center justify-center gap-space-md flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate("soz-karti")}
            className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-lg"
          >
            Söz Kartlarına keç
          </button>
          <button
            type="button"
            onClick={() => onNavigate("yeni-soz")}
            className="px-6 py-3 rounded-lg bg-surface-container-high text-on-surface font-semibold text-label-lg"
          >
            Yeni söz əlavə et
          </button>
        </div>
      </div>
    );
  }

  const activeQuestion = effectiveQuestions[currentIdx];
  const answeredCount = isCompleted
    ? effectiveQuestions.length
    : currentIdx + (selectedOption !== null ? 1 : 0);
  const progressPct =
    effectiveQuestions.length > 0
      ? Math.round((answeredCount / effectiveQuestions.length) * 100)
      : 0;

  const handleSelectOption = (option: string) => {
    if (selectedOption !== null || !activeQuestion) return;
    setSelectedOption(option);

    if (option === activeQuestion.correctAnswer) {
      setCorrectCount((c) => c + 1);
    } else {
      setMistakes((prev) => [
        ...prev,
        { question: activeQuestion, selectedAnswer: option },
      ]);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 >= effectiveQuestions.length) {
      const total = effectiveQuestions.length;
      const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
      setIsCompleted(true);
      onSaveQuizResult({
        id: `quiz-${Date.now()}`,
        completedAt: new Date().toISOString(),
        totalQuestions: total,
        correctCount,
        incorrectCount: total - correctCount,
        percentage: pct,
        quizMode,
      });
      return;
    }

    setCurrentIdx((i) => i + 1);
    setSelectedOption(null);
    setShowMnemonicHint(false);
  };

  const displayPercentage = isCompleted
    ? Math.round((correctCount / Math.max(1, effectiveQuestions.length)) * 100)
    : answeredCount > 0
    ? Math.round((correctCount / answeredCount) * 100)
    : lastQuizResult?.percentage ?? 0;

  const ringCircumference = 175.9;
  const ringOffset = ringCircumference - (ringCircumference * displayPercentage) / 100;

  return (
    <div className="flex flex-col w-full gap-space-md">
      {/* Quiz Type Selector Strip (Only the 2 permitted types + mixed) */}
      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
          <span className="text-label-lg text-on-surface font-bold">Test Növü:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "en-to-az", label: "Növ 1: İngilis → Azərbaycan" },
              { id: "az-to-en", label: "Növ 2: Azərbaycan → İngilis" },
              { id: "mixed", label: "Qarışıq (Hər iki növ)" },
            ] as { id: QuizModeOption; label: string }[]
          ).map((modeOpt) => (
            <button
              key={modeOpt.id}
              type="button"
              onClick={() => startNewQuiz(modeOpt.id)}
              className={`px-3.5 py-2 rounded-lg text-label-md transition-all ${
                quizMode === modeOpt.id
                  ? "bg-secondary text-on-secondary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {modeOpt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg w-full items-start">
        {/* LEFT PANEL: Active Quiz Interface */}
        <div className="xl:col-span-7 flex flex-col gap-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-md shadow-md flex flex-col gap-space-sm">
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-sm uppercase tracking-wider font-bold">
                  LÜĞƏT SINAĞI
                </span>
                <span className="text-on-surface-variant text-label-md">•</span>
                <span className="text-on-surface text-label-md font-bold tabular-nums">
                  {isCompleted
                    ? `Tamamlandı (${effectiveQuestions.length} / ${effectiveQuestions.length})`
                    : `Sual ${currentIdx + 1} / ${effectiveQuestions.length}`}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onNavigate("ana-sehife")}
                title="Testdən çıx"
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="w-full bg-surface-container-highest h-2 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {!isCompleted && activeQuestion ? (
            <div className="bg-surface-container rounded-xl p-space-lg shadow-xl relative overflow-hidden flex flex-col gap-space-lg">
              <div className="absolute -top-16 -left-16 w-52 h-52 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

              {/* Question Prompt */}
              <div className="flex flex-col gap-space-xs relative z-10">
                <div className="flex items-center gap-space-xs text-on-surface-variant text-label-md">
                  <span className="material-symbols-outlined text-secondary text-[18px]">quiz</span>
                  <span>
                    {activeQuestion.type === "en-to-az"
                      ? "Bu ingilis sözünün Azərbaycan dilində mənasını seçin:"
                      : "Bu mənanın qarşılığı olan düzgün ingilis sözünü seçin:"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-space-md flex-wrap">
                      <h1
                        className={`text-on-surface tracking-tight font-extrabold ${
                          activeQuestion.type === "en-to-az"
                            ? "text-[30px] sm:text-display-lg uppercase"
                            : "text-headline-lg"
                        }`}
                      >
                        {activeQuestion.promptText}
                      </h1>
                      {activeQuestion.type === "en-to-az" && (
                        <button
                          type="button"
                          onClick={() => speakEnglish(activeQuestion.wordCard.word)}
                          title="Tələffüzü dinlə"
                          className="w-10 h-10 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-secondary flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[22px]">volume_up</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-space-sm mt-1">
                      {activeQuestion.type === "en-to-az" && (
                        <>
                          <span className="text-secondary text-headline-sm font-mono">
                            {activeQuestion.wordCard.ipa}
                          </span>
                          <span className="text-on-surface-variant text-body-sm">•</span>
                        </>
                      )}
                      <span className="text-on-surface-variant text-body-sm">
                        {activeQuestion.wordCard.partOfSpeech}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-label-sm font-bold uppercase tracking-wider">
                        {activeQuestion.wordCard.level} Səviyyə
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible Mnemonic Memory Anchor */}
              <div className="bg-surface-container-high rounded-xl p-space-md relative z-10">
                <button
                  type="button"
                  onClick={() => setShowMnemonicHint((s) => !s)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      psychology_alt
                    </span>
                    <span className="text-label-lg text-primary font-bold">Mnemonik Yaddaş Bağı</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-label-sm uppercase">
                      İpucu
                    </span>
                  </div>
                  <span
                    className={`material-symbols-outlined text-on-surface-variant transition-transform duration-200 ${
                      showMnemonicHint ? "rotate-180" : ""
                    }`}
                  >
                    expand_more
                  </span>
                </button>
                {showMnemonicHint && (
                  <div className="pt-space-sm mt-space-xs text-on-surface-variant text-body-md">
                    <p>
                      <strong className="text-primary font-semibold">
                        “{activeQuestion.wordCard.mnemonicHookPhrase}”
                      </strong>{" "}
                      — {activeQuestion.wordCard.mnemonicStoryAz}
                    </p>
                  </div>
                )}
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md relative z-10">
                {activeQuestion.options.map((option, idx) => {
                  const isAnswered = selectedOption !== null;
                  const isSelected = selectedOption === option;
                  const isCorrect = option === activeQuestion.correctAnswer;

                  let cardClass =
                    "bg-surface-container-high hover:bg-surface-bright text-on-surface cursor-pointer";
                  let badgeClass =
                    "bg-surface-container-highest text-on-surface-variant";

                  if (isAnswered) {
                    if (isCorrect) {
                      cardClass = "bg-tertiary-container/20 border border-tertiary/50 text-tertiary";
                      badgeClass = "bg-tertiary text-on-tertiary";
                    } else if (isSelected && !isCorrect) {
                      cardClass = "bg-error-container/25 border border-error/50 text-error";
                      badgeClass = "bg-error text-on-error";
                    } else {
                      cardClass = "bg-surface-container-high/50 text-on-surface-variant opacity-70";
                    }
                  }

                  return (
                    <button
                      key={`${activeQuestion.id}-${idx}`}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(option)}
                      className={`rounded-xl p-space-md flex flex-col gap-space-xs text-left transition-all shadow-sm ${cardClass}`}
                    >
                      <div className="flex items-center justify-between gap-space-sm w-full">
                        <div className="flex items-center gap-space-sm min-w-0">
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-label-lg font-bold shrink-0 ${badgeClass}`}
                          >
                            {OPTION_LETTERS[idx]}
                          </span>
                          <span className="text-label-lg font-medium break-words">{option}</span>
                        </div>

                        {isAnswered && isCorrect && (
                          <span className="material-symbols-outlined text-tertiary text-[20px] shrink-0">
                            check_circle
                          </span>
                        )}
                        {isAnswered && isSelected && !isCorrect && (
                          <span className="material-symbols-outlined text-error text-[20px] shrink-0">
                            cancel
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Feedback Banner */}
              {selectedOption !== null && (
                <div
                  className={`rounded-xl p-space-md text-body-md relative z-10 ${
                    selectedOption === activeQuestion.correctAnswer
                      ? "bg-tertiary-container/15 text-tertiary"
                      : "bg-error-container/20 text-on-error-container"
                  }`}
                >
                  {selectedOption === activeQuestion.correctAnswer ? (
                    <span>
                      Düzgün cavab! <strong>{activeQuestion.wordCard.word}</strong> —{" "}
                      {activeQuestion.wordCard.meaningAz}.
                    </span>
                  ) : (
                    <span>
                      Səhv cavab. Doğru cavab:{" "}
                      <strong className="text-tertiary">{activeQuestion.correctAnswer}</strong>.
                    </span>
                  )}
                </div>
              )}

              {/* Footer Controls */}
              <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-sm relative z-10">
                <button
                  type="button"
                  onClick={() => onNavigate("ana-sehife")}
                  className="px-space-lg py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-lg transition-all flex items-center gap-space-xs shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Testdən çıx</span>
                </button>

                <button
                  type="button"
                  disabled={selectedOption === null}
                  onClick={handleNextQuestion}
                  className="px-space-xl py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-container text-headline-sm font-semibold transition-all shadow-lg flex items-center gap-space-xs active:scale-95 disabled:opacity-40"
                >
                  <span>
                    {currentIdx + 1 >= effectiveQuestions.length ? "Nəticəyə bax" : "Növbəti sual"}
                  </span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface-container rounded-xl p-space-xl shadow-xl text-center space-y-space-md">
              <div className="w-16 h-16 rounded-2xl bg-tertiary-container/30 text-tertiary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[36px] material-symbols-filled">
                  emoji_events
                </span>
              </div>
              <h2 className="text-headline-lg text-on-surface font-bold">Test Tamamlandı!</h2>
              <p className="text-body-lg text-on-surface-variant">
                Nəticə: <strong className="text-tertiary">{correctCount}</strong> düzgün,{" "}
                <strong className="text-error">{effectiveQuestions.length - correctCount}</strong> səhv (
                <strong className="text-secondary">{displayPercentage}%</strong>)
              </p>
              <div className="flex items-center justify-center gap-space-md pt-2">
                <button
                  type="button"
                  onClick={() => startNewQuiz(quizMode)}
                  className="px-6 py-3 rounded-lg bg-secondary text-on-secondary font-bold text-label-lg flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                  <span>Yenidən başla</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL: Quiz Results & Error Review Card */}
        <div className="xl:col-span-5 flex flex-col gap-space-md">
          <div className="bg-surface-container rounded-xl p-space-lg shadow-xl flex flex-col gap-space-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-tertiary-container/30 text-tertiary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-[30px] material-symbols-filled">
                    emoji_events
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-tertiary text-label-sm uppercase tracking-wider font-bold">
                    Nəticə Xülasəsi
                  </span>
                  <h2 className="text-headline-lg text-on-surface font-bold tracking-tight">
                    {isCompleted ? "Test Tamamlandı!" : "Canlı Nəticə"}
                  </h2>
                </div>
              </div>

              <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    className="text-surface-container-highest"
                    cx="32"
                    cy="32"
                    fill="none"
                    r="28"
                    stroke="currentColor"
                    strokeWidth="6"
                  />
                  <circle
                    className="text-tertiary transition-all duration-500"
                    cx="32"
                    cy="32"
                    fill="none"
                    r="28"
                    stroke="currentColor"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringOffset}
                    strokeLinecap="round"
                    strokeWidth="6"
                  />
                </svg>
                <span className="absolute text-label-lg font-bold text-on-surface tabular-nums">
                  {displayPercentage}%
                </span>
              </div>
            </div>

            {/* 3 Score Metrics Tiles */}
            <div className="grid grid-cols-3 gap-space-sm tabular-nums">
              <div className="bg-surface-container-high rounded-lg p-space-md flex flex-col items-center justify-center text-center shadow-sm">
                <div className="flex items-center gap-1 text-tertiary mb-1">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                  <span className="text-headline-md font-bold">{correctCount}</span>
                </div>
                <span className="text-on-surface-variant text-label-md font-medium">Düzgün</span>
              </div>
              <div className="bg-surface-container-high rounded-lg p-space-md flex flex-col items-center justify-center text-center shadow-sm">
                <div className="flex items-center gap-1 text-error mb-1">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  <span className="text-headline-md font-bold">{mistakes.length}</span>
                </div>
                <span className="text-on-surface-variant text-label-md font-medium">Səhv</span>
              </div>
              <div className="bg-surface-container-high rounded-lg p-space-md flex flex-col items-center justify-center text-center shadow-sm">
                <div className="flex items-center gap-1 text-secondary mb-1">
                  <span className="material-symbols-outlined text-[18px]">military_tech</span>
                  <span className="text-headline-md font-bold">{displayPercentage}%</span>
                </div>
                <span className="text-on-surface-variant text-label-md font-medium">Nəticə</span>
              </div>
            </div>

            {/* Error Review Section */}
            <div className="flex flex-col gap-space-sm pt-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-on-surface text-label-lg font-bold">
                  <span className="material-symbols-outlined text-error text-[18px]">find_in_page</span>
                  <span>Səhvlərin Analizi</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-error-container/40 text-on-error-container text-label-sm font-semibold">
                  {mistakes.length} səhv
                </span>
              </div>

              {mistakes.length === 0 ? (
                <div className="bg-surface-container-lowest rounded-xl p-space-md text-body-sm text-on-surface-variant">
                  {answeredCount === 0
                    ? "Sualları cavabladıqca səhv edilən sözlər və onların AI yaddaş bağları burada göstəriləcək."
                    : "Əla! Hələlik heç bir səhv cavabınız yoxdur."}
                </div>
              ) : (
                <div className="flex flex-col gap-space-sm max-h-96 overflow-y-auto pr-1">
                  {mistakes.map((m, idx) => (
                    <div
                      key={`${m.question.id}-${idx}`}
                      className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-sm shadow-sm"
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-on-surface-variant text-label-sm uppercase tracking-wide">
                          Sual:
                        </span>
                        <span className="text-on-surface text-headline-sm font-bold">
                          “{m.question.promptText}”
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                        <div className="bg-error-container/20 rounded-lg p-space-sm flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-error">
                            <span className="text-label-sm uppercase font-bold">Sənin Seçimin</span>
                            <span className="material-symbols-outlined text-[16px]">cancel</span>
                          </div>
                          <span className="text-label-lg font-bold text-on-surface line-through opacity-80">
                            {m.selectedAnswer}
                          </span>
                        </div>

                        <div className="bg-tertiary-container/20 rounded-lg p-space-sm flex flex-col gap-0.5">
                          <div className="flex items-center justify-between text-tertiary">
                            <span className="text-label-sm uppercase font-bold">Doğru Cavab</span>
                            <span className="material-symbols-outlined text-[16px]">check_circle</span>
                          </div>
                          <span className="text-label-lg font-bold text-tertiary">
                            {m.question.correctAnswer}
                          </span>
                        </div>
                      </div>

                      <div className="bg-surface-container-high rounded-lg p-space-sm flex items-start gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[18px] mt-0.5">
                          lightbulb
                        </span>
                        <div className="flex flex-col gap-0.5">
                          <span className="text-primary text-label-md font-bold">AI Yaddaş Lövbəri:</span>
                          <p className="text-on-surface text-body-sm">
                            {m.question.wordCard.mnemonicStoryAz}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Completion Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-space-md pt-space-xs">
              <button
                type="button"
                onClick={() => onNavigate("ana-sehife")}
                className="w-full sm:w-1/2 py-space-sm px-space-md rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface text-label-lg transition-all text-center flex items-center justify-center gap-space-xs shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">home</span>
                <span>Ana səhifə</span>
              </button>
              <button
                type="button"
                onClick={() => startNewQuiz(quizMode)}
                className="w-full sm:w-1/2 py-space-sm px-space-md rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed text-headline-sm font-semibold transition-all text-center flex items-center justify-center gap-space-xs shadow-md active:scale-95"
              >
                <span className="material-symbols-outlined text-[18px]">restart_alt</span>
                <span>Yenidən başla</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
