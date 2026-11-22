---
name: Güolingo EdTech Design System
colors:
  surface: '#0e1323'
  surface-dim: '#0e1323'
  surface-bright: '#34394a'
  surface-container-lowest: '#080d1d'
  surface-container-low: '#161b2b'
  surface-container: '#1a1f30'
  surface-container-high: '#25293a'
  surface-container-highest: '#2f3446'
  on-surface: '#dee1f9'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#dee1f9'
  inverse-on-surface: '#2b3041'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#7bd0ff'
  on-secondary: '#00354a'
  secondary-container: '#00a6e0'
  on-secondary-container: '#00374d'
  tertiary: '#4ae176'
  on-tertiary: '#003915'
  tertiary-container: '#00a74b'
  on-tertiary-container: '#003111'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#c4e7ff'
  secondary-fixed-dim: '#7bd0ff'
  on-secondary-fixed: '#001e2c'
  on-secondary-fixed-variant: '#004c69'
  tertiary-fixed: '#6bff8f'
  tertiary-fixed-dim: '#4ae176'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005321'
  background: '#0e1323'
  on-background: '#dee1f9'
  surface-variant: '#2f3446'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-lg: 1.5rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system establishes a high-performance, dark-mode EdTech experience tailored specifically for Azerbaijani learners mastering English through cognitive associations and AI mnemonics. The aesthetic merges contemporary digital minimalism with ambient neon-accented gamification—evoking focus, cerebral curiosity, and fluid progression without childish visual clutter.

### Brand Tone & Persona
- **Intelligent & Neural:** Translates complex linguistic retention into intuitive, contextual mental hooks (*assosiasiyalarla öyrənmə*).
- **Focused & Immersive:** Deep cosmic obsidian canvases minimize visual fatigue during long micro-learning sessions.
- **Rewarding & Uplifting:** Vibrant luminescence (violet and cyan atmospheric glows) acknowledges achievement, active streaks, and cognitive recall milestones.

### Visual Style
A refined blend of **Modern Dark Surface Tiers** and **Subtle Glassmorphic Luminescence**. Interfaces avoid pure jet black in favor of multi-layered obsidian-navy strata. Foreground interactive items boast micro-transitions (subtle scale-down on active press), hairline translucent borders (`rgba(255, 255, 255, 0.08)`), and soft radial blooms behind active mnemonic modules.

## Colors

The palette is engineered around high legibility, focused contrast ratios (exceeding WCAG AAA for core typography), and dynamic luminescence for AI-driven mnemonic elements.

### Palette Architecture
- **Canvas Base (`#0B1020`):** Ultra-deep navy void providing total screen absorption and baseline contrast.
- **Surface Level 1 (`#131A2E`):** Navigation bars, persistent headers, sub-panel groupings.
- **Surface Level 2 / Card Background (`#19223A`):** Core component canvas for vocabulary decks, definition cards, and lists.
- **Surface Level 3 / Elevated (`#222D4A`):** Modals, dropdown flyouts, active state elevation.
- **Primary Accent (`#8B5CF6`):** Vibrant Violet. Powers primary calls to action, AI associative hooks, streak counters, and neural link tags.
- **Secondary Accent (`#38BDF8`):** Sky Blue. Distinguishes pronunciation phonetics, grammar rule badges, audio playback indicators, and secondary navigation cues.
- **Success (`#22C55E`):** Emerald Green. Instant feedback for correct translation, completed decks, and streak shields.
- **Danger / Error (`#EF4444`):** Ruby Red. Incorrect quiz validation and critical alerts.
- **Text & Borders:**
  - `Text Primary`: `#F8FAFC` (High contrast, headers, active terms).
  - `Text Secondary`: `#94A3B8` (Phonetic keys, Azerbaijani translations, inactive states).
  - `Structural Border`: `rgba(255, 255, 255, 0.08)`.
  - `Active Glow Tint`: `rgba(139, 92, 246, 0.25)` and `rgba(56, 189, 248, 0.20)`.

## Typography

The typography scale utilizes **Inter** across all UI layers. Inter’s robust x-height, open counterforms, and unambiguous diacritic rendering ensure effortless distinction between English target words, IPA phonetic transcriptions, and Azerbaijani grammatical markers (such as *ə, ı, ö, ğ, ç, ş*).

### Rules for Content Hierarchy
- **Vocabulary Target Word (`display-lg` / `headline-lg`):** Weight 800 or 700 in pure `#F8FAFC`. Ensures clear retention at first glance.
- **Phonetic Transcription (`body-sm` / `body-md`):** Color set to secondary Sky Blue (`#38BDF8`) using tabular/monospaced alignment where relevant.
- **Azerbaijani Translation & Context (`body-lg` / `body-md`):** Color set to `#94A3B8` in regular weight to provide contextual grounding without pulling priority from the target word.
- **Level & State Badges (`label-sm`):** Rendered in uppercase 700 weight with wide letter spacing for quick visual triage during rapid flashcard switching.

## Layout & Spacing

The layout model uses a strict 8pt base grid for spacing tokens and an adaptable fluid column grid tailored for high-density mobile viewports while comfortably accommodating tablet and desktop web dashboards.

### Grid & Breakpoints
- **Mobile (< 640px):** Single-column fluid hierarchy. Outer margin `1rem` (16px), column gutter `1rem`. Action buttons anchor to a sticky thumb-zone footer with safe area insets.
- **Tablet (640px - 1024px):** 6-column fluid grid. Outer margin `1.5rem` (24px), gutters `1.25rem`. Two-column flashcard/quiz split layout.
- **Desktop (> 1024px):** 12-column fixed-max grid (max container width: 1200px centered). Margin `2.5rem` (40px), gutters `1.5rem`. Enables persistent left navigation, central mnemonic canvas, and right-hand telemetry/streak sidebar.

### Spacing Philosophy
- `space-xs` (4px) and `space-sm` (8px) govern compact badge padding, icon-to-label gaps, and segmented progress bars.
- `space-md` (16px) defines standard internal card padding, list item gaps, and input field vertical space.
- `space-lg` (24px) isolates mnemonic association groups and primary functional blocks.
- `space-xl` (32px) and `space-2xl` (48px) anchor vertical pacing between distinct quiz phases and dashboard modules.

## Elevation & Depth

Visual hierarchy is constructed through **Tonal Surface Stacking** accented by **Luminescent Glow Borders** rather than conventional pitch-black shadows.

### Elevation Hierarchy
- **Base Level 0 (`#0B1020`):** The structural viewport foundation. Flat, non-reflective.
- **Level 1 (`#131A2E`):** Navigation headers, toolbars, and inactive track regions. Border: `1px solid rgba(255, 255, 255, 0.05)`.
- **Level 2 (`#19223A`):** Standard study cards, word lists, and translation panels. Border: `1px solid rgba(255, 255, 255, 0.08)`. Shadow: `0 4px 20px -2px rgba(0, 0, 0, 0.5)`.
- **Level 3 (`#222D4A`):** Interactive popovers, active quiz option selection, modal dialogues. Border: `1px solid rgba(255, 255, 255, 0.12)`. Shadow: `0 12px 32px -4px rgba(0, 0, 0, 0.7)`.

### Ambient Glow Rules
- **AI Mnemonic Association Glow:** Applied exclusively to the AI associative highlight card. Features a dual-layer contour: `border: 1px solid rgba(139, 92, 246, 0.6)` and `box-shadow: 0 0 24px 0 rgba(139, 92, 246, 0.22), inset 0 0 12px 0 rgba(139, 92, 246, 0.1)`.
- **Sky Blue Interactive Glow:** Applied to audio triggers and current level progress nodes: `box-shadow: 0 0 16px 0 rgba(56, 189, 248, 0.3)`.

## Shapes

The design system maintains a refined, approachable geometry centered on modern squircle aesthetics (Token: `2`, baseline 0.5rem/8px scaling to prominent 1rem/16px and 1.5rem/24px card geometries).

### Shape Allocations
- **Cards & Primary Modules:** Use `rounded-xl` (1.5rem / 24px) for expansive flashcards, mnemonic blocks, and modal containers. This soft curve grounds the dark canvas.
- **Buttons, Form Inputs, & List Rows:** Use `rounded-lg` (1rem / 16px) for tactile affordance.
- **Badges, Pills, & Progress Nodes:** Full pill radius (`9999px`) for CEFR level tags (A1-C2), status markers, and quiz streak counters.

## Components

### 1. Buttons
- **Primary Action (e.g., 'Növbəti', 'Yoxla'):** Background `#8B5CF6`, text `#FFFFFF` (Font weight 600). Height: 52px (mobile touch-friendly). Radius: `rounded-lg`. Active state: `transform: scale(0.98)` with duration `150ms ease-out`. Shadow: `0 4px 14px rgba(139, 92, 246, 0.35)`.
- **Secondary / Ghost Action:** Background `transparent`, border `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. Hover: Background `#19223A`, border-color `#38BDF8`.
- **Audio / Pronounce Button:** Circle or pill button, background `#19223A`, icon color `#38BDF8`, subtle border `1px solid rgba(56, 189, 248, 0.3)`. On click: pulse ring animation.

### 2. The AI Mnemonic Association Card (*Assosiasiya Kartı*)
A dedicated centerpiece card component:
- **Background:** Gradient overlay from `#19223A` to `#222D4A` with a 10% translucent violet radial gradient anchored top-left.
- **Border:** `1px solid rgba(139, 92, 246, 0.5)`.
- **Header:** Features a sparkling AI badge (*Süni İntellekt Mnemonic*) with `#8B5CF6` micro-pill.
- **Visual Association Content:** Prominently contrasts the English keyword with an evocative Azerbaijani phonetic/semantic bridge (e.g., *“Persistent” → “Pəncərəni bağlamaqda təkid edən…”*).
- **Glow:** Constant soft ambient aura: `box-shadow: 0 0 25px rgba(139, 92, 246, 0.18)`.

### 3. Level Badges & Status Pills
- **CEFR Indicators (A1, A2, B1, B2, C1, C2):** Fully rounded pills (`rounded-full`), height 24px, padding `0 10px`, font `label-sm`.
  - Beginner (A1–A2): Emerald tint (`background: rgba(34, 197, 94, 0.12); color: #22C55E; border: 1px solid rgba(34, 197, 94, 0.3)`).
  - Intermediate (B1–B2): Sky Blue tint (`background: rgba(56, 189, 248, 0.12); color: #38BDF8; border: 1px solid rgba(56, 189, 248, 0.3)`).
  - Advanced (C1–C2): Violet tint (`background: rgba(139, 92, 246, 0.12); color: #8B5CF6; border: 1px solid rgba(139, 92, 246, 0.3)`).

### 4. Interactive Quiz Option Rows
- **Idle State:** Background `#19223A`, border `1px solid rgba(255, 255, 255, 0.08)`, text `#F8FAFC`. Radius: `rounded-lg`. Padding: `16px 20px`.
- **Selected State:** Border `1.5px solid #8B5CF6`, background `#222D4A`.
- **Correct State:** Border `1.5px solid #22C55E`, background `rgba(34, 197, 94, 0.12)`, text `#22C55E`.
- **Incorrect State:** Border `1.5px solid #EF4444`, background `rgba(239, 68, 68, 0.12)`, text `#EF4444`.

### 5. Input Fields
- **Container:** Background `#131A2E`, border `1px solid rgba(255, 255, 255, 0.1)`. Height: 52px. Radius: `rounded-lg`.
- **Text:** `#F8FAFC`, placeholder: `#94A3B8`.
- **Focus State:** Border `1px solid #38BDF8`, shadow `0 0 0 3px rgba(56, 189, 248, 0.2)`.

### 6. Progress Indicators
- **Track:** Height 8px, background `#19223A`, radius `9999px`.
- **Indicator Fill:** Dynamic linear gradient from `#8B5CF6` to `#38BDF8` with a rounded head cap.
- **Streak Status Counter:** Flame icon paired with dynamic integer counter inside a `#19223A` chip, border `1px solid rgba(255, 255, 255, 0.08)`.