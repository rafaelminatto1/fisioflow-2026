## 2024-05-22 - Accessibility Anti-patterns
**Learning:** Found critical accessibility issues where `div` elements with `onClick` are used instead of `<button>`, making them inaccessible to keyboard users (e.g., Profile Menu in Header).
**Action:** Refactor these interactive elements to `<button>` tags, ensuring they have `type="button"`, proper ARIA attributes, and preserve the visual layout using utility classes like `text-left`.
