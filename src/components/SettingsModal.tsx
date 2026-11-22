import React, { useState, useEffect } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  initialView: "settings" | "summary";
  dailyTarget: number;
  todayLearnedCount: number;
  totalLearnedCount: number;
  personalWordsCount: number;
  reviewCount: number;
  lastQuizPercentage: number | null;
  geminiConfigured: boolean | null;
  onClose: () => void;
  onSaveDailyTarget: (target: number) => void;
  onResetAllProgress: () => void;
}

const TARGET_PRESETS = [5, 10, 15, 20, 30];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  initialView,
  dailyTarget,
  todayLearnedCount,
  totalLearnedCount,
  personalWordsCount,
  reviewCount,
  lastQuizPercentage,
  geminiConfigured,
  onClose,
  onSaveDailyTarget,
  onResetAllProgress,
}) => {
  const [targetInput, setTargetInput] = useState(String(dailyTarget));
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    setTargetInput(String(dailyTarget));
    setConfirmReset(false);
  }, [dailyTarget, isOpen]);

  if (!isOpen) return null;

  const parsedTarget = Number(targetInput);
  const isValid = Number.isFinite(parsedTarget) && parsedTarget >= 1 && parsedTarget <= 100;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSaveDailyTarget(Math.round(parsedTarget));
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-2xl bg-surface-container p-space-xl shadow-2xl border border-outline-variant/25 relative">
        <div className="flex items-center justify-between mb-space-lg">
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">
                {initialView === "summary" ? "insights" : "tune"}
              </span>
            </div>
            <div>
              <h2 className="text-headline-md text-on-surface font-bold">
                {initialView === "summary" ? "Öyrənmə Xülasəsi" : "Gündəlik Hədəf və Tənzimləmələr"}
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Bütün məlumatlar brauzerinizdə lokal olaraq saxlanılır
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Bağla"
            className="w-9 h-9 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Summary Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-lg">
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <span className="text-label-sm text-on-surface-variant uppercase block">Öyrənilib</span>
            <span className="text-headline-md text-tertiary font-bold tabular-nums">{totalLearnedCount}</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <span className="text-label-sm text-on-surface-variant uppercase block">Bu gün</span>
            <span className="text-headline-md text-secondary font-bold tabular-nums">
              {todayLearnedCount}/{dailyTarget}
            </span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <span className="text-label-sm text-on-surface-variant uppercase block">Şəxsi söz</span>
            <span className="text-headline-md text-primary font-bold tabular-nums">{personalWordsCount}</span>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3 text-center">
            <span className="text-label-sm text-on-surface-variant uppercase block">Son test</span>
            <span className="text-headline-md text-on-surface font-bold tabular-nums">
              {lastQuizPercentage !== null ? `${lastQuizPercentage}%` : "—"}
            </span>
          </div>
        </div>

        {/* Daily Target Form */}
        <form onSubmit={handleSubmit} className="space-y-space-md">
          <div>
            <label htmlFor="dailyTargetInput" className="block text-label-lg text-on-surface mb-2">
              Gündəlik söz hədəfi (1 – 100)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {TARGET_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setTargetInput(String(preset))}
                  className={`px-3.5 py-1.5 rounded-lg text-label-md transition-all ${
                    Number(targetInput) === preset
                      ? "bg-secondary text-on-secondary font-bold"
                      : "bg-surface-container-high text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {preset} söz
                </button>
              ))}
            </div>
            <input
              id="dailyTargetInput"
              type="number"
              min={1}
              max={100}
              value={targetInput}
              onChange={(e) => setTargetInput(e.target.value)}
              className="w-full h-12 rounded-lg bg-surface-container-low px-4 text-on-surface text-headline-sm focus:outline-none focus:ring-2 focus:ring-secondary"
            />
            {!isValid && (
              <p className="text-body-sm text-error mt-1.5">
                Zəhmət olmasa 1 ilə 100 arasında bir rəqəm daxil edin.
              </p>
            )}
          </div>

          {/* AI Connection Note */}
          <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-sm">
            <span
              className={`material-symbols-outlined text-[20px] mt-0.5 ${
                geminiConfigured === false ? "text-error" : "text-tertiary"
              }`}
            >
              {geminiConfigured === false ? "warning" : "auto_awesome"}
            </span>
            <div className="text-body-sm text-on-surface-variant">
              {geminiConfigured === false
                ? "Serverdə GEMINI_API_KEY təyin edilməyib. AI ilə yeni söz yaratmaq üçün Vercel Environment Variables (və ya Settings > Secrets) bölməsindən açarı əlavə edin."
                : "Gemini AI server üzərindən aktivdir. Bütün yeni sözlər və səviyyə kartları strukturlaşdırılmış JSON ilə yaradılır."}
              {reviewCount > 0 && (
                <span className="block mt-1 text-secondary">
                  Hazırda təkrar siyahısında {reviewCount} söz gözləyir.
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-sm pt-2">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-error-container/40 text-error text-label-md transition-colors"
              >
                Məlumatları sıfırla
              </button>
            ) : (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    onResetAllProgress();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-2 rounded-lg bg-error text-on-error text-label-md font-bold"
                >
                  Təsdiqlə (Sıfırla)
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-2 rounded-lg bg-surface-container-high text-on-surface-variant text-label-md"
                >
                  Ləğv et
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-label-lg"
              >
                Bağla
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary-container font-bold text-label-lg disabled:opacity-40 transition-all"
              >
                Yadda saxla
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
