import React, { useState } from "react";
import { CefrLevel, VocabCard } from "../types/vocabulary";
import { CEFR_LEVEL_META } from "../data/seedVocabulary";
import { speakEnglish } from "../utils/speech";
import { MnemonicIllustration } from "./MnemonicIllustration";

interface VocabularyCardViewProps {
  selectedLevel: CefrLevel | "ALL";
  onSelectLevel: (level: CefrLevel | "ALL") => void;
  cards: VocabCard[];
  activeCardId: string;
  onSelectCard: (id: string) => void;
  learnedIds: Set<string>;
  reviewIds: Set<string>;
  bookmarkedIds: Set<string>;
  onMarkLearned: (card: VocabCard) => void;
  onMarkReview: (card: VocabCard) => void;
  onToggleBookmark: (cardId: string) => void;
  onBackToVocabulary: () => void;
  onGenerateLevelWords: (level: CefrLevel) => Promise<void>;
  isGeneratingLevel: boolean;
  levelError: string | null;
  onRegenerateMnemonic: (card: VocabCard) => Promise<void>;
  isRegeneratingMnemonic: boolean;
}

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const VocabularyCardView: React.FC<VocabularyCardViewProps> = ({
  selectedLevel,
  onSelectLevel,
  cards,
  activeCardId,
  onSelectCard,
  learnedIds,
  reviewIds,
  bookmarkedIds,
  onMarkLearned,
  onMarkReview,
  onToggleBookmark,
  onBackToVocabulary,
  onGenerateLevelWords,
  isGeneratingLevel,
  levelError,
  onRegenerateMnemonic,
  isRegeneratingMnemonic,
}) => {
  const [speakingTarget, setSpeakingTarget] = useState<string | null>(null);
  const [mnemonicFeedback, setMnemonicFeedback] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState(false);

  const currentIndex = Math.max(
    0,
    cards.findIndex((c) => c.id === activeCardId),
  );
  const card = cards[currentIndex] || cards[0];

  const handleSpeak = (text: string, key: string) => {
    setSpeakingTarget(key);
    speakEnglish(text, {
      onEnd: () => setSpeakingTarget(null),
    });
  };

  const handlePrev = () => {
    if (cards.length <= 1) return;
    const prevIdx = (currentIndex - 1 + cards.length) % cards.length;
    onSelectCard(cards[prevIdx].id);
    setMnemonicFeedback(null);
  };

  const handleNext = () => {
    if (cards.length <= 1) return;
    const nextIdx = (currentIndex + 1) % cards.length;
    onSelectCard(cards[nextIdx].id);
    setMnemonicFeedback(null);
  };

  const handleShareCopy = async () => {
    if (!card) return;
    const summary = `${card.word} ${card.ipa} — ${card.meaningAz}\nAssosiasiya: ${card.mnemonicStoryAz}`;
    try {
      await navigator.clipboard.writeText(summary);
      setCopiedNotice(true);
      setTimeout(() => setCopiedNotice(false), 2200);
    } catch {
      // Clipboard unavailable
    }
  };

  const targetLevelForAI: CefrLevel =
    selectedLevel === "ALL" ? card?.level || "B1" : selectedLevel;

  const progressPct = cards.length > 0 ? Math.round(((currentIndex + 1) / cards.length) * 100) : 0;

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[280px] bg-gradient-to-b from-primary-container/20 via-secondary-container/10 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Level Switcher + AI Generator Strip */}
      <div className="relative z-10 mb-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSelectLevel("ALL")}
            className={`px-3 py-1.5 rounded-lg text-label-md transition-all ${
              selectedLevel === "ALL"
                ? "bg-primary text-on-primary font-bold"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Hamısı
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onSelectLevel(lvl)}
              className={`px-3 py-1.5 rounded-lg text-label-md transition-all ${
                selectedLevel === lvl
                  ? "bg-secondary text-on-secondary font-bold"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {lvl} — {CEFR_LEVEL_META[lvl].labelAz}
            </button>
          ))}
        </div>

        <button
          type="button"
          disabled={isGeneratingLevel}
          onClick={() => onGenerateLevelWords(targetLevelForAI)}
          className="px-4 py-2 rounded-lg bg-primary/15 hover:bg-primary/25 text-primary text-label-md font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shrink-0"
        >
          <span
            className={`material-symbols-outlined text-[18px] ${
              isGeneratingLevel ? "animate-spin" : ""
            }`}
          >
            {isGeneratingLevel ? "sync" : "auto_awesome"}
          </span>
          <span>
            {isGeneratingLevel
              ? `${targetLevelForAI} sözləri yaradılır...`
              : `${targetLevelForAI} üçün AI ilə yeni sözlər yarat`}
          </span>
        </button>
      </div>

      {levelError && (
        <div className="relative z-10 mb-space-md rounded-xl bg-error-container/30 border border-error/40 p-space-md flex items-center gap-3 text-on-error-container text-body-md">
          <span className="material-symbols-outlined text-error text-[22px] shrink-0">error</span>
          <span>{levelError}</span>
        </div>
      )}

      {!card ? (
        <div className="rounded-xl bg-surface-container-low p-space-2xl text-center">
          <p className="text-headline-sm text-on-surface mb-4">Bu səviyyədə hələ söz yoxdur.</p>
          <button
            type="button"
            onClick={() => onGenerateLevelWords(targetLevelForAI)}
            className="px-6 py-3 rounded-lg bg-primary text-on-primary font-bold text-label-lg"
          >
            AI ilə sözlər yarat
          </button>
        </div>
      ) : (
        <>
          {/* Navigation Header & Telemetry */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-space-md mb-space-lg">
            <div className="flex items-center gap-space-md flex-wrap">
              <button
                type="button"
                onClick={onBackToVocabulary}
                className="group flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-all text-on-surface-variant hover:text-on-surface shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform text-secondary">
                  arrow_back
                </span>
                <span className="text-label-lg">Lüğətə qayıt</span>
              </button>
              <div className="h-4 w-px bg-surface-variant hidden sm:block" />
              <div className="flex items-center gap-space-xs">
                <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-label-sm uppercase tracking-wider font-semibold">
                  {card.level} Səviyyə
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm uppercase tracking-wider font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">psychology</span>
                  Mnemonik Rejim
                </span>
                {card.source === "personal" && (
                  <span className="px-2.5 py-0.5 rounded-full bg-tertiary/15 text-tertiary text-label-sm uppercase font-semibold">
                    Şəxsi Söz
                  </span>
                )}
              </div>
            </div>

            {/* Segmented Progress Bar & Step Indicator */}
            <div className="flex items-center gap-space-lg justify-between md:justify-end">
              <div className="flex flex-col gap-1.5 w-48 sm:w-64">
                <div className="flex justify-between items-center text-on-surface-variant tabular-nums">
                  <span className="text-label-sm uppercase tracking-wider">İrəliləyiş</span>
                  <span className="text-label-md text-on-surface font-semibold">
                    Söz {currentIndex + 1} / {cards.length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-container via-primary to-secondary rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onToggleBookmark(card.id)}
                  title="Əlfəcinə əlavə et"
                  className="w-10 h-10 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-primary transition-all shadow-sm"
                >
                  <span
                    className={`material-symbols-outlined text-[20px] ${
                      bookmarkedIds.has(card.id) ? "text-primary material-symbols-filled" : ""
                    }`}
                  >
                    {bookmarkedIds.has(card.id) ? "bookmark" : "bookmark_border"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleShareCopy}
                  title="Sözü kopyala"
                  className="w-10 h-10 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-all shadow-sm"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {copiedNotice ? "check" : "share"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Main Workspace Layout: Desktop Two-Column Grid */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            {/* Left Column: Word Identity, Pronunciation, Translation, Visual Scene, Collocations */}
            <div className="lg:col-span-5 flex flex-col gap-space-lg">
              {/* Primary Word Card */}
              <div className="relative bg-surface-container-low rounded-xl p-space-xl overflow-hidden shadow-xl">
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-primary/10 blur-2xl rounded-full pointer-events-none" />
                <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-label-md text-secondary tracking-wide">
                    {card.partOfSpeech}
                  </span>
                  <span
                    className={`text-label-sm uppercase tracking-widest font-bold ${
                      learnedIds.has(card.id)
                        ? "text-tertiary"
                        : reviewIds.has(card.id)
                        ? "text-secondary"
                        : "text-on-surface-variant"
                    }`}
                  >
                    {learnedIds.has(card.id)
                      ? "ÖYRƏNİLİB"
                      : reviewIds.has(card.id)
                      ? "TƏKRAR GÖZLƏYİR"
                      : "AKTİV KART"}
                  </span>
                </div>

                {/* Word Typography */}
                <div className="my-space-md">
                  <h1 className="text-[32px] sm:text-display-lg text-on-surface tracking-tight font-extrabold uppercase break-words">
                    {card.word}
                  </h1>
                  <div className="flex items-center gap-space-md mt-space-xs flex-wrap">
                    <span className="text-headline-sm text-on-surface-variant font-mono font-normal">
                      {card.ipa}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSpeak(card.word, "main")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high hover:bg-surface-variant text-secondary text-label-md transition-all active:scale-95 shadow-[0_0_12px_rgba(123,208,255,0.15)] ${
                        speakingTarget === "main" ? "ring-2 ring-secondary" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">volume_up</span>
                      <span>{speakingTarget === "main" ? "Səslənir..." : "Dinlə"}</span>
                    </button>
                  </div>
                </div>

                {/* Azerbaijani Translation Box */}
                <div className="mt-space-lg bg-surface-container rounded-lg p-space-md">
                  <span className="text-label-sm text-secondary uppercase tracking-wider block mb-1">
                    Azərbaycanca Tərcüməsi
                  </span>
                  <p className="text-headline-sm text-on-surface font-semibold leading-relaxed">
                    {card.meaningAz}
                  </p>
                  {card.explanationAz && card.explanationAz !== card.meaningAz && (
                    <p className="text-body-sm text-on-surface-variant mt-1.5">{card.explanationAz}</p>
                  )}
                </div>
              </div>

              {/* Visual Association Graphic Scene */}
              <div className="relative rounded-xl overflow-hidden bg-surface-container-low p-space-md shadow-lg">
                <MnemonicIllustration
                  theme={card.visualTheme}
                  word={card.word}
                  hookPhrase={card.mnemonicHookPhrase}
                  title={card.visualSceneTitle}
                  caption={card.visualSceneAz}
                />
              </div>

              {/* Collocations Box */}
              <div className="bg-surface-container-low rounded-xl p-space-lg shadow-md">
                <div className="flex items-center gap-2 mb-space-md">
                  <span className="material-symbols-outlined text-secondary text-[20px]">hub</span>
                  <h3 className="text-headline-sm text-on-surface font-bold">
                    Ən Çox İşlənən Birləşmələr
                  </h3>
                </div>
                <div className="flex flex-col gap-2.5">
                  {card.collocations.map((col, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleSpeak(col.phrase, `col-${idx}`)}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer"
                    >
                      <span className="text-label-lg text-secondary font-semibold">{col.phrase}</span>
                      <span className="text-body-sm text-on-surface-variant text-right">{col.az}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: AI Mnemonic Hero Box & Example Sentences */}
            <div className="lg:col-span-7 flex flex-col gap-space-lg">
              {/* THE AI MNEMONIC HERO BOX */}
              <div className="relative rounded-2xl p-space-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low overflow-hidden shadow-[0_0_35px_rgba(160,120,255,0.18)]">
                <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-primary-container/25 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-10">
                  <span className="material-symbols-outlined text-[140px] text-primary">psychology_alt</span>
                </div>

                {/* Hero Badge & Recall Metric */}
                <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-lg relative z-10">
                  <div className="flex items-center gap-space-xs px-3.5 py-1.5 rounded-full bg-primary/20 text-primary text-label-md font-bold tracking-wide shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">smart_toy</span>
                    <span>SÜNİ İNTELLEKT YADDAŞ ASSOSİASİYASI</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary-container/30 text-tertiary text-label-md font-bold tabular-nums">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>{card.retentionScore}% Yaddaşda qalma</span>
                  </div>
                </div>

                {/* Sound Bridge */}
                <div className="mb-space-lg p-space-md rounded-xl bg-surface-container-lowest/70 backdrop-blur-md relative z-10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">hearing</span>
                    <span className="text-label-sm uppercase tracking-wider text-secondary font-bold">
                      Fonetik Bənzərlik Körpüsü
                    </span>
                  </div>
                  <p className="text-body-lg text-on-surface">
                    {card.mnemonicBridgeAz}{" "}
                    <span className="inline-block ml-1 text-secondary font-bold bg-secondary/15 px-2 py-0.5 rounded">
                      “{card.mnemonicHookPhrase}”
                    </span>
                  </p>
                </div>

                {/* Mnemonic Story */}
                <div className="p-space-lg rounded-xl bg-gradient-to-r from-primary-container/20 to-surface-container-high/60 backdrop-blur-sm relative z-10">
                  <div className="flex items-center gap-2 mb-space-sm">
                    <span className="material-symbols-outlined text-primary text-[20px]">lightbulb</span>
                    <span className="text-headline-sm text-on-surface font-bold">Mnemonik Hekayə</span>
                  </div>
                  <p className="text-body-lg text-on-surface leading-relaxed">“{card.mnemonicStoryAz}”</p>
                  <div className="mt-space-md flex items-center gap-space-xs text-on-surface-variant text-label-md">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    <span>
                      Koqnitiv əlaqə: {card.meaningAz.split(",")[0]} → {card.mnemonicHookPhrase} →{" "}
                      {card.word}
                    </span>
                  </div>
                </div>

                {/* Interactive Micro-Feedback / Regenerate */}
                <div className="mt-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-lowest/40 rounded-xl px-space-md py-space-sm relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[18px]">neurology</span>
                    <span className="text-label-md text-on-surface">
                      {mnemonicFeedback || "Bu assosiasiya yadınızda qaldı?"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMnemonicFeedback("Əla! Yaddaş bağı möhkəmləndi.")}
                      className="px-3 py-1 rounded bg-surface-container hover:bg-surface-variant text-on-surface text-label-sm transition-all"
                    >
                      Bəli, əladır
                    </button>
                    <button
                      type="button"
                      disabled={isRegeneratingMnemonic}
                      onClick={() => onRegenerateMnemonic(card)}
                      className="px-3 py-1 rounded bg-surface-container hover:bg-surface-variant text-primary text-label-sm transition-all disabled:opacity-50"
                    >
                      {isRegeneratingMnemonic ? "Yaradılır..." : "Yeni assosiasiya ver"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Example Sentences */}
              <div className="bg-surface-container-low rounded-xl p-space-xl shadow-lg">
                <div className="flex items-center justify-between mb-space-lg">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[22px]">format_quote</span>
                    <h2 className="text-headline-lg text-on-surface font-bold tracking-tight">
                      Nümunə Cümlələr
                    </h2>
                  </div>
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                    Kontekstdə tətbiq
                  </span>
                </div>

                <div className="flex flex-col gap-space-md">
                  {card.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-space-md rounded-xl bg-surface-container hover:bg-surface-container-high transition-all flex flex-col gap-1.5"
                    >
                      <div className="flex items-start justify-between gap-space-sm">
                        <p className="text-body-lg text-on-surface font-medium leading-relaxed">
                          “{ex.en}”
                        </p>
                        <button
                          type="button"
                          onClick={() => handleSpeak(ex.en, `ex-${idx}`)}
                          title="Cümləni səsləndir"
                          className={`p-1.5 rounded-lg text-on-surface-variant hover:text-secondary transition-colors shrink-0 ${
                            speakingTarget === `ex-${idx}` ? "text-secondary bg-secondary/10" : ""
                          }`}
                        >
                          <span className="material-symbols-outlined text-[18px]">volume_up</span>
                        </button>
                      </div>
                      <p className="text-body-md text-on-surface-variant">“{ex.az}”</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Learning Action Console */}
          <div className="relative z-10 mt-space-xl p-space-md rounded-2xl bg-surface-container-low shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm w-full sm:w-auto flex-wrap">
              <button
                type="button"
                onClick={() => onMarkReview(card)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-space-lg py-3 rounded-lg font-label-lg text-label-lg transition-all active:scale-95 shadow-sm ${
                  reviewIds.has(card.id)
                    ? "bg-secondary/20 text-secondary"
                    : "bg-surface-container hover:bg-surface-container-high text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">replay</span>
                <span>Yenidən bax</span>
              </button>

              <button
                type="button"
                onClick={() => onMarkLearned(card)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-space-lg py-3 rounded-lg font-label-lg text-label-lg font-bold transition-all active:scale-95 shadow-sm ${
                  learnedIds.has(card.id)
                    ? "bg-tertiary-container/30 text-tertiary"
                    : "bg-surface-container hover:bg-surface-container-high text-tertiary"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">check_circle</span>
                <span>{learnedIds.has(card.id) ? "Öyrənilib" : "Öyrəndim"}</span>
              </button>
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-space-sm">
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-lg transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">arrow_back</span>
                <span className="hidden sm:inline">Əvvəlki</span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-space-sm px-space-2xl py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container text-label-lg font-bold shadow-[0_4px_16px_rgba(160,120,255,0.35)] transition-all active:scale-95"
              >
                <span>Növbəti söz</span>
                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
