import React, { useMemo, useState } from "react";
import { NavTab, VocabCard } from "../types/vocabulary";
import { speakEnglish } from "../utils/speech";
import { MnemonicIllustration } from "./MnemonicIllustration";

interface MyVocabularyViewProps {
  allWords: VocabCard[];
  learnedIds: Set<string>;
  reviewIds: Set<string>;
  bookmarkedIds: Set<string>;
  todayLearnedCount: number;
  dailyTarget: number;
  onMarkLearned: (card: VocabCard) => void;
  onMarkReview: (card: VocabCard) => void;
  onToggleBookmark: (wordId: string) => void;
  onOpenFullCard: (wordId: string) => void;
  onNavigate: (tab: NavTab) => void;
}

type FilterMode = "learned" | "personal" | "review" | "A1-A2" | "B1-B2" | "C1-C2" | "all";
type SortMode = "latest" | "alphabetical" | "level";

const LEVEL_ORDER: Record<string, number> = { A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6 };
const PAGE_SIZE = 6;

export const MyVocabularyView: React.FC<MyVocabularyViewProps> = ({
  allWords,
  learnedIds,
  reviewIds,
  bookmarkedIds,
  todayLearnedCount,
  dailyTarget,
  onMarkLearned,
  onMarkReview,
  onToggleBookmark,
  onOpenFullCard,
  onNavigate,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("learned");
  const [sortMode, setSortMode] = useState<SortMode>("latest");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string>("");

  const learnedWords = useMemo(
    () => allWords.filter((w) => learnedIds.has(w.id)),
    [allWords, learnedIds],
  );
  const personalWords = useMemo(
    () => allWords.filter((w) => w.source === "personal"),
    [allWords],
  );
  const reviewWords = useMemo(
    () => allWords.filter((w) => reviewIds.has(w.id)),
    [allWords, reviewIds],
  );

  const filteredWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    let base = allWords;

    if (filterMode === "learned") {
      base = learnedWords;
    } else if (filterMode === "personal") {
      base = personalWords;
    } else if (filterMode === "review") {
      base = reviewWords;
    } else if (filterMode === "A1-A2") {
      base = learnedWords.filter((w) => w.level === "A1" || w.level === "A2");
    } else if (filterMode === "B1-B2") {
      base = learnedWords.filter((w) => w.level === "B1" || w.level === "B2");
    } else if (filterMode === "C1-C2") {
      base = learnedWords.filter((w) => w.level === "C1" || w.level === "C2");
    }

    if (q) {
      base = base.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaningAz.toLowerCase().includes(q) ||
          w.mnemonicHookPhrase.toLowerCase().includes(q),
      );
    }

    const sorted = [...base];
    if (sortMode === "alphabetical") {
      sorted.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sortMode === "level") {
      sorted.sort((a, b) => (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9));
    } else {
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return sorted;
  }, [allWords, learnedWords, personalWords, reviewWords, filterMode, searchQuery, sortMode]);

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paginatedWords = filteredWords.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const activeWord =
    filteredWords.find((w) => w.id === selectedId) ||
    paginatedWords[0] ||
    learnedWords[0] ||
    allWords[0];

  const handleFilterChange = (next: FilterMode) => {
    setFilterMode(next);
    setPage(1);
  };

  return (
    <div className="relative w-full">
      <div className="absolute -top-12 left-1/4 w-96 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Title & Summary Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-xl">
        <div className="space-y-space-xs">
          <div className="flex items-center gap-space-sm">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary/10 text-secondary text-label-sm uppercase tracking-wider font-bold">
              Lüğət Arxivi
            </span>
            <span className="text-on-surface-variant text-label-sm">•</span>
            <span className="text-on-surface-variant text-label-sm uppercase tracking-wider">
              Şəxsi Baza
            </span>
          </div>
          <h1 className="text-display-lg text-on-surface tracking-tight font-extrabold">Lüğətim</h1>
          <p className="text-body-lg text-on-surface-variant max-w-2xl">
            Öyrəndiyin və şəxsi bazana əlavə etdiyin sözləri nəzərdən keçir, axtarış et və assosiativ
            bağlarla möhkəmləndir.
          </p>
        </div>

        {/* Main Batch Actions */}
        <div className="flex items-center gap-space-sm self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={() => onNavigate("test")}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-secondary text-[20px]">quiz</span>
            <span className="text-label-lg">Testə başla</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate("yeni-soz")}
            className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-primary text-on-primary hover:bg-primary-fixed-dim transition-all shadow-[0_4px_16px_rgba(208,188,255,0.25)] active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="text-label-lg font-bold">Yeni söz əlavə et</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-xl">
        {/* KPI 1: Total Learned Words */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Öyrənilən sözlər
            </span>
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            <span className="text-display-lg text-on-surface font-extrabold tracking-tight">
              {learnedWords.length}
            </span>
            <span className="text-label-md text-tertiary font-semibold">söz</span>
          </div>
          <div className="mt-space-sm text-body-sm text-on-surface-variant">
            Yalnız “Öyrəndim” seçilmiş sözlər
          </div>
        </div>

        {/* KPI 2: Personal Words */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Şəxsi sözlərim
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            <span className="text-display-lg text-on-surface font-extrabold tracking-tight">
              {personalWords.length}
            </span>
            <span className="text-label-md text-primary font-semibold">söz</span>
          </div>
          <div className="mt-space-sm text-body-sm text-on-surface-variant">
            AI ilə əlavə edilmiş şəxsi kartlar
          </div>
        </div>

        {/* KPI 3: Review Queue */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Təkrar tələb olunan
            </span>
            <div className="w-8 h-8 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">replay</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            <span className="text-display-lg text-on-surface font-extrabold tracking-tight">
              {reviewWords.length}
            </span>
            <span className="text-label-md text-secondary font-semibold">söz</span>
          </div>
          <div className="mt-space-sm text-body-sm text-secondary">
            “Yenidən bax” işarələnənlər
          </div>
        </div>

        {/* KPI 4: Today Progress */}
        <div className="p-space-lg rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-space-sm">
            <span className="text-label-md text-on-surface-variant uppercase tracking-wider">
              Bugünkü irəliləyiş
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary-container/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">task_alt</span>
            </div>
          </div>
          <div className="flex items-baseline gap-space-xs tabular-nums">
            <span className="text-display-lg text-on-surface font-extrabold tracking-tight">
              {todayLearnedCount}
            </span>
            <span className="text-label-md text-on-surface-variant font-semibold">
              / {dailyTarget} hədəf
            </span>
          </div>
          <div className="mt-space-sm w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-tertiary h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.round((todayLearnedCount / Math.max(1, dailyTarget)) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="p-space-md rounded-xl bg-surface-container-low mb-space-lg space-y-space-md shadow-sm">
        <div className="flex flex-col lg:flex-row items-center gap-space-md">
          <div className="relative w-full lg:flex-1">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              placeholder="İngilis sözü və ya Azərbaycan mənasını axtar..."
              className="w-full bg-surface-container-high text-on-surface placeholder:text-outline pl-11 pr-10 py-3 rounded-lg text-body-md focus:outline-none focus:bg-surface-variant transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-space-xs bg-surface-container-high px-space-md py-2.5 rounded-lg w-full lg:w-auto">
            <span className="material-symbols-outlined text-on-surface-variant text-[18px]">sort</span>
            <span className="text-label-sm text-on-surface-variant uppercase">Sırala:</span>
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-transparent text-label-lg text-on-surface focus:outline-none cursor-pointer flex-1"
            >
              <option className="bg-surface-container text-on-surface" value="latest">
                Ən son əlavə edilənlər
              </option>
              <option className="bg-surface-container text-on-surface" value="alphabetical">
                Əlifba sırası (A–Z)
              </option>
              <option className="bg-surface-container text-on-surface" value="level">
                CEFR səviyyəsinə görə
              </option>
            </select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-space-xs pt-space-xs">
          {(
            [
              { id: "learned", label: `Öyrənilənlər (${learnedWords.length})` },
              { id: "personal", label: `Şəxsi Sözlərim (${personalWords.length})` },
              { id: "review", label: `Təkrar edilməli (${reviewWords.length})` },
              { id: "A1-A2", label: "A1–A2" },
              { id: "B1-B2", label: "B1–B2" },
              { id: "C1-C2", label: "C1–C2" },
              { id: "all", label: `Bütün Baza (${allWords.length})` },
            ] as { id: FilterMode; label: string }[]
          ).map((chip) => {
            const active = filterMode === chip.id;
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleFilterChange(chip.id)}
                className={`px-space-md py-1.5 rounded-full text-label-md transition-all ${
                  active
                    ? "bg-primary text-on-primary font-semibold"
                    : "bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master-Detail Split Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
        {/* Left List */}
        <div className="lg:col-span-7 space-y-space-sm">
          {paginatedWords.length === 0 ? (
            <div className="p-space-xl rounded-xl bg-surface-container-low text-center space-y-space-md">
              <div className="w-12 h-12 rounded-xl bg-primary/15 text-primary flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-[26px]">auto_stories</span>
              </div>
              <h3 className="text-headline-sm text-on-surface font-bold">
                {filterMode === "learned" && !searchQuery
                  ? "Hələ öyrənilmiş söz siyahınız boşdur"
                  : "Axtarışa uyğun söz tapılmadı"}
              </h3>
              <p className="text-body-md text-on-surface-variant max-w-md mx-auto">
                {filterMode === "learned" && !searchQuery
                  ? "Söz Kartları bölməsində istədiyiniz sözü oxuyub “Öyrəndim” düyməsini sıxdıqda burada görünəcək."
                  : "Axtarış sözünü dəyişin və ya digər filtrlərə keçin."}
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onNavigate("soz-karti")}
                  className="px-5 py-2.5 rounded-lg bg-primary text-on-primary font-bold text-label-md"
                >
                  Söz Kartlarına keç
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate("yeni-soz")}
                  className="px-5 py-2.5 rounded-lg bg-surface-container-high text-on-surface text-label-md"
                >
                  Yeni söz əlavə et
                </button>
              </div>
            </div>
          ) : (
            <>
              {paginatedWords.map((item) => {
                const isSelected = activeWord?.id === item.id;
                const isLearned = learnedIds.has(item.id);
                const needsReview = reviewIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`p-space-md rounded-xl transition-all cursor-pointer group relative overflow-hidden ${
                      isSelected
                        ? "bg-surface-container shadow-[0_0_20px_rgba(208,188,255,0.08)]"
                        : "bg-surface-container-low hover:bg-surface-container shadow-sm"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary rounded-l-full" />
                    )}

                    <div className="flex items-start justify-between gap-space-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-space-sm mb-1 flex-wrap">
                          <span className="text-headline-sm text-on-surface font-bold">
                            {item.word}
                          </span>
                          <span className="text-body-sm text-outline-variant font-mono">
                            {item.ipa}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              speakEnglish(item.word);
                            }}
                            title="Tələffüz et"
                            className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-secondary transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">volume_up</span>
                          </button>
                          <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-label-sm font-bold">
                            {item.level}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant text-label-sm">
                            {item.partOfSpeech}
                          </span>
                        </div>

                        <div className="text-body-md text-on-surface font-medium mb-space-sm truncate">
                          {item.meaningAz}
                        </div>

                        <div className="flex flex-wrap items-center gap-space-sm text-body-sm">
                          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-primary/10 text-primary text-label-sm">
                            <span className="material-symbols-outlined text-[14px]">psychology</span>
                            <span>AI: “{item.mnemonicHookPhrase}”</span>
                          </div>
                          {isLearned && (
                            <span className="px-2 py-1 rounded bg-tertiary/10 text-tertiary text-label-sm font-semibold">
                              Öyrənilib
                            </span>
                          )}
                          {needsReview && !isLearned && (
                            <span className="px-2 py-1 rounded bg-secondary/10 text-secondary text-label-sm font-semibold">
                              Təkrar gözləyir
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenFullCard(item.id);
                          }}
                          className="px-2.5 py-1.5 rounded bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface text-label-sm font-semibold transition-colors"
                        >
                          Kartı aç
                        </button>
                        {!isLearned && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onMarkLearned(item);
                            }}
                            className="px-2.5 py-1 rounded bg-tertiary/15 hover:bg-tertiary/25 text-tertiary text-label-sm font-bold transition-colors"
                          >
                            Öyrəndim
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-space-md text-on-surface-variant text-body-sm tabular-nums">
                  <span>
                    Göstərilir: {(safePage - 1) * PAGE_SIZE + 1}–
                    {Math.min(safePage * PAGE_SIZE, filteredWords.length)} / {filteredWords.length} söz
                  </span>
                  <div className="flex items-center gap-space-xs">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-bright disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                      <button
                        key={pNum}
                        type="button"
                        onClick={() => setPage(pNum)}
                        className={`w-8 h-8 rounded-lg text-label-sm font-bold flex items-center justify-center ${
                          pNum === safePage
                            ? "bg-primary text-on-primary"
                            : "bg-surface-container-high hover:bg-surface-bright text-on-surface"
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-bright disabled:opacity-40"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right: Sticky Selected Word Card Preview */}
        {activeWord && (
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-space-md">
            <div className="p-space-lg rounded-2xl bg-surface-container shadow-xl relative overflow-hidden">
              <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary/15 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between mb-space-md pb-space-sm border-b border-outline-variant/20">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">style</span>
                  <span className="text-label-sm uppercase tracking-wider text-on-surface-variant font-bold">
                    Seçilmiş Sözün Tam Kartı
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleBookmark(activeWord.id)}
                  title="Əlfəcin"
                  className="w-8 h-8 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
                >
                  <span
                    className={`material-symbols-outlined text-[18px] ${
                      bookmarkedIds.has(activeWord.id) ? "text-primary material-symbols-filled" : ""
                    }`}
                  >
                    {bookmarkedIds.has(activeWord.id) ? "bookmark" : "bookmark_border"}
                  </span>
                </button>
              </div>

              <div className="mb-space-lg">
                <div className="flex items-center justify-between gap-space-sm flex-wrap">
                  <h2 className="text-[30px] sm:text-display-lg font-black text-on-surface tracking-tight uppercase">
                    {activeWord.word}
                  </h2>
                  <span className="px-3 py-1 rounded-full bg-secondary/15 text-secondary text-label-md font-bold">
                    {activeWord.level} Səviyyə
                  </span>
                </div>
                <div className="flex items-center gap-space-sm mt-1 text-on-surface-variant flex-wrap">
                  <span className="text-headline-sm font-mono text-secondary">{activeWord.ipa}</span>
                  <button
                    type="button"
                    onClick={() => speakEnglish(activeWord.word)}
                    className="w-9 h-9 rounded-full bg-secondary/10 hover:bg-secondary/20 flex items-center justify-center text-secondary transition-all shadow-[0_0_12px_rgba(56,189,248,0.2)]"
                  >
                    <span className="material-symbols-outlined text-[20px]">volume_up</span>
                  </button>
                  <span className="text-body-md text-outline">• {activeWord.partOfSpeech}</span>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container-high mb-space-md">
                <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
                  Azərbaycan dilində mənası:
                </span>
                <div className="text-headline-sm text-on-surface font-semibold">
                  {activeWord.meaningAz}
                </div>
              </div>

              <div className="mb-space-md">
                <MnemonicIllustration
                  theme={activeWord.visualTheme}
                  word={activeWord.word}
                  hookPhrase={activeWord.mnemonicHookPhrase}
                  title={activeWord.visualSceneTitle}
                  caption={activeWord.visualSceneAz}
                  compact
                />
              </div>

              <div className="p-space-md rounded-xl bg-gradient-to-br from-surface-container-high to-surface-container-highest mb-space-lg relative overflow-hidden shadow-[0_0_24px_0_rgba(139,92,246,0.18)]">
                <div className="flex items-center justify-between mb-space-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                    <span className="text-label-sm uppercase tracking-wider text-primary font-bold">
                      AI Mnemonik Əlaqə & Hekayə
                    </span>
                  </div>
                </div>
                <div className="my-space-sm p-space-sm rounded-lg bg-surface-container-lowest/70">
                  <span className="text-label-sm text-secondary font-bold block mb-0.5">
                    SƏS BƏNZƏRLİYİ:
                  </span>
                  <p className="text-body-md text-on-surface">
                    {activeWord.mnemonicBridgeAz}{" "}
                    <span className="text-secondary font-bold">“{activeWord.mnemonicHookPhrase}”</span>
                  </p>
                </div>
                <p className="text-body-sm text-on-surface-variant leading-relaxed">
                  <strong className="text-on-surface">Hekayə:</strong> {activeWord.mnemonicStoryAz}
                </p>
              </div>

              {activeWord.examples[0] && (
                <div className="space-y-space-xs mb-space-lg">
                  <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block">
                    Nümunə Cümlə:
                  </span>
                  <div className="p-space-sm rounded-lg bg-surface-container-low">
                    <p className="text-body-md text-on-surface italic">“{activeWord.examples[0].en}”</p>
                    <p className="text-body-sm text-on-surface-variant mt-1">
                      ({activeWord.examples[0].az})
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-space-xs pt-space-xs">
                <button
                  type="button"
                  onClick={() => onMarkLearned(activeWord)}
                  className={`py-2.5 px-space-sm rounded-lg text-label-md font-bold flex items-center justify-center gap-1 transition-all ${
                    learnedIds.has(activeWord.id)
                      ? "bg-tertiary/20 text-tertiary"
                      : "bg-tertiary-container text-on-tertiary hover:opacity-90"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  {learnedIds.has(activeWord.id) ? "Öyrənilib" : "Öyrəndim"}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenFullCard(activeWord.id)}
                  className="py-2.5 px-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-md flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                  Tam Kart
                </button>
                <button
                  type="button"
                  onClick={() => onMarkReview(activeWord)}
                  className="py-2.5 px-space-sm rounded-lg bg-secondary text-on-secondary hover:bg-secondary-fixed text-label-md font-bold flex items-center justify-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">replay</span>
                  Təkrarla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
