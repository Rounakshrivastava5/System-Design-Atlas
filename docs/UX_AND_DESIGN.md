# System Design Atlas — UX, Visual Design & Design System

## 1. Design Philosophy & Aesthetic

The **System Design Atlas** follows an engineered, modern, highly legible technical aesthetic inspired by high-end developer developer platforms (Linear, Stripe, Tailwind UI, GitHub Docs).

Key aesthetic principles:
- **Clarity First**: Information density balanced with ample breathing room and structured hierarchies.
- **Engineered Precision**: Crisp borders, subtle glowing accents on active nodes, precise mathematical and architectural notations.
- **Cohesive Dark & Light Modes**: First-class dark mode tailored for long reading sessions and bright, high-contrast light mode for presentation.
- **Tactile Interactivity**: Interactive sliders, toggles, canvas nodes, and simulation buttons respond with smooth transitions, clear active states, and informative tooltips.

---

## 2. Design Tokens & Color Palette

The interface uses semantic CSS variables mapped to Tailwind classes to support instantaneous light and dark theme switching.

### Color Tokens

| Semantic Token | Light Mode Value | Dark Mode Value | Usage |
|----------------|------------------|-----------------|-------|
| `--bg-canvas` | `#F8FAFC` (slate-50) | `#0B0F19` (rich obsidian) | Main page background |
| `--bg-surface` | `#FFFFFF` (white) | `#111827` (gray-900) | Cards, panels, modals |
| `--bg-subtle` | `#F1F5F9` (slate-100) | `#1E293B` (slate-800) | Secondary surfaces, input fills |
| `--border-subtle` | `#E2E8F0` (slate-200) | `#1F2937` (gray-800) | Card borders, dividers |
| `--border-accent` | `#CBD5E1` (slate-300) | `#374151` (gray-700) | Active boundaries, hover states |
| `--text-primary` | `#0F172A` (slate-900) | `#F9FAFB` (gray-50) | Headings, primary content |
| `--text-secondary` | `#475569` (slate-600) | `#9CA3AF` (gray-400) | Subtitles, metadata, captions |
| `--text-muted` | `#94A3B8` (slate-400) | `#6B7280` (gray-500) | Inactive labels, shortcuts |
| `--accent-brand` | `#3B82F6` (blue-500) | `#60A5FA` (blue-400) | Primary links, brand elements |
| `--accent-cyan` | `#06B6D4` (cyan-500) | `#22D3EE` (cyan-400) | Networking & streaming indicators |
| `--accent-emerald` | `#10B981` (emerald-500) | `#34D399` (emerald-400) | Success, healthy servers, correct answers |
| `--accent-amber` | `#F59E0B` (amber-500) | `#FBBF24` (amber-400) | Warnings, high load, degraded states |
| `--accent-rose` | `#EF4444` (rose-500) | `#F87171` (rose-400) | Errors, outages, incorrect answers |
| `--accent-purple` | `#8B5CF6` (violet-500) | `#A78BFA` (violet-400) | Distributed patterns & consensus |

### Typography

- **UI & Prose Font**: System UI sans-serif stack (`Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`) for optimal cross-platform legibility.
- **Code & Numeric Monospace**: `JetBrains Mono`, `Fira Code`, `ui-monospace`, `SFMono-Regular`, `Consolas`, `monospace` for metrics, equations, and code snippets.

---

## 3. Application Shell & Layout Architecture

The application layout comprises three primary zones:

1. **Collapsible Navigation Sidebar (Left, 260px wide)**:
   - Atlas brand badge & version tag (`v1.0.0`).
   - Quick navigation links for the 5 main routes:
     - Dashboard (`/`)
     - Concept Catalog (`/concepts`)
     - Interactive Labs (`/labs`)
     - Architecture Workbench (`/workbench`)
     - Practice Center (`/practice`)
   - Domain Curriculum breakdown section with completion counters (`5/8 completed`).
   - Quick access to User Bookmarks and Saved Architecture count.
   - Collapses to a compact icon-only rail or slide-over drawer on mobile viewports.

2. **Top Navigation & Utility Bar (Sticky Header, 64px height)**:
   - Mobile hamburger toggle button.
   - Dynamic Breadcrumbs tracking active route hierarchy (`Concepts > Storage > LSM Trees`).
   - Global Quick Search Bar (`Cmd+K` / `Ctrl+K` shortcut indicator).
   - Theme toggle button (Dark / Light) with smooth transition.
   - Quick "Learning Progress" pill showing overall percentage.

3. **Main Content Viewport**:
   - Scrollable container with optimized max-width (`max-w-7xl` for catalog and practice; full-width `h-[calc(100vh-64px)]` overflow-hidden for Architecture Workbench).

---

## 4. Component UI Conventions

- **Buttons**:
  - `primary`: Solid brand blue with hover brightness.
  - `secondary`: Subtle slate background with border.
  - `ghost`: Transparent with hover background.
  - `danger`: Muted rose background with high contrast text.
- **Badges**:
  - Domain badges with specific color accents (Fundamentals: Indigo, Scalability: Blue, Storage: Amber, Networking: Cyan, Distributed: Purple, Observability: Emerald).
  - Difficulty badges: Beginner (Emerald), Intermediate (Amber), Advanced (Rose).
- **Interactive Simulation Controls**:
  - Labeled numeric sliders with active value callouts and minimum/maximum constraints.
  - Animated queue representations with item-level status tooltips.
  - "Run Single Tick", "Auto-Run Continuous", and "Reset to Initial State" action bars.
  - Explicit Callout Banner: "Simulation Assumptions & Educational Simplifications" to clarify real-world engineering differences.
- **Global Search Modal (`Cmd+K`)**:
  - Modal overlay with autofocus search input.
  - Instant grouped search results (Concepts, Interactive Labs, Architecture Case Studies, Flashcards).
  - Keyboard navigation (Arrow keys + Enter to navigate, Esc to close).

---

## 5. Accessibility (a11y) & Responsiveness

- All interactive elements possess explicit `aria-label` or visible text labels.
- Focus outlines conform to `:focus-visible` with a 2px high-contrast ring.
- Color contrast meets or exceeds WCAG 2.1 Level AA (minimum 4.5:1 for normal text, 3:1 for large text and interactive components).
- Fully responsive breakpoints:
  - Mobile (<768px): Collapsible mobile drawer, stacked card grids, single-column lab controls.
  - Tablet (768px–1024px): 2-column grids, collapsible secondary sidebar.
  - Desktop (>1024px): 3-column catalog grids, side-by-side lab simulation and metrics viewports.
