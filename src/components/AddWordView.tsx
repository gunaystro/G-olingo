import React, { useState } from "react";
import { CefrLevel, VocabCard, VisualTheme } from "../types/vocabulary";
import { postJson } from "../utils/api";
import { speakEnglish } from "../utils/speech";
import { MnemonicIllustration } from "./MnemonicIllustration";

interface AddWordViewProps {
  existingWords: VocabCard[];
  learnedIds: Set<string>;
  geminiConfigured: boolean | null;
  onSavePersonalWord: (card: VocabCard) => void;
  onMarkLearned: (card: VocabCard) => void;
  onOpenExistingCard: (wordId: string) => void;
}

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const AddWordView: React.FC<AddWordViewProps> = ({
  existingWords,
  learnedIds,
  geminiConfigured,
  onSavePersonalWord,
  onMarkLearned,
  onOpenExistingCard,
}) => {
  const [wordInput, setWordInput] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>("B2");
  const [strategy, setStrategy] = useState<"sound" | "visual">("sound");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [generatedCard, setGeneratedCard] = useState<VocabCard | null>(null);
  const [savedCardId, setSavedCardId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const normalizedInput = wordInput.trim().toLowerCase();
  const duplicateMatch = normalizedInput
    ? existingWords.find((w) => w.word.toLowerCase() === normalizedInput)
    : undefined;

  const previewCard = generatedCard || existingWords.find((w) => w.word.toLowerCase() === "obstinate") || existingWords[0];
  const isShowingExample = !generatedCard;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setToastMsg(null);

    const cleaned = wordInput.trim();
    if (!cleaned) {
      setErrorMsg("Zəhmət olmasa bir ingilis sözü daxil edin.");
      return;
    }

    if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) {
      setErrorMsg("Zəhmət olmasa yalnız ingilis hərflərindən ibarət düzgün söz yazın.");
      return;
    }

    if (duplicateMatch) {
      setErrorMsg(
        `"${duplicateMatch.word}" sözü artıq lüğət bazanızda mövcuddur. Mövcud kartı aça bilərsiniz.`,
      );
      return;
    }

    setIsLoading(true);
    setSavedCardId(null);

    try {
      const result = await postJson<{ card: VocabCard }>(
        "/api/vocabulary/generate-card",
        {
          word: cleaned,
          level: selectedLevel,
          strategy,
        },
        "Söz kartı yaradılarkən xəta baş verdi.",
      );

      if (!result.ok) {
        setErrorMsg(result.error);
        return;
      }

      const raw = result.data.card;
      const newCard: VocabCard = {
        id: `personal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        word: raw.word,
        ipa: raw.ipa,
        partOfSpeech: raw.partOfSpeech,
        level: raw.level as CefrLevel,
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
        source: "personal",
        createdAt: new Date().toISOString(),
      };

      setGeneratedCard(newCard);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePersonal = () => {
    if (!generatedCard) return;
    const duplicate = existingWords.find(
      (w) => w.word.toLowerCase() === generatedCard.word.toLowerCase(),
    );
    if (duplicate) {
      setErrorMsg(`"${generatedCard.word}" sözü artıq yadda saxlanılıb.`);
      return;
    }
    onSavePersonalWord(generatedCard);
    setSavedCardId(generatedCard.id);
    setToastMsg(`"${generatedCard.word}" şəxsi lüğətinizə yadda saxlanıldı!`);
  };

  const handleMarkAsLearned = () => {
    if (!generatedCard) return;
    if (!savedCardId) {
      onSavePersonalWord(generatedCard);
      setSavedCardId(generatedCard.id);
    }
    onMarkLearned(generatedCard);
    setToastMsg(`"${generatedCard.word}" həm də öyrənilmiş sözlərə əlavə edildi!`);
  };

  const handleReset = () => {
    setWordInput("");
    setGeneratedCard(null);
    setSavedCardId(null);
    setErrorMsg(null);
    setToastMsg(null);
  };

  const isSaved = Boolean(generatedCard && (savedCardId === generatedCard.id || existingWords.some((w) => w.id === generatedCard.id)));
  const isLearned = Boolean(generatedCard && learnedIds.has(generatedCard.id));

  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-primary-container/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Intro / Breadcrumb Section */}
      <div className="flex flex-col gap-space-xs mb-space-xl">
        <div className="flex items-center gap-space-xs text-label-md text-primary tracking-wider uppercase">
          <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
          <span>AI Mnemonik Qeneratoru</span>
          <span className="text-outline-variant">•</span>
          <span className="text-on-surface-variant font-medium">Şəxsi Lüğətin Genişləndirilməsi</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div>
            <h1 className="text-[32px] sm:text-display-lg text-on-surface tracking-tight font-extrabold">
              Şəxsi Sözünü Əlavə Et
            </h1>
            <p className="text-body-lg text-on-surface-variant mt-1 max-w-2xl">
              İstənilən ingilis sözünü yaz, süni intellekt sənin üçün unudulmaz assosiasiya və yaddaş
              hekayəsi qursun.
            </p>
          </div>

          <div className="flex items-center gap-space-sm bg-surface-container-low px-space-md py-space-sm rounded-xl shadow-sm w-fit">
            <span
              className={`material-symbols-outlined text-[20px] ${
                geminiConfigured === false ? "text-error" : "text-secondary"
              }`}
            >
              psychology
            </span>
            <span className="text-label-md text-on-surface">
              Koqnitiv Yaddaş:{" "}
              <span className={geminiConfigured === false ? "text-error font-bold" : "text-secondary font-bold"}>
                {geminiConfigured === false ? "Açar tələb olunur" : "Aktiv"}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Bento Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
        {/* LEFT COLUMN: Generator Form Panel */}
        <div className="lg:col-span-5 flex flex-col gap-space-lg">
          <div className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

            <form className="flex flex-col gap-space-md" onSubmit={handleGenerate}>
              {/* Word Input Field */}
              <div className="flex flex-col gap-space-xs">
                <label
                  htmlFor="englishWordInput"
                  className="text-label-lg text-on-surface flex items-center justify-between"
                >
                  <span>İngilis sözünü daxil et</span>
                  <span className="text-label-sm text-outline-variant uppercase">Mütləq sahə</span>
                </label>

                <div className="relative flex items-center">
                  <input
                    id="englishWordInput"
                    type="text"
                    value={wordInput}
                    onChange={(e) => {
                      setWordInput(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="Məsələn: Serendipity, Resilient..."
                    className="w-full h-[52px] bg-surface-container px-space-md pr-12 rounded-lg text-on-surface text-headline-sm placeholder:text-outline focus:outline-none focus:bg-surface-container-high transition-all shadow-inner"
                  />
                  {wordInput && (
                    <button
                      type="button"
                      onClick={() => setWordInput("")}
                      aria-label="Təmizlə"
                      className="absolute right-3 w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>

                {duplicateMatch && (
                  <div className="mt-1 p-3 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-between gap-2">
                    <span className="text-body-sm text-secondary">
                      “{duplicateMatch.word}” artıq bazada mövcuddur.
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenExistingCard(duplicateMatch.id)}
                      className="text-label-sm font-bold text-on-surface underline shrink-0"
                    >
                      Kartı aç
                    </button>
                  </div>
                )}
              </div>

              {/* CEFR Level Selector */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <label className="text-label-lg text-on-surface flex items-center justify-between">
                  <span>Səviyyə seçimi (CEFR)</span>
                  <span className="text-label-sm text-primary uppercase">AI təsdiqləyir</span>
                </label>
                <div className="grid grid-cols-6 gap-space-xs bg-surface-container-lowest p-1 rounded-xl">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setSelectedLevel(lvl)}
                      className={`py-2 text-center rounded-lg text-label-md transition-all ${
                        selectedLevel === lvl
                          ? "bg-secondary/15 text-secondary font-bold shadow-sm"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mnemonic Strategy Type */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <label className="text-label-lg text-on-surface">Mnemonik növü seçimi</label>
                <div className="grid grid-cols-2 gap-space-sm">
                  <button
                    type="button"
                    onClick={() => setStrategy("sound")}
                    className={`flex items-center gap-space-sm p-space-md rounded-xl text-left transition-all ${
                      strategy === "sound"
                        ? "bg-surface-container-high text-on-surface shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        strategy === "sound"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-variant text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">record_voice_over</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md font-bold truncate">Səs bənzərliyi</span>
                      <span className="text-body-sm text-on-surface-variant truncate">Fonetika əlaqəsi</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStrategy("visual")}
                    className={`flex items-center gap-space-sm p-space-md rounded-xl text-left transition-all ${
                      strategy === "visual"
                        ? "bg-surface-container-high text-on-surface shadow-sm"
                        : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        strategy === "visual"
                          ? "bg-primary/20 text-primary"
                          : "bg-surface-variant text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">neurology</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-label-md font-bold truncate">Vizual metafora</span>
                      <span className="text-body-sm text-on-surface-variant truncate">Kontekst hekayəsi</span>
                    </div>
                  </button>
                </div>
              </div>

              {geminiConfigured === false && !errorMsg && (
                <div className="rounded-xl bg-error-container/25 border border-error/35 p-3 flex items-start gap-2.5 text-on-error-container text-body-sm">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">
                    vpn_key
                  </span>
                  <span>
                    Serverdə <strong className="font-semibold">GEMINI_API_KEY</strong> təyin edilməyib.
                    Vercel layihənizin <strong className="font-semibold">Settings &gt; Environment Variables</strong>{" "}
                    bölməsinə açarı əlavə edib yenidən deploy edin.
                  </span>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl bg-error-container/30 border border-error/40 p-3 flex items-start gap-2.5 text-on-error-container text-body-sm">
                  <span className="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">
                    error
                  </span>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Primary Generate Action */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-[52px] mt-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary-container text-label-lg font-bold flex items-center justify-center gap-space-sm transition-transform active:scale-[0.98] shadow-lg shadow-primary-container/20 disabled:opacity-60"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isLoading ? "animate-spin" : ""
                  }`}
                >
                  {isLoading ? "sync" : "auto_fix_high"}
                </span>
                <span>{isLoading ? "AI söz kartını hazırlayır..." : "AI ilə hazırla"}</span>
              </button>
            </form>
          </div>

          {/* Quick Tips Callout */}
          <div className="bg-surface-container-lowest rounded-xl p-space-md flex items-start gap-space-md shadow-sm">
            <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 mt-0.5">
              <span className="material-symbols-outlined text-[22px]">lightbulb</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-lg text-on-surface font-bold">Neyro-yaddaş generatoru</span>
              <p className="text-body-md text-on-surface-variant mt-0.5">
                Sözləri sadəcə tərcümə ilə deyil, doğma dilindəki fonetik bənzərlik və vizual
                təsvirlərlə uzunmüddətli yaddaşa köçürür.
              </p>
            </div>
          </div>

          {/* System Meta Stats */}
          <div className="grid grid-cols-2 gap-space-md">
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
              <span className="text-label-sm text-on-surface-variant uppercase">Bazadakı sözlər</span>
              <div className="flex items-baseline gap-space-xs tabular-nums">
                <span className="text-headline-lg text-secondary font-bold">{existingWords.length}</span>
                <span className="text-body-sm text-on-surface-variant">hazır kart</span>
              </div>
            </div>
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-xs">
              <span className="text-label-sm text-on-surface-variant uppercase">Şəxsi sözlərin</span>
              <div className="flex items-baseline gap-space-xs tabular-nums">
                <span className="text-headline-lg text-primary font-bold">
                  {existingWords.filter((w) => w.source === "personal").length}
                </span>
                <span className="text-body-sm text-on-surface-variant">əlavə edilib</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI Live Card Preview */}
        <div className="lg:col-span-7 flex flex-col gap-space-md">
          {previewCard && (
            <div className="bg-gradient-to-br from-surface-container to-surface-container-high rounded-xl p-space-xl shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-space-md flex-wrap gap-2">
                <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-primary/15 text-primary">
                  <span className="material-symbols-outlined text-[16px]">auto_awesome</span>
                  <span className="text-label-sm uppercase font-bold tracking-wider">
                    {isShowingExample ? "Nümunə AI Mnemonik Kartı" : "Süni İntellekt Mnemonik"}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant text-label-md">
                  <span className="text-tertiary font-semibold">
                    {isLoading ? "Hazırlanır..." : isShowingExample ? "Nümunə" : "Yeni Yaradıldı"}
                  </span>
                </div>
              </div>

              {/* Word Presentation Row */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-space-sm pb-space-md">
                <div>
                  <div className="flex items-baseline gap-space-md flex-wrap">
                    <span className="text-[32px] sm:text-display-lg text-on-surface tracking-tight uppercase font-extrabold">
                      {previewCard.word}
                    </span>
                    <span className="text-headline-sm text-primary font-mono">{previewCard.ipa}</span>
                  </div>
                  <div className="flex items-center gap-space-sm mt-1">
                    <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-label-sm uppercase tracking-wide">
                      {previewCard.partOfSpeech}
                    </span>
                    <span className="text-outline-variant">•</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-label-sm font-bold">
                      {previewCard.level} Səviyyə
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => speakEnglish(previewCard.word)}
                  title="Tələffüzü dinlə"
                  className="w-11 h-11 rounded-full bg-surface-container-highest hover:bg-secondary/20 text-secondary flex items-center justify-center shrink-0 transition-transform active:scale-90 shadow-md"
                >
                  <span className="material-symbols-outlined text-[24px]">volume_up</span>
                </button>
              </div>

              {/* Word Translation Banner */}
              <div className="bg-surface-container-lowest/80 rounded-xl p-space-md mb-space-lg flex items-center gap-space-md shadow-sm">
                <div className="w-9 h-9 rounded-lg bg-surface-variant text-on-surface flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[20px]">translate</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-sm text-on-surface-variant uppercase">
                    Azərbaycan dilində mənası
                  </span>
                  <span className="text-headline-sm text-on-surface font-bold">
                    {previewCard.meaningAz}
                  </span>
                </div>
              </div>

              {/* Mnemonic Conceptual Core Box */}
              <div className="bg-surface-container-lowest rounded-xl p-space-lg relative overflow-hidden mb-space-lg shadow-inner">
                <div className="flex flex-col gap-space-md">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center gap-space-xs text-primary text-label-sm uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-[16px]">hearing</span>
                      <span>Səs Bənzərliyi Körpüsü</span>
                    </div>
                    <div className="text-body-lg text-on-surface">
                      {previewCard.mnemonicBridgeAz}{" "}
                      <span className="font-bold text-secondary">“{previewCard.mnemonicHookPhrase}”</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-space-xs bg-surface-container-high/60 p-space-md rounded-lg">
                    <div className="flex items-center gap-space-xs text-tertiary text-label-sm uppercase tracking-wider font-bold">
                      <span className="material-symbols-outlined text-[16px]">menu_book</span>
                      <span>Unudulmaz Yaddaş Hekayəsi</span>
                    </div>
                    <p className="text-body-lg text-on-surface leading-relaxed">
                      “{previewCard.mnemonicStoryAz}”
                    </p>
                  </div>

                  {/* Visual Illustration */}
                  <MnemonicIllustration
                    theme={previewCard.visualTheme}
                    word={previewCard.word}
                    hookPhrase={previewCard.mnemonicHookPhrase}
                    title={previewCard.visualSceneTitle}
                    caption={previewCard.visualSceneAz}
                    compact
                  />

                  {/* Contextual Example Sentences & Collocations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="flex flex-col gap-space-xs">
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Nümunə Cümlələr
                      </span>
                      {previewCard.examples.map((ex, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-surface-container/70">
                          <p className="text-body-md text-on-surface italic">“{ex.en}”</p>
                          <p className="text-body-sm text-on-surface-variant mt-0.5">{ex.az}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-space-xs">
                      <span className="text-label-sm text-on-surface-variant uppercase tracking-wider">
                        Söz Birləşmələri
                      </span>
                      {previewCard.collocations.map((col, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-lg bg-surface-container/70 flex items-center justify-between gap-2"
                        >
                          <span className="text-label-md text-secondary font-semibold">{col.phrase}</span>
                          <span className="text-body-sm text-on-surface-variant text-right">{col.az}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Retention Rate Bar */}
              <div className="bg-surface-container-lowest/50 rounded-xl p-space-md mb-space-lg flex flex-col gap-space-xs">
                <div className="flex items-center justify-between text-label-md">
                  <span className="text-on-surface font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
                    Təxmini yadda saxlama dərəcəsi
                  </span>
                  <span className="text-tertiary font-bold text-headline-sm tabular-nums">
                    {previewCard.retentionScore}%
                  </span>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-secondary to-tertiary rounded-full transition-all duration-700"
                    style={{ width: `${previewCard.retentionScore}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons Bar */}
              {!isShowingExample && generatedCard && (
                <div className="flex flex-col sm:flex-row items-center gap-space-sm pt-space-xs">
                  <button
                    type="button"
                    disabled={isSaved}
                    onClick={handleSavePersonal}
                    className="w-full sm:flex-1 h-[52px] rounded-lg bg-primary hover:bg-primary-container text-on-primary-container text-label-lg font-bold flex items-center justify-center gap-space-sm transition-all shadow-md active:scale-[0.98] disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {isSaved ? "bookmark_added" : "bookmark_add"}
                    </span>
                    <span>{isSaved ? "Şəxsi lüğətdə saxlanıldı" : "Lüğətimə yadda saxla"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={isLearned}
                    onClick={handleMarkAsLearned}
                    className="w-full sm:w-auto h-[52px] px-space-lg rounded-lg bg-tertiary-container/25 hover:bg-tertiary-container/40 text-tertiary text-label-lg font-bold flex items-center justify-center gap-space-xs transition-all disabled:opacity-60"
                  >
                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                    <span>{isLearned ? "Öyrənilib" : "Öyrəndim"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full sm:w-auto h-[52px] px-space-lg rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-lg font-semibold flex items-center justify-center gap-space-xs transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    <span>Yeni söz</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Success Toast */}
          {toastMsg && (
            <div className="bg-surface-container-high text-on-surface p-space-md rounded-xl shadow-xl flex items-center justify-between gap-space-md">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-label-lg font-bold">Uğurla tamamlandı!</span>
                  <span className="text-body-sm text-on-surface-variant">{toastMsg}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setToastMsg(null)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
