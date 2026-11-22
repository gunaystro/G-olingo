import React from "react";
import { CefrLevel, NavTab, QuizResult, VocabCard } from "../types/vocabulary";
import { CEFR_LEVEL_META } from "../data/seedVocabulary";
import { speakEnglish } from "../utils/speech";

interface DashboardViewProps {
  allWords: VocabCard[];
  learnedIds: Set<string>;
  reviewIds: Set<string>;
  recentlyLearnedWords: VocabCard[];
  todayLearnedCount: number;
  dailyTarget: number;
  lastQuizResult: QuizResult | null;
  onNavigate: (tab: NavTab) => void;
  onSelectLevel: (level: CefrLevel) => void;
  onOpenWordCard: (wordId: string) => void;
  onOpenTargetModal: () => void;
}

const LEVELS: CefrLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

export const DashboardView: React.FC<DashboardViewProps> = ({
  allWords,
  learnedIds,
  reviewIds,
  recentlyLearnedWords,
  todayLearnedCount,
  dailyTarget,
  lastQuizResult,
  onNavigate,
  onSelectLevel,
  onOpenWordCard,
  onOpenTargetModal,
}) => {
  const dailyPct = Math.min(100, Math.round((todayLearnedCount / Math.max(1, dailyTarget)) * 100));
  const remainingToday = Math.max(0, dailyTarget - todayLearnedCount);
  const ringCircumference = 264;
  const ringOffset = ringCircumference - (ringCircumference * dailyPct) / 100;

  // Featured tip card: pick a card from learned or default to Persevere
  const tipCard =
    recentlyLearnedWords[0] ||
    allWords.find((w) => w.word.toLowerCase() === "persevere") ||
    allWords[0];

  return (
    <div className="flex flex-col w-full gap-space-2xl">
      {/* Hero Banner with Cosmic Ambient Aura */}
      <section className="relative w-full rounded-xl bg-surface-container-low overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/4 w-80 h-80 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-margin-md sm:p-margin-lg lg:p-space-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-space-xl">
          <div className="max-w-2xl flex flex-col gap-space-md">
            <div className="inline-flex items-center gap-space-xs px-space-md py-1 rounded-full bg-surface-container-high w-fit shadow-inner">
              <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
              <span className="text-label-md text-primary font-semibold tracking-wide uppercase">
                Süni İntellekt Dəstəkli Koqnitiv Yaddaş
              </span>
            </div>

            <h1 className="text-[32px] sm:text-display-lg text-on-surface tracking-tight font-extrabold leading-tight">
              Salam! Bu gün yeni sözlər öyrənməyə hazırsan?
            </h1>

            <p className="text-body-lg text-on-surface-variant max-w-xl">
              Sözləri öyrən, assosiasiyalarla yadda saxla! Hər gün kiçik bir addım möhkəm yaddaş yaradır.
            </p>

            {/* CEFR Quick Chips */}
            <div className="pt-space-xs flex flex-wrap items-center gap-space-sm">
              <span className="text-label-md text-on-surface-variant mr-space-xs font-semibold">
                Səviyyələr:
              </span>
              {LEVELS.map((lvl) => {
                const meta = CEFR_LEVEL_META[lvl];
                const chipClass =
                  meta.tone === "tertiary"
                    ? "bg-tertiary/15 text-tertiary hover:bg-tertiary/25"
                    : meta.tone === "secondary"
                    ? "bg-secondary/15 text-secondary hover:bg-secondary/25"
                    : "bg-primary/15 text-primary hover:bg-primary/25";
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => onSelectLevel(lvl)}
                    className={`px-space-md py-1 rounded-full text-label-md font-bold transition-all hover:scale-105 ${chipClass}`}
                  >
                    {meta.shortChipAz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Action Hero Cards Split */}
          <div className="w-full xl:w-auto flex flex-col sm:flex-row items-stretch gap-space-md">
            <button
              type="button"
              onClick={() => onNavigate("test")}
              className="group flex items-center gap-space-md px-space-xl py-space-lg rounded-xl bg-primary text-on-primary text-label-lg font-bold shadow-[0_8px_24px_rgba(160,120,255,0.35)] transition-all duration-200 hover:brightness-110 active:scale-95"
            >
              <div className="w-12 h-12 rounded-lg bg-on-primary/15 flex items-center justify-center transition-transform group-hover:rotate-6">
                <span className="material-symbols-outlined text-[28px]">quiz</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-on-primary">Testə başla</span>
                <span className="text-body-sm text-on-primary/80 font-normal">Assosiasiya sınağı</span>
              </div>
              <span className="material-symbols-outlined text-[22px] ml-auto transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("yeni-soz")}
              className="group flex items-center gap-space-md px-space-xl py-space-lg rounded-xl bg-surface-container-high text-on-surface text-label-lg font-bold transition-all duration-200 hover:bg-surface-bright active:scale-95 shadow-lg"
            >
              <div className="w-12 h-12 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center transition-transform group-hover:scale-110">
                <span className="material-symbols-outlined text-[28px]">add_circle</span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-on-surface">Yeni söz əlavə et</span>
                <span className="text-body-sm text-on-surface-variant font-normal">Şəxsi kartoteka</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Learning Telemetry & Daily Target Hub */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* Daily Progress Hub */}
        <div className="lg:col-span-5 rounded-xl bg-surface-container-low p-space-xl flex flex-col justify-between shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[20px]">track_changes</span>
              </div>
              <span className="text-headline-sm text-on-surface font-bold">Gündəlik Hədəf</span>
            </div>
            <button
              type="button"
              onClick={onOpenTargetModal}
              className="px-space-md py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface text-label-md transition-colors"
            >
              Hədəfi dəyiş
            </button>
          </div>

          <div className="my-space-lg flex items-center justify-between gap-space-md">
            <div className="flex flex-col">
              <span className="text-label-sm text-on-surface-variant uppercase tracking-widest font-semibold">
                Bugünkü Plan
              </span>
              <div className="flex items-baseline gap-space-xs mt-1 tabular-nums">
                <span className="text-display-lg text-on-surface font-black">{todayLearnedCount}</span>
                <span className="text-headline-md text-on-surface-variant font-medium">/ {dailyTarget} söz</span>
              </div>
              <div className="flex items-center gap-space-xs mt-space-sm">
                <span className="inline-flex items-center gap-1 text-tertiary text-label-md font-bold px-2.5 py-0.5 rounded-full bg-tertiary/10">
                  <span className="material-symbols-outlined text-[14px]">task_alt</span>
                  {remainingToday === 0
                    ? "Gündəlik hədəf tamamlandı!"
                    : `Hədəfə ${remainingToday} söz qalıb`}
                </span>
              </div>
            </div>

            {/* SVG Ring Progress */}
            <div className="relative w-32 h-32 flex items-center justify-center flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="9"
                />
                <circle
                  className="text-secondary transition-all duration-500"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="42"
                  stroke="currentColor"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={ringOffset}
                  strokeLinecap="round"
                  strokeWidth="9"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center tabular-nums">
                <span className="text-headline-md text-secondary font-black">{dailyPct}%</span>
                <span className="text-label-sm text-on-surface-variant font-semibold">TAMAM</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-space-xs">
            <div className="flex justify-between text-label-sm text-on-surface-variant tabular-nums">
              <span>{remainingToday === 0 ? "Tamamlandı" : `${remainingToday} söz qalıb`}</span>
              <span className="text-secondary font-semibold">{dailyPct}% nailiyyət</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                style={{ width: `${dailyPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Quick Stats Metric Trio */}
        <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* Metric 1: Total Learned Words */}
          <button
            type="button"
            onClick={() => onNavigate("lugətim")}
            className="text-left rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between shadow-xl hover:bg-surface-container transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">menu_book</span>
            </div>
            <div className="mt-space-lg">
              <span className="text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block">
                Öyrənilən sözlər
              </span>
              <span className="text-display-lg text-on-surface font-extrabold tracking-tight mt-1 block tabular-nums">
                {learnedIds.size}
              </span>
              <div className="mt-space-xs flex items-center gap-1 text-tertiary text-label-md">
                <span className="material-symbols-outlined text-[16px]">auto_stories</span>
                <span>Lüğətimdə saxlanılıb</span>
              </div>
            </div>
          </button>

          {/* Metric 2: Daily Target */}
          <button
            type="button"
            onClick={onOpenTargetModal}
            className="text-left rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between shadow-xl hover:bg-surface-container transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">flag</span>
            </div>
            <div className="mt-space-lg">
              <span className="text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block">
                Gündəlik hədəf
              </span>
              <span className="text-display-lg text-on-surface font-extrabold tracking-tight mt-1 block tabular-nums">
                {todayLearnedCount} / {dailyTarget}
              </span>
              <div className="mt-space-xs flex items-center gap-1 text-secondary text-label-md">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>{remainingToday === 0 ? "Hədəfə çatdın!" : "Dəyişmək üçün kliklə"}</span>
              </div>
            </div>
          </button>

          {/* Metric 3: Last Quiz Result */}
          <button
            type="button"
            onClick={() => onNavigate("test")}
            className="text-left rounded-xl bg-surface-container-low p-space-lg flex flex-col justify-between shadow-xl hover:bg-surface-container transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-tertiary/10 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[26px]">insights</span>
            </div>
            <div className="mt-space-lg">
              <span className="text-label-md text-on-surface-variant font-semibold uppercase tracking-wider block">
                Son test nəticəsi
              </span>
              <span className="text-display-lg text-tertiary font-extrabold tracking-tight mt-1 block tabular-nums">
                {lastQuizResult ? `${lastQuizResult.percentage}%` : "—"}
              </span>
              <div className="mt-space-xs flex items-center gap-1 text-on-surface-variant text-body-sm">
                <span>
                  {lastQuizResult
                    ? `${lastQuizResult.correctCount}/${lastQuizResult.totalQuestions} düzgün cavab`
                    : "Hələ test keçirilməyib"}
                </span>
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* CEFR Vocabulary Levels Grid (3x2 Desktop Layout) */}
      <section className="flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-sm">
          <div>
            <div className="flex items-center gap-space-xs text-primary mb-1">
              <span className="material-symbols-outlined text-[20px]">layers</span>
              <span className="text-label-md uppercase font-bold tracking-widest">
                Səviyyələr Üzrə Tərəqqi
              </span>
            </div>
            <h2 className="text-headline-lg text-on-surface font-bold">
              Avropa Dil Standartları (CEFR)
            </h2>
          </div>
          <span className="text-body-md text-on-surface-variant">
            Hər səviyyə üçün xüsusi seçilmiş və AI ilə genişlənən lüğət ehtiyatı
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
          {LEVELS.map((lvl) => {
            const meta = CEFR_LEVEL_META[lvl];
            const levelWords = allWords.filter((w) => w.level === lvl);
            const levelLearnedCount = levelWords.filter((w) => learnedIds.has(w.id)).length;
            const pct = levelWords.length > 0 ? Math.round((levelLearnedCount / levelWords.length) * 100) : 0;

            const badgeColors =
              meta.tone === "tertiary"
                ? "bg-tertiary/15 text-tertiary"
                : meta.tone === "secondary"
                ? "bg-secondary/15 text-secondary"
                : "bg-primary/15 text-primary";

            const barColor =
              meta.tone === "tertiary"
                ? "bg-tertiary"
                : meta.tone === "secondary"
                ? "bg-secondary"
                : "bg-primary";

            const btnHover =
              meta.tone === "secondary"
                ? "group-hover:bg-secondary group-hover:text-on-secondary"
                : "group-hover:bg-primary group-hover:text-on-primary";

            return (
              <div
                key={lvl}
                className="rounded-xl bg-surface-container-low p-space-xl flex flex-col justify-between shadow-xl hover:bg-surface-container transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-space-md">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center text-headline-md font-black ${badgeColors}`}
                    >
                      {lvl}
                    </div>
                    <div>
                      <h3 className="text-headline-sm text-on-surface font-bold">{meta.labelAz}</h3>
                      <span className="text-body-sm text-on-surface-variant">
                        {levelWords.length} hazır söz
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-label-md font-bold tabular-nums ${
                      pct > 0 ? badgeColors : "bg-surface-container text-on-surface-variant"
                    }`}
                  >
                    {pct}%
                  </span>
                </div>

                <div className="my-space-xl flex flex-col gap-space-xs">
                  <div className="flex justify-between text-label-sm text-on-surface-variant font-medium tabular-nums">
                    <span>Tərəqqi</span>
                    <span className="text-on-surface">
                      {levelLearnedCount} / {levelWords.length} söz
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectLevel(lvl)}
                  className={`w-full py-2.5 rounded-lg bg-surface-container-high text-on-surface text-label-lg font-semibold transition-all flex items-center justify-center gap-space-xs ${btnHover}`}
                >
                  <span>{levelLearnedCount > 0 ? "Davam et" : "Başla"}</span>
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Split Section: Recently Learned Words & Daily Memory Tip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-space-xl">
        {/* Left: Son Öyrənilən Sözlər */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">history_edu</span>
              </div>
              <h2 className="text-headline-md text-on-surface font-bold">Son Öyrənilən Sözlər</h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate("lugətim")}
              className="text-label-lg text-secondary hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Hamısına bax</span>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>

          {recentlyLearnedWords.length === 0 ? (
            <div className="rounded-xl bg-surface-container-low p-space-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-lg">
              <div className="flex items-start gap-space-md">
                <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[24px]">style</span>
                </div>
                <div>
                  <h3 className="text-headline-sm text-on-surface font-bold">
                    Hələ öyrənilmiş söz yoxdur
                  </h3>
                  <p className="text-body-md text-on-surface-variant mt-1">
                    Söz kartlarına keçib bəyəndiyin sözlərdə “Öyrəndim” düyməsini sıx — onlar burada görünəcək.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate("soz-karti")}
                className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-label-lg whitespace-nowrap shrink-0"
              >
                Sözlərə başla
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-space-md">
              {recentlyLearnedWords.slice(0, 4).map((card) => {
                const needsReview = reviewIds.has(card.id);
                return (
                  <div
                    key={card.id}
                    onClick={() => onOpenWordCard(card.id)}
                    className="rounded-xl bg-surface-container-low p-space-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-lg hover:bg-surface-container transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-space-md">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          speakEnglish(card.word);
                        }}
                        title="Tələffüzü dinlə"
                        className="w-12 h-12 rounded-full bg-surface-container-high text-secondary hover:text-on-surface flex items-center justify-center transition-all shadow-md active:scale-90 shrink-0"
                      >
                        <span className="material-symbols-outlined text-[22px]">volume_up</span>
                      </button>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-space-sm flex-wrap">
                          <span className="text-headline-sm text-on-surface font-bold">{card.word}</span>
                          <span className="text-body-sm text-on-surface-variant font-mono">{card.ipa}</span>
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-label-sm font-bold">
                            {card.level}
                          </span>
                        </div>
                        <div className="flex items-center gap-space-xs mt-1 flex-wrap">
                          <span className="text-body-md text-primary font-semibold">{card.meaningAz}</span>
                          <span className="text-on-surface-variant">•</span>
                          <span className="text-body-sm text-on-surface-variant line-clamp-1">
                            {card.mnemonicHookPhrase}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-space-sm self-end sm:self-center shrink-0">
                      {needsReview ? (
                        <span className="px-3 py-1 rounded-lg bg-surface-container text-secondary text-label-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">refresh</span> Təkrar etməli
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-lg bg-surface-container text-tertiary text-label-sm font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">done_all</span> Yadda qaldı
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Günün Məsləhəti */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">lightbulb</span>
            </div>
            <h2 className="text-headline-md text-on-surface font-bold">Günün Məsləhəti</h2>
          </div>

          {tipCard && (
            <div className="relative rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-low p-space-xl flex flex-col justify-between shadow-2xl overflow-hidden">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/20 rounded-full blur-2xl pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/20 text-primary text-label-sm font-bold uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">psychology</span>
                    AI Mnemonik Körpü
                  </span>
                  <span className="text-label-sm text-on-surface-variant">Söz: {tipCard.word}</span>
                </div>

                <div className="rounded-lg bg-surface-container-lowest/80 p-space-md shadow-inner flex flex-col gap-space-xs">
                  <span className="text-label-sm text-secondary font-bold uppercase">
                    Azərbaycanca Assosiasiya:
                  </span>
                  <p className="text-body-md text-on-surface italic">“{tipCard.mnemonicStoryAz}”</p>
                </div>

                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  Sözləri təcrid olunmuş şəkildə əzbərləmək əvəzinə, beyninizdə ana dilinizlə səs oxşarlığı
                  yaradın. Bu koqnitiv bağ xatırlama sürətini qat-qat artırır.
                </p>
              </div>

              <div className="relative z-10 mt-space-lg pt-space-md flex items-center justify-between">
                <div className="flex items-center gap-space-xs text-on-surface-variant text-label-sm">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                  <span>Koqnitiv metod</span>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenWordCard(tipCard.id)}
                  className="text-primary hover:text-on-surface text-label-md font-bold flex items-center gap-1 transition-colors"
                >
                  <span>Kartı aç</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Vocabulary Review / Add Shortcut */}
          <button
            type="button"
            onClick={() => onNavigate("soz-karti")}
            className="text-left rounded-xl bg-surface-container-low hover:bg-surface-container p-space-md flex items-center gap-space-md shadow-md transition-colors"
          >
            <div className="w-14 h-14 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[30px]">extension</span>
            </div>
            <div className="flex flex-col">
              <span className="text-label-md text-on-surface font-bold">Söz Kartları ilə Məşq Et</span>
              <span className="text-body-sm text-on-surface-variant">
                A1-dən C2-yə qədər səviyyə seçib yeni sözlər kəşf et.
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
};
