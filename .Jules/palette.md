# Palette's Journal - Critical UX/A11y Learnings

## 2024-05-22 - Initial Setup
**Learning:** Establishing a baseline for UX improvements.
**Action:** Will document critical learnings here.

## 2026-02-04 - Accessibility of Navigation Controls
**Learning:** Critical navigation elements (menu toggles, notification bells) were missing ARIA labels. Converting `div` with `onClick` to semantic `<button>` elements provides better keyboard support and accessibility out of the box.
**Action:** Prioritize semantic HTML for interactive elements and audit existing `div` "buttons".
