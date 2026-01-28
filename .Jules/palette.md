## 2026-01-28 - Semantic Button Refactoring
**Learning:** Found multiple instances of `div` elements with `onClick` handlers used as interactive buttons (e.g., Profile Dropdown). This is an accessibility anti-pattern.
**Action:** When refactoring to `<button>`, ensure to:
1. Use `type="button"`.
2. Add `aria-label` if text is not descriptive enough.
3. Reset styles using `bg-transparent border-none p-0 text-left` to match original design.
4. Replace inner block elements (`div`, `p`) with `span` (and `block` class) to maintain valid HTML semantics.
