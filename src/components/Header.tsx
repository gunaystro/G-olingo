import React, { useState } from "react";
import { NavTab } from "../types/vocabulary";

interface HeaderProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  todayLearnedCount: number;
  dailyTarget: number;
  onOpenSettings: () => void;
  onOpenSummary: () => void;
}

const NAV_ITEMS: { id: NavTab; label: string; icon: string }[] = [
  { id: "ana-sehife", label: "Ana səhifə", icon: "home" },
  { id: "lugətim", label: "Lüğətim", icon: "auto_stories" },
  { id: "soz-karti", label: "Söz Kartı", icon: "style" },
  { id: "yeni-soz", label: "Yeni Söz", icon: "add_circle" },
  { id: "test", label: "Test", icon: "quiz" },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  todayLearnedCount,
  dailyTarget,
  onOpenSettings,
  onOpenSummary,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-surface-container-lowest/85 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.25)] border-b border-outline-variant/15">
      <div className="h-20 max-w-7xl mx-auto px-margin-md flex items-center justify-between gap-space-md">
        {/* Brand Zone */}
        <button
          type="button"
          onClick={() => {
            onNavigate("ana-sehife");
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-space-md text-left group shrink-0"
        >
          <div className="w-11 h-11 rounded-xl bg-surface-container-high flex items-center justify-center shadow-[0_0_16px_rgba(139,92,246,0.3)] group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-primary text-[26px]">psychology_alt</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="text-headline-sm text-on-surface tracking-tight font-bold">Güolingo</span>
              <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-label-sm uppercase font-bold tracking-wider">
                AI
              </span>
            </div>
            <span className="text-body-sm text-on-surface-variant truncate hidden sm:block max-w-[260px]">
              Sözləri öyrən, assosiasiyalarla yadda saxla!
            </span>
          </div>
        </button>

        {/* Desktop Nav */}
        <nav
          aria-label="Əsas naviqasiya"
          className="hidden lg:flex items-center gap-space-xs bg-surface-container-low/70 p-1.5 rounded-xl"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={isActive ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
                className={`px-space-md py-space-sm rounded-lg text-label-lg whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-surface-container-high text-secondary font-semibold shadow-[0_0_12px_rgba(123,208,255,0.15)]"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-space-sm sm:gap-space-md shrink-0">
          <button
            type="button"
            onClick={onOpenSettings}
            title="Gündəlik hədəfi dəyiş"
            className="flex items-center gap-space-xs bg-surface-container hover:bg-surface-container-high px-3 sm:px-space-md py-1.5 rounded-full shadow-[0_0_12px_rgba(56,189,248,0.08)] transition-colors"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">task_alt</span>
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider hidden sm:inline">
              Hədəf:
            </span>
            <span className="text-label-lg text-secondary font-bold tabular-nums whitespace-nowrap">
              {todayLearnedCount}/{dailyTarget} Söz
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            title="Tənzimləmələr"
            aria-label="Tənzimləmələr"
            className="w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">settings</span>
          </button>

          <button
            type="button"
            onClick={onOpenSummary}
            title="Öyrənmə xülasəsi"
            aria-label="Öyrənmə xülasəsi"
            className="transition-transform hover:scale-105 hidden sm:flex"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Menyu"
            className="lg:hidden w-9 h-9 rounded-lg bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface"
          >
            <span className="material-symbols-outlined text-[22px]">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Navigation Bar */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-container-low border-t border-outline-variant/20 px-margin-md py-3">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-7xl mx-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-label-md transition-all ${
                    isActive
                      ? "bg-surface-container-high text-secondary font-bold"
                      : "bg-surface-container text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
