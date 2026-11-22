import React from "react";
import { VisualTheme } from "../types/vocabulary";

interface MnemonicIllustrationProps {
  theme: VisualTheme;
  word: string;
  hookPhrase: string;
  title: string;
  caption: string;
  compact?: boolean;
}

export const MnemonicIllustration: React.FC<MnemonicIllustrationProps> = ({
  theme,
  word,
  hookPhrase,
  title,
  caption,
  compact = false,
}) => {
  const renderArt = () => {
    switch (theme) {
      case "notebook":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="nbBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#161b2b" />
                <stop offset="55%" stopColor="#25293a" />
                <stop offset="100%" stopColor="#121830" />
              </linearGradient>
              <linearGradient id="nbGlow" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a078ff" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#7bd0ff" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <rect width="360" height="180" fill="url(#nbBg)" />
            <circle cx="285" cy="40" r="70" fill="#a078ff" fillOpacity="0.16" />
            <circle cx="75" cy="145" r="65" fill="#7bd0ff" fillOpacity="0.12" />
            <rect x="108" y="24" width="144" height="128" rx="14" fill="#1a1f30" stroke="#a078ff" strokeOpacity="0.55" strokeWidth="2" />
            <rect x="118" y="34" width="124" height="108" rx="9" fill="#080d1d" />
            <circle cx="108" cy="48" r="5" fill="#7bd0ff" />
            <circle cx="108" cy="74" r="5" fill="#7bd0ff" />
            <circle cx="108" cy="100" r="5" fill="#7bd0ff" />
            <circle cx="108" cy="126" r="5" fill="#7bd0ff" />
            <line x1="134" y1="62" x2="226" y2="62" stroke="#494454" strokeWidth="2" />
            <line x1="134" y1="88" x2="226" y2="88" stroke="#494454" strokeWidth="2" />
            <line x1="134" y1="114" x2="205" y2="114" stroke="#494454" strokeWidth="2" />
            <text x="180" y="79" textAnchor="middle" fill="#d0bcff" fontSize="22" fontWeight="800" letterSpacing="2">
              {hookPhrase.slice(0, 14).toUpperCase()}
            </text>
            <circle cx="272" cy="112" r="20" fill="url(#nbGlow)" stroke="#4ae176" strokeWidth="2" />
            <text x="272" y="118" textAnchor="middle" fill="#4ae176" fontSize="18" fontWeight="800">
              $
            </text>
          </svg>
        );
      case "steering":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="stBg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#0f152a" />
                <stop offset="100%" stopColor="#231c3d" />
              </linearGradient>
            </defs>
            <rect width="360" height="180" fill="url(#stBg)" />
            <circle cx="180" cy="88" r="76" fill="#a078ff" fillOpacity="0.16" />
            <path d="M90 148 Q180 112 270 148" fill="none" stroke="#7bd0ff" strokeOpacity="0.35" strokeWidth="3" />
            <path
              d="M124 88 C124 52, 236 52, 236 88 C236 112, 200 120, 180 102 C160 120, 124 112, 124 88 Z"
              fill="#1a1f30"
              stroke="#d0bcff"
              strokeWidth="6"
            />
            <circle cx="180" cy="84" r="16" fill="#7bd0ff" fillOpacity="0.2" stroke="#7bd0ff" strokeWidth="3" />
            <path d="M138 86 L164 86 M196 86 L222 86 M180 100 L180 124" stroke="#a078ff" strokeWidth="4" strokeLinecap="round" />
            <path d="M242 54 L268 38" stroke="#4ae176" strokeWidth="3" strokeDasharray="4 4" />
          </svg>
        );
      case "bird":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <rect width="360" height="180" fill="#11172d" />
            <circle cx="130" cy="80" r="60" fill="#7bd0ff" fillOpacity="0.13" />
            <circle cx="230" cy="80" r="60" fill="#a078ff" fillOpacity="0.16" />
            <path d="M95 100 Q180 35 265 100 Q220 122 180 112 Q140 122 95 100 Z" fill="#25293a" stroke="#d0bcff" strokeWidth="3" />
            <circle cx="145" cy="68" r="14" fill="#1a1f30" stroke="#7bd0ff" strokeWidth="3" />
            <circle cx="215" cy="68" r="14" fill="#1a1f30" stroke="#4ae176" strokeWidth="3" />
            <path d="M131 68 L116 64 L131 74 Z" fill="#7bd0ff" />
            <path d="M229 68 L244 64 L229 74 Z" fill="#4ae176" />
            <text x="180" y="148" textAnchor="middle" fill="#cbc3d7" fontSize="11" fontWeight="700" letterSpacing="1.5">
              ← {word.toUpperCase()} →
            </text>
          </svg>
        );
      case "statue":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <rect width="360" height="180" fill="#101528" />
            <circle cx="180" cy="76" r="72" fill="#7bd0ff" fillOpacity="0.14" />
            <rect x="135" y="132" width="90" height="26" rx="6" fill="#25293a" stroke="#494454" strokeWidth="2" />
            <path d="M145 132 L152 84 C152 72 208 72 208 84 L215 132 Z" fill="#00a6e0" fillOpacity="0.32" stroke="#7bd0ff" strokeWidth="3" />
            <circle cx="180" cy="54" r="22" fill="#2f3446" stroke="#d0bcff" strokeWidth="3" />
            <line x1="180" y1="78" x2="180" y2="132" stroke="#7bd0ff" strokeWidth="2.5" strokeDasharray="4 4" />
          </svg>
        );
      case "candle":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <rect width="360" height="180" fill="#11162b" />
            <circle cx="180" cy="64" r="68" fill="#4ae176" fillOpacity="0.14" />
            <circle cx="180" cy="64" r="38" fill="#d0bcff" fillOpacity="0.18" />
            <rect x="164" y="84" width="32" height="68" rx="6" fill="#25293a" stroke="#d0bcff" strokeWidth="2.5" />
            <path d="M180 34 C194 52, 194 72, 180 76 C166 72, 166 52, 180 34 Z" fill="#7bd0ff" />
            <path d="M180 46 C186 56, 186 68, 180 71 C174 68, 174 56, 180 46 Z" fill="#4ae176" />
            <path d="M112 64 Q124 48 136 64 Q124 72 112 64 Z" fill="#d0bcff" />
            <path d="M224 52 Q236 36 248 52 Q236 60 224 52 Z" fill="#7bd0ff" />
          </svg>
        );
      case "spring":
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <rect width="360" height="180" fill="#0f1529" />
            <circle cx="180" cy="90" r="74" fill="#4ae176" fillOpacity="0.12" />
            <path
              d="M110 120 C130 48, 165 48, 165 95 C165 135, 195 135, 195 95 C195 48, 230 48, 250 120"
              fill="none"
              stroke="#4ae176"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="250" cy="46" r="14" fill="#d0bcff" fillOpacity="0.25" stroke="#d0bcff" strokeWidth="3" />
            <path d="M250 86 L250 64" stroke="#7bd0ff" strokeWidth="3" strokeDasharray="4 3" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 360 180" className="w-full h-full" aria-hidden="true">
            <defs>
              <linearGradient id="genGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#161b2b" />
                <stop offset="50%" stopColor="#1f2540" />
                <stop offset="100%" stopColor="#0f1529" />
              </linearGradient>
            </defs>
            <rect width="360" height="180" fill="url(#genGrad)" />
            <circle cx="95" cy="50" r="65" fill="#a078ff" fillOpacity="0.18" />
            <circle cx="265" cy="130" r="70" fill="#7bd0ff" fillOpacity="0.15" />
            <rect x="64" y="34" width="232" height="104" rx="16" fill="#080d1d" fillOpacity="0.7" stroke="#d0bcff" strokeOpacity="0.3" strokeWidth="1.5" />
            <text x="180" y="76" textAnchor="middle" fill="#7bd0ff" fontSize="13" fontWeight="700" letterSpacing="2">
              {word.toUpperCase()}
            </text>
            <path d="M140 90 L220 90" stroke="#494454" strokeWidth="1.5" />
            <text x="180" y="114" textAnchor="middle" fill="#d0bcff" fontSize="16" fontWeight="800">
              “{hookPhrase}”
            </text>
          </svg>
        );
    }
  };

  return (
    <div
      className={`relative w-full ${
        compact ? "h-44" : "h-56"
      } rounded-xl overflow-hidden bg-surface-container-lowest group`}
    >
      <div className="w-full h-full transition-transform duration-700 group-hover:scale-105">
        {renderArt()}
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/25 to-transparent pointer-events-none" />
      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container-lowest/85 backdrop-blur-md text-primary text-label-sm font-semibold">
        <span className="material-symbols-outlined text-[15px]">auto_fix_high</span>
        <span>{title || "Mnemonic Vizual Səhnə"}</span>
      </div>
      <div className="absolute bottom-3 left-3 right-3">
        <p className="text-body-sm text-on-surface bg-surface-container-lowest/90 backdrop-blur-md px-3 py-2 rounded-md leading-snug">
          {caption}
        </p>
      </div>
    </div>
  );
};
