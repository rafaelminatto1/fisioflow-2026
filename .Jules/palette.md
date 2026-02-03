## 2026-02-03 - Interactive Elements Semantics
**Learning:** Using `div` for interactive elements (like the profile dropdown trigger) creates accessibility barriers, as they are not reachable via keyboard navigation by default.
**Action:** Always use `<button>` for clickable elements that trigger actions or menus. If specific styling is needed, reset the button styles (`bg-transparent`, `border-0`) but keep the semantic tag.
