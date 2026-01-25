## 2024-05-23 - Interactive Div Anti-Pattern
**Learning:** Found multiple instances of `div` elements with `onClick` handlers used for interactive components (e.g., profile menu trigger). This pattern breaks keyboard accessibility (no Tab focus, no Enter/Space activation) and semantic meaning for screen readers.
**Action:** Always refactor interactive `div`s to `<button type="button">`. Ensure they keep their layout classes (often `text-left` is needed for flex children) and add appropriate ARIA attributes (`aria-expanded`, `aria-haspopup`, `aria-label`).
