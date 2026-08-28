# StudioScout AI — Industrial-Grade Light & Dark Theme Architecture

StudioScout AI features a purpose-built, enterprise-grade theme system inspired by developer and creative software interfaces (Linear, Raycast, Figma, Vercel, GitHub Dark).

---

## 1. Design Philosophy

- **Dark Mode (Cinematic Production Control Room)**:
  - **Canvas Background**: Deep charcoal/graphite (`#0B0F17`).
  - **Surface Cards (Level 1)**: Layered slate (`#131B2B`).
  - **Elevated Sub-Panels (Level 2)**: Crisp elevated graphite (`#1C2940`).
  - **Hover & Active States**: Luminous slate (`#243452`).
  - **Borders**: Refined, low-contrast dark slate (`#334155` / `rgba(255,255,255,0.08)`).
  - **Typography**: Soft off-white headlines (`#F8FAFC`), muted secondary slate (`#CBD5E1`), metadata slate (`#94A3B8`).
  - **Disciplined Accents**:
    - **Violet (`#A78BFA` / `#8B5CF6`)**: Gemini AI intelligence, active tabs, agent nodes.
    - **Yellow/Amber (`#FBBF24`)**: Primary production CTAs, key status indicators, urgent highlights.
    - **Pink/Rose (`#F472B6`)**: VFX concept moodboards, Director of Photography frame tags.
    - **Mint/Emerald (`#34D399`)**: Confirmed locations, available status, schedule blocks.
    - **Cyan/Sky (`#38BDF8`)**: Parallel Search verified live telemetry & radar data.

- **Light Mode (Cinematic Editorial Neo-Brutalist)**:
  - **Canvas Background**: Warm cream (`#FFFDF5`).
  - **Surface Cards**: Pure crisp white (`#FFFFFF`) with 2px ink borders (`#1E293B`) and tactile pop drop shadows (`4px 4px 0px 0px #1E293B`).
  - **Typography**: Deep charcoal (`#1E293B`) with muted slate (`#64748B`).

---

## 2. Semantic Token System

Tokens are declared globally in `frontend/src/index.css` and mapped to Tailwind utilities in `frontend/tailwind.config.js`:

```css
:root,
html[data-theme="light"] {
  --bg-primary: #FFFDF5;
  --bg-secondary: #F8FAFC;
  --bg-surface: #FFFFFF;
  --bg-elevated: #FFFFFF;
  --bg-hover: #F1F5F9;
  --text-primary: #1E293B;
  --text-secondary: #475569;
  --text-muted: #64748B;
  --border-color: #1E293B;
  --shadow-pop: 4px 4px 0px 0px #1E293B;
}

html.dark,
html[data-theme="dark"],
:root.dark,
:root[data-theme="dark"],
.dark {
  --bg-primary: #0B0F17;
  --bg-secondary: #0F172A;
  --bg-surface: #131B2B;
  --bg-elevated: #1C2940;
  --bg-hover: #243452;
  --text-primary: #F8FAFC;
  --text-secondary: #CBD5E1;
  --text-muted: #94A3B8;
  --border-color: #334155;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --shadow-pop: 0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
}
```

---

## 3. Three.js 3D Production Map & Hero Synchronization

3D WebGL scenes dynamically update lights, node glow, shaders, and fog without re-rendering or canvas remounting:

1. **`threeTheme.ts`**: Provides `getThreeThemeConfig(resolvedTheme)` with calibrated ambient, key, fill, and directional light intensities.
2. **`ProductionMap3D.tsx`**:
   - Background canvas color (`#0A0E17` in Dark Mode, `#F8FAFC` in Light Mode).
   - Atmospheric depth fog (`fog args={[..., 6, 18]}`).
   - Spatial 3D floor grid (`gridHelper args={[24, 24, '#1E293B', '#0D1424']}`).
   - Emissive glowing icosahedron scene nodes and trajectory lines.
3. **`HeroScene.tsx`**:
   - Floating film frame aperture rings and particle field responsive to theme state.

---

## 4. Flash of Unstyled Content (FOUC) Elimination

An inline script in `<head>` of `index.html` resolves the stored theme or `prefers-color-scheme` media query synchronously before the first DOM paint:

```html
<script>
  (function() {
    try {
      var stored = localStorage.getItem('studioscout-theme');
      var theme = (stored === 'dark' || stored === 'light' || stored === 'system') ? stored : 'system';
      var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    } catch (e) {}
  })();
</script>
```

---

## 5. Developer Guide: Creating Theme-Aware Components

When creating or modifying components:

1. **Use Semantic Backgrounds**:
   - Application/Page container: `bg-studio-bg`
   - Main card/panel: `bg-studio-surface border-2 border-studio-border`
   - Sub-panel/form input: `bg-studio-elevated` or `bg-studio-bg`
2. **Use Semantic Text Classes**:
   - Headlines: `text-studio-text`
   - Subtitles/labels: `text-studio-muted`
   - Subtle tags: `text-studio-dim`
3. **Use Pop Buttons**:
   - Primary action: `btn-candy`
   - Secondary action: `btn-secondary`
   - Key CTA: `btn-candy-yellow`
